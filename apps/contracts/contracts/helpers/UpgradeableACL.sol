// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.9;

import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";

abstract contract UpgradeableACL is IERC1271, Initializable, UUPSUpgradeable, AccessControlEnumerableUpgradeable {
  using ECDSA for bytes32;

  // solhint-disable var-name-mixedcase
  bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
  bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

  modifier authenticate() {
    require(isSenderAllowed(msg.sender), "ACL: sender not allowed");
    _;
  }

  /**
   * @dev Implementation contract to be used for `WalletProxy`.
   * Marks the implementation contract as initialized in the constructor so it cannot be initialized later on.
   */
  constructor() initializer {
    // solhint-disable-previous-line no-empty-blocks
  }

  /**
   * @dev Initializes the ACL, this method can be called only once
   * @param _owner Address that will be granted with the OWNER_ROLE (admin role)
   * @param _guardians Addresses that will be granted with the GUARDIANS_ROLE
   */
  function __UpgradeableACL__init(address _owner, address[] memory _guardians) internal onlyInitializing {
    // solhint-disable-previous-line func-name-mixedcase
    __UUPSUpgradeable_init();
    __AccessControlEnumerable_init();

    // Based on the `AccessControl` module provided by OpenZeppelin: "The `DEFAULT_ADMIN_ROLE` is also its own admin:
    // it has permission to grant and revoke this role. Extra precautions should be taken to secure accounts that
    // have been granted it." Simply to avoid using the default admin role, and use `OWNER_ROLE` instead, we
    // change the admin role of `OWNER_ROLE` to `OWNER_ROLE` instead.
    require(_owner != address(0), "ACL: Owner cannot be zero");
    _setRoleAdmin(OWNER_ROLE, OWNER_ROLE);
    _grantRole(OWNER_ROLE, _owner);

    // Then we set `OWNER_ROLE` as the admin role for `GUARDIAN_ROLE` as well.
    _setRoleAdmin(GUARDIAN_ROLE, OWNER_ROLE);
    for (uint256 i = 0; i < _guardians.length; i++) {
      require(_owner != _guardians[i], "ACL: Owner cannot be guardian");
      _grantRole(GUARDIAN_ROLE, _guardians[i]);
    }
  }

  /**
   * @dev Tells whether the sender is allowed to call grant, revoke, and upgrade functions.
   */
  function isSenderAllowed(address account) public view virtual returns (bool);

  /**
   * @dev Tells the address of the current implementation being proxied
   */
  function getCurrentImplementation() external view returns (address) {
    return _getImplementation();
  }

  /**
   * @dev Tells whether the signature provided is valid for the provided data
   */
  function isValidSignature(bytes32 hash, bytes memory signature) external view override returns (bytes4) {
    require(isOwner(hash.recover(signature)), "ACL: Invalid signature");
    return IERC1271.isValidSignature.selector;
  }

  /**
   * @dev Tells whether an account is owner or not
   */
  function isOwner(address account) public view returns (bool) {
    return hasRole(OWNER_ROLE, account);
  }

  /**
   * @dev Tells the how many owners the wallet has
   */
  function getOwnersCount() external view returns (uint256) {
    return getRoleMemberCount(OWNER_ROLE);
  }

  /**
   * @dev Tells the address of an owner at a particular index
   */
  function getOwner(uint256 index) external view returns (address) {
    return getRoleMember(OWNER_ROLE, index);
  }

  /**
   * @dev Tells the how many guardians the wallet has
   */
  function isGuardian(address account) public view returns (bool) {
    return hasRole(GUARDIAN_ROLE, account);
  }

  /**
   * @dev Tells the how many guardians the wallet has
   */
  function getGuardiansCount() public view returns (uint256) {
    return getRoleMemberCount(GUARDIAN_ROLE);
  }

  /**
   * @dev Tells whether an account is guardian or not
   */
  function getGuardian(uint256 index) external view returns (address) {
    return getRoleMember(GUARDIAN_ROLE, index);
  }

  /**
   * @dev Tells the min number amount of guardians signatures in order for an op to approved
   */
  function getMinGuardiansSignatures() public view returns (uint256) {
    return Math.ceilDiv(getGuardiansCount(), 2);
  }

  /**
   * @dev Grants guardian permissions to an account
   */
  function grantGuardian(address account) external authenticate {
    require(!isOwner(account), "ACL: Owner cannot be guardian");
    _grantRole(GUARDIAN_ROLE, account);
  }

  /**
   * @dev Revokes guardian permissions to an account
   */
  function revokeGuardian(address account) external authenticate {
    _revokeRole(GUARDIAN_ROLE, account);
  }

  /**
   * @dev Transfers owner permissions from the owner at index #0 to another account
   */
  function transferOwner(address account) external authenticate {
    require(account != address(0), "ACL: Owner cannot be zero");
    _revokeRole(OWNER_ROLE, getRoleMember(OWNER_ROLE, 0));
    _grantRole(OWNER_ROLE, account);
  }

  /**
   * @dev Internal function to validate owner's signatures
   */
  function _validateOwnerSignature(
    address signer,
    bytes32 hash,
    bytes memory signature
  ) internal view {
    require(SignatureChecker.isValidSignatureNow(signer, hash, signature), "ACL: Invalid owner sig");
    require(isOwner(signer), "ACL: Signer not an owner");
  }

  /**
   * @dev Internal function to validate guardian's signatures
   */
  function _validateGuardianSignature(
    address signer,
    bytes32 hash,
    bytes memory signature
  ) internal view {
    require(SignatureChecker.isValidSignatureNow(signer, hash, signature), "ACL: Invalid guardian sig");
    require(isGuardian(signer), "ACL: Signer not a guardian");
  }

  /**
   * @dev Upgrades authorization mechanism triggered by `upgradeTo` and `upgradeToAndCall`
   * Reverts if the sender is not the entry point
   */
  function _authorizeUpgrade(address) internal view override authenticate {
    // solhint-disable-previous-line no-empty-blocks
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
   */
  uint256[50] private __gap;
}
