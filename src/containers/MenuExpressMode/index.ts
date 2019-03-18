import { connect } from 'react-redux'

import MenuExpressMode from 'components/MenuExpressMode'
import { State } from '../../types'

const mapState = ({ expressMode } : State) => {
  expressMode
}

export default connect(mapState as any)(MenuExpressMode as any)
