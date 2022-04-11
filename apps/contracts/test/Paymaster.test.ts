import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

import { deploy } from './utils/helpers/contracts'
import { getSigner } from './utils/helpers/signers'
import { MAX_UINT256 } from './utils/helpers/constants'
import { bn, decimal, fp } from './utils/helpers/numbers'
import { encodePaymasterData, encodePaymasterSignature } from './utils/helpers/encoding'

import Wallet from './utils/models/wallet/Wallet'
import { buildOp } from './utils/types'

describe('Paymaster', () => {
  let paymaster: Wallet, owner: SignerWithAddress

  beforeEach('deploy paymaster', async () => {
    owner = await getSigner()
    paymaster = await Wallet.create({ owner })
  })

  describe('getTokenFee', () => {
    const COST = fp(1)
    const FEE = decimal(3)
    const RATE = decimal(2)

    const itExpressTheRateCorrectly = (tokenDecimals: number, feedDecimals: number) => {
      let token: Contract, feed: Contract

      beforeEach('deploy token and feed', async () => {
        token = await deploy('TokenMock', ['TKN', tokenDecimals])
        feed = await deploy('PriceFeedMock', [feedDecimals, bn(RATE.mul(10**feedDecimals))])
      })

      it(`expresses token rate with ${tokenDecimals} decimals`, async () => {
        // pre-approve tokens since paymaster validation will check that
        const op = buildOp({ sender: owner.address, paymaster: paymaster.address, callData: '0xabcdef1111' })
        await token.connect(owner).approve(paymaster.address, MAX_UINT256)

        const baseFee = bn(FEE.mul(10**tokenDecimals))
        const data = encodePaymasterData(op, baseFee, token, feed)
        const signature = await owner.signMessage(ethers.utils.arrayify((data)))
        op.paymasterData = encodePaymasterSignature(baseFee, token, feed, signature)

        const context = await paymaster.validatePaymasterUserOp(op, COST)
        const results = ethers.utils.defaultAbiCoder.decode(['address', 'address', 'uint256', 'uint256'], context)

        const expectedRate = bn(RATE.mul(10**tokenDecimals))
        expect(results[2]).to.be.equal(expectedRate)
        expect(results[3]).to.be.equal(baseFee)
      })
    }

    context('when the token has 6 decimals', () => {
      const tokenDecimals = 6

      context('when the feed has 6 decimals', () => {
        const feedDecimals = 6

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals)
      })

      context('when the feed has 18 decimals', () => {
        const feedDecimals = 18

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals)
      })

      context('when the feed has 20 decimals', () => {
        const feedDecimals = 20

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals)
      })
    })

    context('when the token has 18 decimals', () => {
      const tokenDecimals = 18

      context('when the feed has 6 decimals', () => {
        const feedDecimals = 6

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals)
      })

      context('when the feed has 18 decimals', () => {
        const feedDecimals = 18

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals)
      })

      context('when the feed has 20 decimals', () => {
        const feedDecimals = 20

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals)
      })
    })

    context('when the token has 20 decimals', () => {
      const tokenDecimals = 20

      context('when the feed has 6 decimals', () => {
        const feedDecimals = 6

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals)
      })

      context('when the feed has 18 decimals', () => {
        const feedDecimals = 18

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals)
      })

      context('when the feed has 20 decimals', () => {
        const feedDecimals = 20

        itExpressTheRateCorrectly(tokenDecimals, feedDecimals)
      })
    })
  })
})
