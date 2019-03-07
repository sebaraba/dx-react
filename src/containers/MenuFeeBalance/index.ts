import { connect } from 'react-redux'

import MenuFeeBalance from 'components/MenuFeeBalance'

import { State } from 'types'

const mapState = (state: State) => {
  const { blockchain: { currentAccount, feeRatio, mgnSupply }, expressMode: { expressMode } } = state
  return {
      feeRatio,
      mgnSupply,
      showFeeRatio: currentAccount && mgnSupply && (typeof feeRatio === 'number' && feeRatio.toString() !== 'NaN'),
      expressMode,
    }
}

export default connect(mapState)(MenuFeeBalance)
