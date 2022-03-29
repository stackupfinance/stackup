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

  // solhint-disable var-name-mixedcase
  bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
  bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
  // solhint-enable var-name-mixedcase

  uint256 public nonce;
  address public entryPoint;

  modifier onlyEntryPoint() {
    require(msg.sender == entryPoint, "Wallet: Not from EntryPoint");
    _;
  }

  /**
   * @dev Implementation contract to be used for `WalletProxy`.
   * Marks the implementation contract as initialized in the constructor so it cannot be initialized later on.
   */
  constructor() initializer {
    // solhint-disable-previous-line no-empty-blocks
  }

  function initialize(
    address _entryPoint,
    address _owner,
    address[] memory _guardians
  ) external initializer {
    __UUPSUpgradeable_init();
    __AccessControlEnumerable_init();

    entryPoint = _entryPoint;

    // Based on the `AccessControl` module provided by OpenZeppelin: "The `DEFAULT_ADMIN_ROLE` is also its own admin:
    // it has permission to grant and revoke this role. Extra precautions should be taken to secure accounts that
    // have been granted it." Simply to avoid using the default admin role, and use `OWNER_ROLE` instead, we
    // change the admin role of `OWNER_ROLE` to `OWNER_ROLE` instead.
    _setRoleAdmin(OWNER_ROLE, OWNER_ROLE);
    _grantRole(OWNER_ROLE, _owner);

    // Then we set `OWNER_ROLE` as admin role for `GUARDIAN_ROLE` as well.
    _setRoleAdmin(GUARDIAN_ROLE, OWNER_ROLE);
    for (uint256 i = 0; i < _guardians.length; i++) {
      _grantRole(GUARDIAN_ROLE, _guardians[i]);
    }
  }

  // solhint-disable-next-line no-empty-blocks
  receive() external payable {}

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

    // Requirements:
    //  1. Sender allowed enough tokens to the paymaster, and it is either not calling approve or increasing allowance
    //  2. It is approving the paymaster with enough tokens
    //  3. Was already approved in previous ops (paymaster fee is set to zero)

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
