import { SyntheticEvent } from 'react'
import { connect } from 'react-redux'

import { checkUserStateAndSell, openModal } from 'actions'
import { getProviderName } from 'selectors'

import { RedirectHomeHOC } from 'components/RedirectIf'

import { State } from 'types'
import ExpressModeWalletPanel from '../../components/ExpressModeWalletPanel'

const mapState = (state: State) => {
  const activeProvider = getProviderName(state)
  const { expressMode } = state
  return ({
      activeProvider,
      expressMode,
      sellAmount: state.tokenPair.sellAmount,
    })
}

export default connect(
    mapState,
    { checkUserStateAndSell: (e: SyntheticEvent<HTMLAnchorElement>) => (e.preventDefault(), checkUserStateAndSell()), openModal },
)(RedirectHomeHOC(ExpressModeWalletPanel))
