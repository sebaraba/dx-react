import { handleActions } from 'redux-actions'

export default handleActions({
  ['SET_EXPRESS_MODE']: (state: any, action: any) => ({
      ...state,
      expressMode: action.payload,
        // [action.payload.expressMode]: !action.payload.expressMode,
    }),
}, {
  expressMode: false,
})
