// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";

import "./IPaymaster.sol";
import "./PaymasterHelpers.sol";
import "../UserOperation.sol";
import "../helpers/Signatures.sol";
import "../helpers/UpgradeableACL.sol";

contract Paymaster is IPaymaster, UpgradeableACL {
  using ECDSA for bytes32;
  using SafeERC20 for IERC20Metadata;
  using Signatures for UserOperation;
  using PaymasterHelpers for bytes;
  using PaymasterHelpers for PaymasterData;
  using PaymasterHelpers for UserOperation;

  // EntryPoint reference
  address public immutable entryPoint;

  /**
   * @dev Wallet's constructor
   * @param _entryPoint reference that will be hardcoded in the implementation contract
   */
  constructor(address _entryPoint) UpgradeableACL() {
    entryPoint = _entryPoint;
  }

  /**
   * @dev Allows receiving ETH transfers
   */
  receive() external payable {
    // solhint-disable-previous-line no-empty-blocks
  }

  /**
   * @dev Initializes the paymaster, this method can only be called only once
   * @param _owner Address that will be granted with the OWNER_ROLE (admin role)
   * @param _guardians Addresses that will be granted with the GUARDIANS_ROLE
   */
  function initialize(address _owner, address[] memory _guardians) external initializer {
    __UpgradeableACL__init(_owner, _guardians);
  }

  /**
   * @dev Allows only calls from entry point
   */
  function isSenderAllowed(address account) public view override returns (bool) {
    return account == entryPoint;
  }

  /**
   * @dev Verifies the paymaster data and pays the fee if the paymaster considers the operation valid
   * @param op operation to be validated
   * @param cost amount to be paid to the entry point in wei
   * @return context including the payment conditions: sender, token, exchange rate, and fees
   */
  function validatePaymasterUserOp(
    UserOperation calldata op,
    bytes32, /* requestId */
    uint256 cost
  ) external view override returns (bytes memory context) {
    SignatureData memory signatureData = op.decodePaymasterSignature();
    require(signatureData.mode == SignatureMode.owner, "Paymaster: Cannot sign guardian");

    SignatureValue memory signatureValue = signatureData.values[0];
    _validateOwnerSignature(signatureValue.signer, op.encodePaymasterRequest(), signatureValue.signature);

    PaymasterData memory paymasterData = op.decodePaymasterData();
    uint8 decimals = paymasterData.token.decimals();
    uint256 rate = _getTokenExchangeRate(paymasterData.feed, decimals);
    uint256 totalTokenFee = _calcTotalTokenFee(paymasterData.mode, rate, cost, paymasterData.fee);
    require(paymasterData.token.balanceOf(op.sender) >= totalTokenFee, "Paymaster: Not enough balance");

    return op.paymasterContext(paymasterData, rate);
  }

  /**
   * @dev Executes the paymaster's payment conditions
   * @param mode tells whether the op succeeded, reverted, or if the op succeeded but cause the postOp to revert
   * @param context payment conditions signed by the paymaster in `validatePaymasterUserOp`
   * @param cost amount to be paid to the entry point in wei
   */
  function postOp(
    PostOpMode mode,
    bytes calldata context,
    uint256 cost
  ) external override authenticate {
    (mode);
    PaymasterContext memory data = context.decodePaymasterContext();
    uint256 totalTokenFee = _calcTotalTokenFee(data.mode, data.rate, cost, data.fee);
    if (totalTokenFee > 0) data.token.safeTransferFrom(data.sender, address(this), totalTokenFee);
  }

  /**
   * @dev Calculates the total token fees to be paid to cover given costs in wei
   * @param mode paymaster mode info
   * @param rate exchange rate for the token/ETH pair expressed in token's decimals
   * @param cost to be paid in wei
   * @param fee paymaster's flat fee to be paid
   */
  function _calcTotalTokenFee(
    PaymasterMode mode,
    uint256 rate,
    uint256 cost,
    uint256 fee
  ) internal pure returns (uint256) {
    if (mode == PaymasterMode.FREE) return 0;
    if (mode == PaymasterMode.FEE_ONLY) return fee;
    if (mode == PaymasterMode.GAS_ONLY) return (cost * rate) / 1e18;
    return ((cost * rate) / 1e18) + fee;
  }

  /**
   * @dev Tells the exchange rate for the token/ETH pair expressed in token's decimals
   * @param feed Chainlink datafeed
   * @param tokenDecimals Decimals of the token associated to the price feed
   */
  function _getTokenExchangeRate(AggregatorV3Interface feed, uint8 tokenDecimals) internal view returns (uint256) {
    (, int256 priceInt, , , ) = feed.latestRoundData();
    uint256 price = SafeCast.toUint256(priceInt);
    uint8 feedDecimals = feed.decimals();

    // Chainlink data feeds return either 8 or 18 decimals
    return
      tokenDecimals >= feedDecimals
        ? (price * 10**(tokenDecimals - feedDecimals))
        : (price / 10**(feedDecimals - tokenDecimals));
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
   */
  uint256[50] private __gap;
}
