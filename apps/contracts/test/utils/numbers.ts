import { BigNumber } from 'ethers'
import { BigNumberish } from './types'

export const fp = (x: BigNumberish): BigNumber => bn(x).mul(bn(1e18))

export const bn = (x: BigNumberish): BigNumber => {
  if (BigNumber.isBigNumber(x)) return x
  const stringified = parseScientific(x.toString())
  const integer = stringified.split('.')[0]
  return BigNumber.from(integer)
}

function parseScientific(num: string): string {
  // If the number is not in scientific notation return it as it is
  if (!/\d+\.?\d*e[+-]*\d+/i.test(num)) return num

  // Remove the sign
  const numberSign = Math.sign(Number(num))
  num = Math.abs(Number(num)).toString()

  // Parse into coefficient and exponent
  const [coefficient, exponent] = num.toLowerCase().split('e')
  let zeros = Math.abs(Number(exponent))
  const exponentSign = Math.sign(Number(exponent))
  const [integer, decimals] = (coefficient.indexOf('.') != -1 ? coefficient : `${coefficient}.`).split('.')

  if (exponentSign === -1) {
    zeros -= integer.length
    num = zeros < 0
      ? integer.slice(0, zeros) + '.' + integer.slice(zeros) + decimals
      : '0.' + '0'.repeat(zeros) + integer + decimals
  } else {
    if (decimals) zeros -= decimals.length
    num = zeros < 0
      ? integer + decimals.slice(0, zeros) + '.' + decimals.slice(zeros)
      : integer + decimals + '0'.repeat(zeros)
  }

  return numberSign < 0 ? '-' + num : num
}
