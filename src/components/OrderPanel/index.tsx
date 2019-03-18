import React from 'react'

import AuctionContainer from 'components/AuctionContainer'
import AuctionHeader from 'components/AuctionHeader'
import AuctionPriceBar from 'containers/AuctionPriceBar'
import AuctionSellingGetting from 'containers/AuctionSellingGetting'
import ButtonCTA from 'components/ButtonCTA'
import TokenPair from 'containers/TokenPair'
import TokenOverlay from 'containers/TokenOverlay'
import { URLS } from 'globals'
import { Link } from 'react-router-dom'

interface OrderPanelProps {
  sellTokenSymbol: string,
  buyTokenSymbol: string,
  validSellAmount: boolean,
  generatesMGN: boolean,
  overlayOpen: boolean,
  expressMode: boolean
}

class OrderPanel extends React.Component<OrderPanelProps> {
  state = {
      validOrder: false,
    }

  setOrderValidity = (choice: boolean) => this.setState({ validOrder: choice })

  render() {
      const { sellTokenSymbol, buyTokenSymbol, validSellAmount, generatesMGN, overlayOpen } = this.props
      const { validOrder } = this.state
      return (
            <AuctionContainer auctionDataScreen="amount">
                {overlayOpen && <TokenOverlay/>}
                <AuctionHeader backTo="/">
                    Token Pair {sellTokenSymbol || '?'} / {buyTokenSymbol || '?'}
                </AuctionHeader>

                {/* Display 'pair-noMGN' when this pair won't generate MGN tokens (any of the picked token causing this) */}
                {sellTokenSymbol && buyTokenSymbol && !generatesMGN &&
                <div className="pair-noMGN"><strong>Note: </strong>this token pair won't generate MGN tokens. <Link
                    to={URLS.TOKENS + '#what-is-mgn'} target="_blank" rel="noopener noreferrer">Read more</Link></div>}
                {/* END */}

                <TokenPair/>
                <AuctionPriceBar header="Closing Price"/>
                <AuctionSellingGetting onValidityChange={this.setOrderValidity}/>
                {/* TODO: replace onclick with some logic (maybe: "to" prop) */}
                <ButtonCTA
                    className={validOrder ? 'blue' : 'buttonCTA-disabled'}
                    onClick={e => validSellAmount ? console.log('Continuing to wallet') : e.preventDefault()}
                    to={'./wallet'}>
                    {validOrder ? 'Continue to wallet details' : 'Please select amount to deposit'}
                </ButtonCTA>

            </AuctionContainer>
        )
    }
}

export default OrderPanel
