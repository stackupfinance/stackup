// Stackup implementation of an ERC-4337 Wallet with Paymaster
// Based on https://eips.ethereum.org/EIPS/eip-4337

// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";

import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import {IWallet} from "./interface/IWallet.sol";
import {PostOpMode, IPaymaster} from "./interface/IPaymaster.sol";
import {UserOperation} from "./library/UserOperation.sol";
import {WalletUserOperation} from "./library/WalletUserOperation.sol";
import {WalletSignature, WalletSignatureMode} from "./library/WalletSignature.sol";

import "hardhat/console.sol";

contract Wallet is
  IWallet,
  IPaymaster,
  IERC1271,
  Initializable,
  UUPSUpgradeable,
  AccessControlEnumerableUpgradeable
{
  using ECDSA for bytes32;
  using WalletUserOperation for UserOperation;

  // This contract is an implementation for WalletProxy.sol.
  // The following must be followed when updating contract variables:
  // 1. Order and type of variables cannot change.
  // 2. New variables must be added last.
  // 3. Deprecated variables cannot be deleted and should be marked instead.
  uint256 public nonce;
  address public entryPoint;
  bytes32 public OWNER_ROLE; // solhint-disable-line var-name-mixedcase
  bytes32 public GUARDIAN_ROLE; // solhint-disable-line var-name-mixedcase

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() initializer {} // solhint-disable-line no-empty-blocks

  function initialize(
    address _entryPoint,
    address _owner,
    address[] memory _guardians
  ) external initializer {
    __UUPSUpgradeable_init();
    __AccessControlEnumerable_init();

    entryPoint = _entryPoint;

    OWNER_ROLE = keccak256("OWNER_ROLE");
    GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
    _setRoleAdmin(GUARDIAN_ROLE, OWNER_ROLE);
    _grantRole(OWNER_ROLE, _owner);
    for (uint256 i = 0; i < _guardians.length; i++) {
      _grantRole(GUARDIAN_ROLE, _guardians[i]);
    }
  }

  // solhint-disable-next-line no-empty-blocks
  receive() external payable {}

  modifier onlyEntryPoint() {
    require(msg.sender == entryPoint, "Wallet: Not from EntryPoint");
    _;
  }

  // solhint-disable-next-line no-empty-blocks
  function _authorizeUpgrade(address) internal view override onlyEntryPoint {}

  function getCurrentImplementation() public view returns (address) {
    return _getImplementation();
  }

  function validateUserOp(
    UserOperation calldata userOp,
    bytes32 requestId,
    uint256 requiredPrefund
  ) external onlyEntryPoint {
    WalletSignature memory ws = userOp.decodeWalletSignature();

    if (ws.mode == WalletSignatureMode.owner) {
      require(
        hasRole(
          OWNER_ROLE,
          requestId.toEthSignedMessageHash().recover(ws.values[0].signature)
        ),
        "Wallet: Invalid owner sig"
      );
    } else {
      require(
        userOp.isGuardianCallDataOK(requiredPrefund),
        "Wallet: Invalid guardian action"
      );

      require(
        ws.values.length >= Math.ceilDiv(getRoleMemberCount(GUARDIAN_ROLE), 2),
        "Wallet: Insufficient guardians"
      );

      for (uint256 i = 0; i < ws.values.length; i++) {
        require(
          SignatureChecker.isValidSignatureNow(
            ws.values[i].signer,
            requestId.toEthSignedMessageHash(),
            ws.values[i].signature
          ),
          "Wallet: Invalid guardian sig"
        );

        require(
          hasRole(GUARDIAN_ROLE, ws.values[i].signer),
          "Wallet: Not a guardian"
        );
      }
    }
    require(nonce == userOp.nonce, "Wallet: Invalid nonce");

    if (requiredPrefund != 0) {
      // solhint-disable-next-line avoid-low-level-calls
      (bool success, ) = entryPoint.call{value: requiredPrefund}("");
      success;
    }

    nonce++;
  }

  function executeUserOp(
    address to,
    uint256 value,
    bytes calldata data
  ) external onlyEntryPoint {
    // solhint-disable-next-line avoid-low-level-calls
    (bool success, bytes memory result) = to.call{value: value}(data);

    if (!success) {
      // solhint-disable-next-line reason-string
      if (result.length < 68) revert();
      // solhint-disable-next-line no-inline-assembly
      assembly {
        result := add(result, 0x04)
      }
      revert(abi.decode(result, (string)));
    }
  }

  function validatePaymasterUserOp(
    UserOperation calldata userOp,
    uint256 maxcost
  ) external view returns (bytes memory context) {
    require(
      hasRole(OWNER_ROLE, userOp.paymasterSigner()),
      "Paymaster: Invalid signature"
    );
    require(
      (userOp.requiredTokenIsApproved(maxcost) &&
        userOp.tokenAllowanceRemainsOK(maxcost)) ||
        userOp.tokenAllowanceWillBeOK(maxcost) ||
        userOp.requiredTokenIsApprovedInPrevOps(),
      "Paymaster: Not approved"
    );

    return userOp.paymasterContext();
  }

  function postOp(
    PostOpMode mode,
    bytes calldata context,
    uint256 actualGasCost
  ) external onlyEntryPoint {
    // Mode not used for this implementation.
    (mode);

    (
      address sender,
      address erc20Token,
      uint256 exchangeRate,
      uint256 fee
    ) = abi.decode(context, (address, address, uint256, uint256));
    uint256 scaleFactor = 10**IERC20Metadata(erc20Token).decimals();

    IERC20(erc20Token).transferFrom(
      sender,
      address(this),
      ((actualGasCost * exchangeRate * scaleFactor) / (10**18 * scaleFactor)) +
        fee
    );
  }

  function getOwnerCount() external view returns (uint256) {
    return getRoleMemberCount(OWNER_ROLE);
  }

  function getOwner(uint256 index) external view returns (address) {
    return getRoleMember(OWNER_ROLE, index);
  }

  function getGuardianCount() external view returns (uint256) {
    return getRoleMemberCount(GUARDIAN_ROLE);
  }

  function getGuardian(uint256 index) external view returns (address) {
    return getRoleMember(GUARDIAN_ROLE, index);
  }

  function grantGuardian(address guardian) external onlyEntryPoint {
    require(!hasRole(OWNER_ROLE, guardian), "Wallet: Owner cannot be guardian");
    _grantRole(GUARDIAN_ROLE, guardian);
  }

  function revokeGuardian(address guardian) external onlyEntryPoint {
    _revokeRole(GUARDIAN_ROLE, guardian);
  }

  function transferOwner(address newOwner) external onlyEntryPoint {
    _revokeRole(OWNER_ROLE, getRoleMember(OWNER_ROLE, 0));
    _grantRole(OWNER_ROLE, newOwner);
  }

  function isValidSignature(bytes32 hash, bytes memory signature)
    public
    view
    returns (bytes4)
  {
    require(
      hasRole(OWNER_ROLE, hash.recover(signature)),
      "Wallet: Invalid signature"
    );

    return IERC1271.isValidSignature.selector;
  }
}
