import { ExpressMode } from 'types'
import { createSelector } from 'reselect'

/**
 * sorts pairs by ASC and takes top 5
 * @returns {typeof ratioPairs}
 * @param active
 */
export const getExpressMode = (active: ExpressMode) => {active}

export const setExpressMode = createSelector(
    ({ expressMode }) => expressMode,
    getExpressMode,
)
