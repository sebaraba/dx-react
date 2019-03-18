import TruffleContract from 'truffle-contract'
import {
  DXAuction,
  ETHInterface,
  GNOInterface,
  OWLInterface,
  MGNInterface,
  SimpleContract,
  DeployedContract,
  ContractArtifact,
  PriceOracleInterface,
} from './types'
import { Provider } from 'types'
import { contractVersionChecker } from 'utils'
// import { URLS } from 'globals'

const contractNames = [
  'DutchExchange',
  'DutchExchangeProxy',
  'DutchExchangeHelper',
  'TokenFRT',
  'TokenFRTProxy',
  'EtherToken',
  'TokenGNO',
  'TokenOWL',
  'TokenOWLProxy',
  'PriceOracleInterface',

]

// breaks in rinkeby, cancel for now
// if (process.env.FE_CONDITIONAL_ENV === 'development' && URLS.APP_URLS_LOCAL.includes(window.location.hostname)) {
//   if (prompt('Use TokenOMG and RDN? Local network only.', 'USE TEST TOKEN CONTRACTS')) {
//     contractNames.push(
//       'TokenOMG',
//       'TokenRDN',
//     )
//   }
// }

// fill contractsMap from here if available
const filename2ContractNameMap = {
  EtherToken: 'TokenETH',
}

interface ContractsMap {
  DutchExchange:        DXAuction,
  DutchExchangeHelper:  Pick<DXAuction,
    'getRunningTokenPairs' |
    'getIndicesWithClaimableTokensForSellers' |
    'getIndicesWithClaimableTokensForBuyers' |
    'getSellerBalancesOfCurrentAuctions'>
  PriceOracleInterface: PriceOracleInterface,
  TokenMGN:             MGNInterface,
  TokenETH?:            ETHInterface,
  TokenGNO?:            GNOInterface,
  TokenOWL?:            OWLInterface,
  TokenOMG?:            GNOInterface,
  TokenRDN?:            GNOInterface,
}

interface ContractsMapWProxy extends ContractsMap {
  DutchExchangeProxy: DeployedContract,
  TokenOWLProxy: DeployedContract,
  TokenFRTProxy: DeployedContract,
}

let req: any
if (process.env.FE_CONDITIONAL_ENV === 'development') {
  req = require.context(
    '../../build/contracts/',
    false,
    /(DutchExchange|DutchExchangeProxy|DutchExchangeHelper|TokenFRT|TokenFRTProxy|EtherToken|TokenGNO|TokenOWL|TokenOWLProxy|PriceOracleInterface|TokenOMG|TokenRDN)\.json$/,
  )
} else {
  req = require.context(
    '@gnosis.pm/dx-contracts/build/contracts/',
    false,
    /(DutchExchange|DutchExchangeProxy|DutchExchangeHelper|TokenFRT|TokenFRTProxy|EtherToken|TokenGNO|TokenOWL|TokenOWLProxy|PriceOracleInterface)\.json$/,
  )
}
export const HumanFriendlyToken = TruffleContract(require('@gnosis.pm/util-contracts/build/contracts/HumanFriendlyToken.json'))

type TokenArtifact =
  './DutchExchange.json'       |
  './DutchExchangeProxy.json'  |
  './DutchExchangeHelper.json' |
  './TokenFRT.json'            |
  './TokenFRTProxy.json'       |
  './TokenOWL.json'            |
  './TokenOWLProxy.json'       |
  './EtherToken.json'          |
  './TokenGNO.json'            |
  './TokenOMG.json'            |
  './TokenRDN.json'

