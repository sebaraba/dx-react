import { promisedContractsMap } from './contracts'
import { DxInteracts, Index } from './types'
import { Account, Balance, TokenPair } from '../types'
import { estimateGas } from '../utils'

let dxInteracts: DxInteracts

export const promisedDxInteracts = async () => {
  if (dxInteracts) return dxInteracts

  dxInteracts = await init()
  return dxInteracts
}

async function init(): Promise<DxInteracts> {
  const { DxInteracts: dxi } = await promisedContractsMap()

  const postSellOrder: DxInteracts['postSellOrder'] = (
        { sell: { address: t1 }, buy: { address: t2 } }: TokenPair,
        amount: Balance,
        index: Index,
        userAccount: Account,
    ) => estimateGas({ cb: dxi.postSellOrder, mainParams: [t1, t2, index, amount], txParams: { from: userAccount } })

  postSellOrder.call = (
        { sell: { address: t1 }, buy: { address: t2 } }: TokenPair,
        amount: Balance,
        index: Index,
        userAccount: Account,
    ) => dxi.postSellOrder.call(t1, t2, index, amount, { from: userAccount })

  postSellOrder.sendTransaction = (
        { sell: { address: t1 }, buy: { address: t2 } }: TokenPair,
        amount: Balance,
        index: Index,
        userAccount: Account,
    ) => estimateGas({ cb: dxi.postSellOrder, mainParams: [t1, t2, index, amount], txParams: { from: userAccount } }, 'sendTransaction')

  return {
      get address() {
          return dxi.address
        },
      postSellOrder,
    }
}
