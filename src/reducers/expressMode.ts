import { handleActions } from 'redux-actions'

import { State } from 'types'
import { setExpressMode } from '../actions/expressMode'

const reducer = handleActions<State>({
  [setExpressMode.toString()]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
}, {} as State)

export default reducer
