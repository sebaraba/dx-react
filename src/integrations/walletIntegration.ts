import localForage from 'localforage'
import { Store } from 'redux'

import initialize from './initialize'
import {
  registerProvider,
  updateProvider,
  initDutchX,
  updateMainAppState,
  resetMainAppState,
} from 'actions/blockchain'
import { setDefaultTokenList, setCustomTokenList, setIPFSFileHashAndPath, selectTokenPair } from 'actions'

import tokensMap from 'api/apiTesting'
import { promisedIPFS } from 'api/IPFS'
import { checkTokenListJSON } from 'api/utils'
import { getAllTokenDecimals } from 'api'

import { DefaultTokens } from 'api/types'
import { TokenPair } from 'types'
import { ConnectedInterface } from './types'

export default async function walletIntegration(store: Store<any>) {
  const { dispatch, getState } = store
  // wraps actionCreator in dispatch
  const dispatchProviderAction = (actionCreator: any) =>
    async (provider: any, data: any) => dispatch(actionCreator({
      provider,
      ...data,
    }))

  const providerOptions: ConnectedInterface = {
    getState,
    updateProvider: dispatchProviderAction(updateProvider),
    registerProvider: dispatchProviderAction(registerProvider),
    updateMainAppState: dispatchProviderAction(updateMainAppState),
    resetMainAppState: () => dispatch(resetMainAppState()),
  }

  const getDefaultTokens = async () => {
    let [defaultTokens, customTokens, customListHash] = await Promise.all<DefaultTokens, DefaultTokens['elements'], string>([
      localForage.getItem('defaultTokens'),
      localForage.getItem('customTokens'),
      localForage.getItem('customListHash'),
    ])
    const isDefaultTokensAvailable = !!(defaultTokens)
    // IF (!defJSONObj in localForage) return anxo/api/v1/defaultTokens.json
    // ELSE localForage.getItem('defaultTokens')
    if (!isDefaultTokensAvailable) {
      // grab tokens from API
      // TODO: Reinstate line 44 when API is setup
      // const defaultTokens = await fetch('https://dx-services.staging.gnosisdev.com/api/v1/markets').then(res => res.json())
      defaultTokens = await tokensMap()
      // set tokens to localForage
      await localForage.setItem('defaultTokens', defaultTokens)
    }

    const defaultSell = defaultTokens.elements.find(tok => tok.symbol === 'ETH'),
      defaultBuy = defaultTokens.elements.find(tok => tok.symbol === 'GNO')

    // IPFS hash for tokens exists in localForage
    if (customListHash) dispatch(setIPFSFileHashAndPath({ fileHash: customListHash }))

    if (customTokens) {
      const customTokensWithDecimals = await getAllTokenDecimals(customTokens)

      // reset localForage customTokens w/decimals filled in
      localForage.setItem('customTokens', customTokensWithDecimals)
      dispatch(setCustomTokenList({ customTokenList: customTokensWithDecimals }))
    } else if (customListHash) {
      const { ipfsGetAndDecode } = await promisedIPFS
      const fileContent = await ipfsGetAndDecode(customListHash)

      const json = JSON.parse(fileContent)
      await checkTokenListJSON(json)

      const customTokensWithDecimals = await getAllTokenDecimals(json)
      localForage.setItem('customTokens', customTokensWithDecimals)

      dispatch(setCustomTokenList({ customTokenList: customTokensWithDecimals }))
    }
    // set defaulTokenList && setDefaulTokenPair visible when in App
    dispatch(setDefaultTokenList({ defaultTokenList: defaultTokens.elements }))
    dispatch(selectTokenPair({ buy: defaultBuy, sell: defaultSell } as TokenPair))
  }


  try {
    await getDefaultTokens()
    await initialize(providerOptions)
  } catch (error) {
    console.warn('Error in walletIntegrations: ', error.message || error)
  } finally {
    dispatch(initDutchX())
  }
}