const reqKeys = req.keys() as TokenArtifact[]
const ContractsArtifacts: ContractArtifact[] = contractNames.map(
  c => {
    if (process.env.FE_CONDITIONAL_ENV === 'production') {
      if (c === 'EtherToken')     return require('@gnosis.pm/util-contracts/build/contracts/EtherToken.json')
      if (c === 'TokenGNO')       return require('@gnosis.pm/gno-token/build/contracts/TokenGNO.json')
      if (c === 'TokenOWLProxy')  return require('@gnosis.pm/owl-token/build/contracts/TokenOWLProxy.json')
      if (c === 'TokenOWL')       return require('@gnosis.pm/owl-token/build/contracts/TokenOWL.json')
    }
    return req(reqKeys.find(key => key === `./${c}.json`))
  },
)

const checkENVAndWriteContractAddresses = async () => {
  // inject network addresses
  const networksUtils = require('@gnosis.pm/util-contracts/networks.json'),
    networksGNO       = require('@gnosis.pm/gno-token/networks.json'),
    networksOWL       = require('@gnosis.pm/owl-token/networks.json'),
    networksDX        = require('@gnosis.pm/dx-contracts/networks.json')

  for (const contrArt of ContractsArtifacts) {
    const { contractName } = contrArt
    // assign networks from the file, overriding from /build/contracts with same network id
    // but keeping local network ids
    Object.assign(
      contrArt.networks,
      networksUtils[contractName],
      networksGNO[contractName],
      networksOWL[contractName],
      networksDX[contractName],
    )
  }

  // in development use different contract addresses
  if (process.env.FE_CONDITIONAL_ENV === 'development' || process.env.USE_DEV_NETWORKS) {
    // from networks-%ENV%.json
    const networksDX    = require('@gnosis.pm/dx-contracts/networks-dev.json')

    for (const contrArt of ContractsArtifacts) {
      const { contractName } = contrArt
      // assign networks from the file, overriding from /build/contracts with same network id
      // but keeping local network ids
      Object.assign(contrArt.networks, networksDX[contractName])
    }
  }

  // in CLAIM_ONLY mode use different contract addresses
  if (process.env.FE_CONDITIONAL_ENV === 'production' && process.env.CLAIM_ONLY) {
    const localForage: any = require('localforage')

    const grabOldDXNetworksAndSet = async () => {
      // Array of old contract addresses
      let ALL_OLD_CONTRACT_ADDRESSES = require('@gnosis.pm/dx-contracts/networks-old.json') || require('../../test/networks-old')

      // ONLY use version < 2 - safety
      ALL_OLD_CONTRACT_ADDRESSES = Object.keys(ALL_OLD_CONTRACT_ADDRESSES)
        .reduce((acc, version) => {
          const major = +version.split('.')[0]
          if (major < 3 && major >= 2) {
            acc[version] = ALL_OLD_CONTRACT_ADDRESSES[version]
            return acc
          }
          return acc
        }, {})

      // throw if ALL_OLD_CONTRACTS doesn't pass above reducer
      if (!Object.keys(ALL_OLD_CONTRACT_ADDRESSES).length) throw new Error('No compatible claimable legacy contracts. Current DutchX protocol contracts likely haven\'t been upgraded')

      // check localForage for saved addresses and default to use
      const [CONTRACT_ADDRESSES_TO_USE] = await Promise.all([
        localForage.getItem('CONTRACT_ADDRESSES_TO_USE'),
        localForage.setItem('ALL_OLD_CONTRACT_ADDRESSES', ALL_OLD_CONTRACT_ADDRESSES),
      ])

      // check if contract addres to use exists OR if the current version of slow.trade is compatible with the version selected
      if (!CONTRACT_ADDRESSES_TO_USE || contractVersionChecker(CONTRACT_ADDRESSES_TO_USE, 3, 2)) {
        // from networks-old - old versions of DX to grab addresses
        const latestVersion = Object.keys(ALL_OLD_CONTRACT_ADDRESSES)[0]
        await Promise.all([
          localForage.setItem('ALL_OLD_CONTRACT_ADDRESSES', ALL_OLD_CONTRACT_ADDRESSES),
          localForage.setItem('CONTRACT_ADDRESSES_TO_USE', ALL_OLD_CONTRACT_ADDRESSES[latestVersion]),
        ])
        return ALL_OLD_CONTRACT_ADDRESSES[latestVersion].contracts
      }

      return CONTRACT_ADDRESSES_TO_USE.contracts
    }

    const networks = await grabOldDXNetworksAndSet()

    for (const contrArt of ContractsArtifacts) {
      const { contractName } = contrArt
      // assign networks from the file, overriding from /build/contracts with same network id
      // but keeping local network ids
      Object.assign(contrArt.networks, networks[contractName])
    }
  }
}

