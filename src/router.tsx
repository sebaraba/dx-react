import React from 'react'
import { ConnectedRouter } from 'connected-react-router'
import { Route, Redirect, StaticRouter, Switch } from 'react-router-dom'
import { History } from 'history'
import { hot } from 'react-hot-loader'

import Header from 'components/Header'
import Footer from 'components/Footer'
import Home from 'containers/Home'
import PageNotFound from 'components/PageNotFound'
import OrderPanel from 'containers/OrderPanel'
import WalletPanel from 'containers/WalletPanel'
import ExpressModeWalletPanel from 'containers/ExpressModeWalletPanel'
import AuctionPanel from 'containers/AuctionPanel'
import ContentPageContainer from 'containers/ContentPages'
import Cookies from 'components/Cookies'
import Imprint from 'components/Imprint'

import GoogleAnalyticsTracking from 'components/GoogleAnalyticsTracking'
import WalletIntegration from 'containers/WalletIntegration'
import AppValidator from 'containers/AppValidator'
import RedirectToDisclaimer from 'containers/RedirectToDisclaimer'
import Disclaimer from 'containers/Disclaimer'
import Terms from 'components/Terms'

import { SHOW_FOOTER_CONTENT } from 'globals'

interface AppRouterProps {
  history: History;
  analytics: boolean;
  disabled?: boolean;
}

// TODO: consider redirecting from inside /order, /wallet, /auction/:nonexistent_addr to root
const withHeaderAndFooter = (Component: React.ComponentClass | React.SFC, headerProps?: { content?: boolean, dumb?: boolean, noMenu?: boolean }, useFooter = true, othProps?: any) => (compProps: any) => (
  <>
    <Header {...headerProps}/>
    <Component {...othProps} {...compProps}/>
    {useFooter && <Footer />}
  </>
)

const HomeWHF = withHeaderAndFooter(Home)
const OrderPanelWHF = withHeaderAndFooter(OrderPanel)
const WalletPanelWHF = withHeaderAndFooter(WalletPanel)
const AuctionPanelWHF = withHeaderAndFooter(AuctionPanel)
const ExpressModeWalletPanelWHF = withHeaderAndFooter(ExpressModeWalletPanel)
// true passed in to show different, solidBackgorund Header
const ContentPageContainerWHF =
  withHeaderAndFooter(ContentPageContainer, { content: true, dumb: true }, SHOW_FOOTER_CONTENT)
const CookiesWHF =
  withHeaderAndFooter(Cookies, { content: true, dumb: true }, SHOW_FOOTER_CONTENT)
const ImprintWHF =
  withHeaderAndFooter(Imprint as any, { content: true, dumb: true }, SHOW_FOOTER_CONTENT)
const TermsWHF =
  withHeaderAndFooter(Terms, { content: true, dumb: true }, SHOW_FOOTER_CONTENT)
const FourOhFourWHF =
  withHeaderAndFooter(PageNotFound, { dumb: true }, SHOW_FOOTER_CONTENT)
const HomeClaimOnly = withHeaderAndFooter(Home, { noMenu: true }, false, { claimOnly: true })

const AppRouter: React.SFC<AppRouterProps> = ({ analytics, history, disabled }) => {
  // App is disabled (Geo Block, Net Block etc)
  if (disabled) {
    return (
      <StaticRouter context={{}}>
        <div className="appFlex">
          <Header />
          <Home showPicker/>
        </div>
      </StaticRouter>
    )
  }

  // Render Claim Only version of app
  if (process.env.CLAIM_ONLY) {
    return (
      <ConnectedRouter history={history}>
        <div className="appFlex">
          <RedirectToDisclaimer/>

          <Switch>
            <Route path="/verification" component={Disclaimer} />

            <WalletIntegration>
                <AppValidator>
                  <Switch>
                    <Route
                      exact path="/"
                      component={HomeClaimOnly}
                    />
                    <Redirect to="/" />
                  </Switch>
                </AppValidator>
            </WalletIntegration>
          </Switch>
        </div>
      </ConnectedRouter>
    )
  }
  // Render main App
  return (
    <ConnectedRouter history={history}>
      <div className="appFlex">

        <RedirectToDisclaimer/>
        <Switch>
          {/* DISCONNECTED CONTENT PAGES */}
          <Route path="/verification" component={Disclaimer} />
          <Route path="/cookies" component={CookiesWHF} />

          <Route path="/content/:contentPage" component={ContentPageContainerWHF} />
          <Redirect from="/content" to="/content/HowItWorks" />

          {/* CONNECTED APP */}
          <WalletIntegration>
            <AppValidator>
              <Switch>
                <Route exact path="/" component={HomeWHF} />
                <Route path="/order" component={OrderPanelWHF} />
                <Route path="/wallet" component={WalletPanelWHF} />
                <Route path="/expressWallet" componenet={ExpressModeWalletPanelWHF} />

                {/* TODO: check for valid params.addr and redirect if necessary */}
                <Route path="/auction/:sell-:buy-:index" component={AuctionPanelWHF} />

                <Route path="/imprint" component={ImprintWHF}/>
                <Route path="/terms" component={TermsWHF}/>

                <Route path="/404" component={FourOhFourWHF} />
                <Redirect to="/404" />

              </Switch>
            </AppValidator>
          </WalletIntegration>
        </Switch>

        {analytics && <GoogleAnalyticsTracking />}
      </div>
  </ConnectedRouter>
  )
}

export default hot(module)(AppRouter)
