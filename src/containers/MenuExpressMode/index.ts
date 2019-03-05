import { connect } from 'react-redux'

import MenuExpressMode, { OwnProps } from 'components/MenuExpressMode'
import { State } from '../../types'

const mapStateToProps = (state: State) => {
  return {
    expressMode: state.expressMode,
  }
}

export default connect<OwnProps>(mapStateToProps)(MenuExpressMode)
