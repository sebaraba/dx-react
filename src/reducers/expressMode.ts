import { handleActions } from 'redux-actions'

import { ExpressMode } from 'types'
import { setExpressMode } from '../actions/expressMode'

export default handleActions<ExpressMode>({
  [setExpressMode.toString()]: (state: any, action: any) => ({
    ...state,
    [action.payload.expressMode]: !action.payload.expressMode,
  }),
}, false)
