import React from 'react'

import TokenOverlay from 'containers/TokenOverlay'
import TokenPair from 'containers/TokenPair'
import TokenUpload from 'containers/TokenUpload'
import ButtonCTA from '../ButtonCTA'
import TopAuctions from 'containers/TopAuctions'

export interface TokenPickerProps {
  continueToOrder(): any;
  setTokenListType({}): void;
  to: string;
  needsTokens: boolean;
  showPair: boolean;
  tokensSelected: boolean;
}

const TokenPicker: React.SFC<TokenPickerProps> = ({
  continueToOrder,
  needsTokens,
  to,
  setTokenListType,
  showPair,
  tokensSelected,
}) => (

  <div className="tokenPicker">
    <TokenOverlay />

    {needsTokens && !showPair
      ?
      <TokenUpload />
      :
      <div className="tokenIntro">
        <h2>Pick Token Pair Auction</h2>
        <TokenPair />
        <ButtonCTA className={!tokensSelected ? 'buttonCTA-disabled' : 'blue'} onClick={tokensSelected ? continueToOrder : (e) => e.preventDefault()} to={to}>Specify amount selling</ButtonCTA>
        <a className="showTokenUpload" onClick={(e) => (e.preventDefault(), setTokenListType({ type: 'UPLOAD' }))}>Upload Additional Token List</a>
      </div>
    }

    <TopAuctions />
  </div>
)

export default TokenPicker
