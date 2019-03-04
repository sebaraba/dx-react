import { createAction } from 'redux-actions'
import { State } from 'types'

export const setExpressMode = createAction<Partial<State>>('SET_EXPRESS_MODE')
