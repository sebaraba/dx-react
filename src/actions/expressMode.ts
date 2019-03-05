import { createAction } from 'redux-actions'

export const setExpressMode = createAction<{expressMode: boolean}>('SET_EXPRESS_MODE')
