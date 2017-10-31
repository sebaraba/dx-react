import React, { Component } from 'react'
import TokenOverlayHeader from '../TokenOverlayHeader'
import TokenList from '../TokenList'
import { code2tokenMap } from 'globals'
import { TokenCode, TokenBalances, TokenMod } from 'types'
import { TokenItemProps } from '../TokenItem'
import { createSelector } from 'reselect'

const filterTokens = createSelector(
  (state: TokenOverlayState, _: TokenOverlayProps) => state.filter.toUpperCase(),
  (_, props) => props.tokenCodeList,
  (filter, codes) => (filter ?
    codes.filter(code => code.includes(filter) || code2tokenMap[code].includes(filter)) :
    codes
  ),
)

export interface TokenOverlayProps {
  tokenCodeList: TokenCode[],
  closeOverlay(): any,
  selectTokenAndCloseOverlay(props: Partial<TokenItemProps>): any,
  tokenBalances: TokenBalances,
  open: boolean,
  mod: TokenMod,
}

interface TokenOverlayState {
  filter: string
}

class TokenOverlay extends Component<TokenOverlayProps, TokenOverlayState> {
  state = {
    filter: '',
  }

  static defaultProps: Partial<TokenOverlayProps> = {
    tokenCodeList: [],
  }

  changeFilter = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({
    filter: e.target.value,
  })

  selectTokenAndCloseOverlay: TokenOverlayProps['selectTokenAndCloseOverlay'] = (tokenProps) => {
    const { selectTokenAndCloseOverlay, mod } = this.props

    selectTokenAndCloseOverlay({ ...tokenProps, mod })
  }


  render() {
    if (!this.props.open) return null

    const { closeOverlay, tokenBalances } = this.props

    const filteredTokens = filterTokens(this.state, this.props)

    return (
      <div className="tokenOverlay">
        <TokenOverlayHeader onChange={this.changeFilter} closeOverlay={closeOverlay} />
        <TokenList tokens={filteredTokens} balances={tokenBalances} onTokenClick={this.selectTokenAndCloseOverlay} />
      </div>
    )
  }
}

export default TokenOverlay
