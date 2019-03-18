import React, { ComponentClass } from 'react'
import { connect } from 'react-redux'

import Loader from 'components/Loader'

import providerWatcher from 'integrations/providerWatcher'
import Providers from 'integrations/provider'

import { updateMainAppState, resetMainAppState, updateProvider, initApp } from 'actions'

import { State } from 'types'
import { getTokenList } from 'actions'
import { getActiveProvider, getActiveProviderObject } from 'selectors'
import { withRouter } from 'react-router'
import { timeoutCondition } from 'utils'
import { URLS } from 'globals'

const inBrowser = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'

const removeListeners = (listeners: string[], actors: EventListenerOrEventListenerObject[]) => {
  listeners.forEach((l, i) => window.removeEventListener(l, actors[i]))
}

const addListeners = (listeners: string[], actors: EventListenerOrEventListenerObject[]) => {
  listeners.forEach((l, i) => window.addEventListener(l, actors[i]))
}

class AppValidator extends React.Component<any> {
  dataPollerID: any | NodeJS.Timer
  state = {
    online: inBrowser ? navigator.onLine : true,
    loading: false,
    set_up_complete: true,
    error: '',
  }

  async componentDidMount() {
    const { activeProvider, disclaimer_accepted, appLoadBypass } = this.props
    // user has NOT accepted disclaimer, do not load state if user attempts to access some parts of app like Content, Cookies etc
    // user CANNOT get into app as redirect blocks if Disclaimer not accepted
    if (appLoadBypass || !disclaimer_accepted || activeProvider === 'READ_ONLY') return

    try {
      // listens for online/offline status
      addListeners(['online', 'offline'], [this.connect, this.disconnect])

      // fire up app if user is actively connected to internet AND has provider set
      if (this.state.online && activeProvider) {

        // setTimeout condition if loading wallet takes too long
        await Promise.race([
          this.appMountSetup(),
          timeoutCondition(15000, 'Wallet setup timeout. Please try refreshing the page.'),
        ])

        return this.setState({
          loading: false,
          set_up_complete: true,
        })
      }

      return console.warn(`
        App Status: OFFLINE
      `)
    } catch (error) {
      this.setState({
        loading: false,
        set_up_complete: false,
        error,
      })
      if (this.state.online) {
        console.warn('AppValidator mounting error - please make sure your wallet is available and unlocked then refresh the page.')
        console.error(error)
      }
      // start polling for changes
      this.startPolling(10000)
    }
    // If here, no wallets have been detected and app loads in non-provider state
  }

  // removes Listeners and intervals
  componentWillUnmount() {
    removeListeners(['online', 'offline'], [this.connect, this.disconnect])

    clearInterval(this.dataPollerID)
  }

  // Detects any changes in Provider lock status or errors
  componentWillReceiveProps(nextProps: any) {
    const { set_up_complete } = this.state

    if (nextProps.unlocked !== this.props.unlocked) {
      console.log(`
        Wallet lock status change detected.
        Unlocked before?: ${this.props.unlocked}
        Unlocked now?:    ${nextProps.unlocked}
      `)
      // if app mount failed and nextProps detect an unlocked wallet
      // reload the page
      if (!set_up_complete && !this.props.unlocked) {
        // window.location.reload()
        this.setState({ set_up_complete: true })
      }
    }
  }

  // Setup and Validate App
  appMountSetup = async () => {
    const { activeProvider, network, updateMainAppState, updateProvider, resetMainAppState, getTokenList, initApp } = this.props
    const currentProvider = Providers[activeProvider]

    this.setState({ loading: true })

    console.warn(`
      App Status: ONLINE
    `)

    // Grabs network relevant token list
    // Sets available auctions relevant to that list
    await getTokenList(network)
    // Initiate Provider
    await providerWatcher(currentProvider, { updateMainAppState, updateProvider, resetMainAppState })
    // initialise basic user state
    await initApp()

    console.warn(`
    APPVALIDATOR MOUNT FINISHED
    `)

    // start polling for changes and update user state
    return this.startPolling()
  }

  // start Polling on connect
  connect = () => {
    if (!this.state.online) {
      console.log('​Detected new connection')

      this.startPolling()
      return this.setState({ online: true })
    }
  }

  // stop polling on disconnect
  disconnect = () => {
    if (this.state.online) {
      console.log('​Detected connection loss')

      this.stopPolling()
      return this.setState({ online: false })
    }
  }

  startPolling = (pollTime: number = 10000) => {
    const { activeProvider, updateMainAppState, updateProvider, resetMainAppState } = this.props,
      currentProvider = Providers[activeProvider]

    console.log('AppValidator: Polling started')
    return this.dataPollerID = setInterval(() => providerWatcher(currentProvider, { updateMainAppState, updateProvider, resetMainAppState }).catch(console.warn), pollTime)
  }

  stopPolling = () => {
    console.log('AppValidator: Polling stopped')

    clearInterval(this.dataPollerID)
    this.dataPollerID = null
  }

  renderError = () => {
    const { error, loading, online, set_up_complete } = this.state,
      { disclaimer_accepted, expressMode } = this.props

    if (!disclaimer_accepted || loading) return

    return (
      <>
        {process.env.FE_CONDITIONAL_ENV === 'development' && <div className="offlineBanner"><span>ATTENTION: You are in DEVELOPMENT</span></div>}
        {process.env.CLAIM_ONLY && <div className="offlineBanner"><span>ATTENTION: This is a deprecated version of slow.trade. CLAIM ONLY mode is active - for trading on the latest version, please click <a href={`https://${URLS.APP_URLS_PROD.MAIN[0]}`}>here</a>. </span></div>}
        { !online && <div className="offlineBanner"><span>App is currently offline - please your check internet connection and refresh the page </span></div> }
        { (!set_up_complete || !this.props.unlocked) && online && <div className="offlineBanner"><span>{ error ? `App problems detected: ${error}` : 'App problems detected. Please check your provider and refresh the page.' } </span></div> }
        {/* TEMPORARY - TODO: REMOVE */}
        {expressMode && <div className="offlineBanner"><span>ATTENTION: You are in EXPRESS MODE</span></div>}
        <div className="offlineBanner"><span>Withdraw and claim funds from previous versions <a href={`https://${URLS.APP_URLS_PROD.MAIN[1]}`}>here</a></span></div>
      </>
    )
  }

  render() {
    const { loading } = this.state
    return (
      <>
        {this.renderError()}
        {loading
          ?
        <div className="walletChooser"><Loader hasData={false} strokeColor="#fff" strokeWidth={0.35} render={() => null} message="LOADING WALLET ACCOUNT DETAILS..."/></div>
          :
        this.props.children}
      </>
    )
  }
}

const mapState = (state: State) => {
  const activeProvider = getActiveProvider(state)
  const provider = getActiveProviderObject(state)
  const { expressMode: { expressMode } } = state

  return {
    activeProvider,
    appLoadBypass: state.blockchain.appLoadBypass,
    network: provider ? provider.network : 'UNKNOWN NETWORK',
    unlocked: provider && provider.unlocked,
    available: provider && provider.available,

    disclaimer_accepted: state.settings.disclaimer_accepted,
    expressMode,
  }
}

export default withRouter(connect(mapState, {
  getTokenList,
  initApp,
  updateMainAppState,
  updateProvider,
  resetMainAppState,
})(AppValidator) as ComponentClass<any>)
