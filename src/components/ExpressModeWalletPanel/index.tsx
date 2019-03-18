import React from 'react'

import AuctionContainer from 'components/AuctionContainer'
import AuctionHeader from 'components/AuctionHeader'
import AuctionPriceBar from 'containers/AuctionPriceBar'
import AuctionWalletSummary from 'containers/AuctionWalletSummary'
import ButtonCTA from 'components/ButtonCTA'
import AuctionAmountSummary from 'containers/AuctionAmountSummary'

export interface ExpressModeWalletPanelProps {
  activeProvider: string,
  checkUserStateAndSell(): void,
  expressMode: boolean
}

const ExpressModeWalletPanel: React.SFC<ExpressModeWalletPanelProps> = ({ activeProvider, checkUserStateAndSell }) => (
    <AuctionContainer auctionDataScreen="details">
        <AuctionHeader backTo="/order">
            Confirm Deposit Details
        </AuctionHeader>
        <AuctionAmountSummary />
        <AuctionPriceBar header="Price" />
        <AuctionWalletSummary />
        <p>
            When submitting your order, you will be asked to sign transactions with {activeProvider || 'your Wallet provider'}.
            Explanations will be provided with each transaction.
            Upon final confirmation, your deposit will be added on your behalf to the next auction.
            <br/>
            <br/>
            Every auction takes approx. 6 hours.
        </p>
        <ButtonCTA onClick={checkUserStateAndSell}>
            Submit One Click Trade <i className="icon icon-walletOK"></i>
        </ButtonCTA>
    </AuctionContainer>
)

export default ExpressModeWalletPanel