const Contracts: SimpleContract[] = ContractsArtifacts.map(
  art => TruffleContract(art),
)

// name => contract mapping
export const contractsMap = contractNames.reduce((acc, name, i) => {
  acc[filename2ContractNameMap[name] || name] = Contracts[i]
  return acc
}, {}) as {[K in keyof ContractsMapWProxy]: SimpleContract}

export const setProvider = (provider: any) => {
  // Testing:
  // const states = [provider, false]
  // provider = states[Math.round(Math.random())]
  if (!provider) throw new Error('Provider failed to instantiate. Please retry selecting a provider or refreshing the page.')

  return Contracts.concat(HumanFriendlyToken).forEach((contract) => {
    contract.setProvider(provider)
  })
}

const getPromisedIntances = () => Promise.all(Contracts.map(contr => contr.deployed()))

/*
 * CONTRACTS API INITIALISATION CORE LOGIC
 * @contractsAPI          = singleton var OBJECT of deployed contracts
 * @promisedContractsMap  = checks if contractsAPI singleton !== undefined && resolves init() function
 * @init                  = initialisation logic - uses utility functions above to initialise contracts
 */

let contractsAPI: ContractsMap

export const promisedContractsMap = async (provider?: Provider, force?: boolean | 'FORCE') => {
  if (contractsAPI && !force) return contractsAPI

  contractsAPI = await init(provider)
  return contractsAPI
}

async function init(provider: Provider) {
  try {
    // Based on node_env, write addresses of contracts
    // into build/contracts (contract artifacts)
    await checkENVAndWriteContractAddresses()

    // MetaMaskInpageProvider || EthereumProvider etc.
    setProvider(provider)

    const instances = await getPromisedIntances()

  // name => contract instance mapping
  // e.g. TokenETH => deployed TokenETH contract
    const deployedContracts = contractNames.reduce((acc, name, i) => {
      if (name === 'TokenFRT') {
        acc['TokenMGN'] = instances[i]
      } else {
        acc[filename2ContractNameMap[name] || name] = instances[i]
      }
      return acc
    }, {}) as ContractsMapWProxy

    const { address: proxyAddress } = deployedContracts.DutchExchangeProxy
    deployedContracts.DutchExchange = contractsMap.DutchExchange.at<DXAuction>(proxyAddress)

    const { address: owlProxyAddress } = deployedContracts.TokenOWLProxy
    deployedContracts.TokenOWL = contractsMap.TokenOWL.at<OWLInterface>(owlProxyAddress)

    // Set TokenFRT @ TokenFRTProxy address
    const { address: frtProxyAddress } = deployedContracts.TokenFRTProxy
    // @ts-ignore
    deployedContracts.TokenMGN = contractsMap.TokenFRT.at<MGNInterface>(frtProxyAddress)

    // remove Proxy contracts from obj
    delete deployedContracts.DutchExchangeProxy
    delete deployedContracts.TokenOWLProxy
    delete deployedContracts.TokenFRTProxy

    if (process.env.FE_CONDITIONAL_ENV !== 'production') {
      console.debug(deployedContracts)
    }

    console.warn(`
      CONTRACTS API INITIALISED
    `)

    return deployedContracts as ContractsMap
  } catch (err) {
    console.error('Contract initialisation error: ', err + '. Please refresh the page or retry selecting a provider.')
    throw new Error(err + '. Please refresh the page or retry selecting a provider.')
  }
}
