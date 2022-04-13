// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";

import "./IPaymaster.sol";
import "./PaymasterHelpers.sol";
import "../UserOperation.sol";
import "../helpers/UpgradeableACL.sol";

contract Paymaster is IPaymaster, UpgradeableACL {
  using SafeERC20 for IERC20Metadata;
  using PaymasterHelpers for bytes;
  using PaymasterHelpers for PaymasterData;
  using PaymasterHelpers for UserOperation;

  address public entryPoint;

  /**
   * @dev Allows receiving ETH transfers
   */
  receive() external payable {
    // solhint-disable-previous-line no-empty-blocks
  }

  /**
   * @dev Initializes the paymaster, this method can be called only once
   */
  function initialize(
    address _entryPoint,
    address _owner,
    address[] memory _guardians
  ) external initializer {
    __UpgradeableACL__init(_owner, _guardians);
    entryPoint = _entryPoint;
  }

  /**
   * @dev Allows only calls from entry point
   */
  function isSenderAllowed(address account) public view override returns (bool) {
    return account == entryPoint;
  }

  /**
   * @dev Verifies the paymaster data and pays the fee if the paymaster considers the operation valid, options are:
   * 1. Sender allowed enough tokens to the paymaster, and it is either not calling approve or increasing allowance
   * 2. It is approving the paymaster with enough tokens
   * 3. Was already approved in previous ops (paymaster fee is set to zero)
   * @param op operation to be validated
   * @param cost amount to be paid to the entry point in wei
   * @return context including the payment conditions: sender, token, exchange rate, and fees
   */
  function validatePaymasterUserOp(
    UserOperation calldata op,
    bytes32, /* requestId */
    uint256 cost
  ) external view override returns (bytes memory context) {
    require(isOwner(op.paymasterSigner()), "Paymaster: Invalid signature");

    PaymasterData memory paymasterData = op.decodePaymasterData();
    (uint256 rate, uint256 tokenFee) = _getTokenFee(paymasterData, cost);
    require(
      (op.isTokenAllowanceEnough(paymasterData, tokenFee) && op.tokenAllowanceRemainsOK(paymasterData, tokenFee)) ||
        op.tokenAllowanceWillBeOK(paymasterData, tokenFee) ||
        paymasterData.isRequiredTokenApprovedInPrevOps(),
      "Paymaster: Not approved"
    );

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
    uint256 totalCost = ((cost * data.rate) / 1e18) + data.fee;
    if (totalCost > 0) data.token.safeTransferFrom(data.sender, address(this), totalCost);
  }

  /**
   * @dev Computes the total token fees to be paid to cover given costs in wei
   * @param data paymaster information
   * @param cost to be paid in wei
   */
  function _getTokenFee(PaymasterData memory data, uint256 cost) internal view returns (uint256 rate, uint256 fee) {
    uint8 decimals = data.token.decimals();
    rate = _getTokenExchangeRate(data.feed, decimals);
    fee = ((cost * rate) / 1e18) + data.fee;
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
}
