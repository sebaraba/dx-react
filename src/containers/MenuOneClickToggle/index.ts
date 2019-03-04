import { connect } from 'react-redux'

import MenuOneClickMode, { OwnProps } from 'components/MenuOneClickToggle'
import { State } from '../../types'

const mapStateToProps = (state: State) => {
  return {
    expressMode: state.expressMode,
  }
}

export default connect<OwnProps>(mapStateToProps)(MenuOneClickMode)
