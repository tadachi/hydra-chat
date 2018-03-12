import React, { Component } from 'react'
import './App.css'

// Mobx
import { observer } from 'mobx-react'
import store from './store/store';
import { client_id } from './store/store'
import { toJS, } from 'mobx';

// Material-ui
import { MuiThemeProvider } from 'material-ui/styles';
import Grid from 'material-ui/Grid'
import Button from 'material-ui/Button'
import LeftArrow from 'material-ui-icons/KeyboardArrowLeft'
import Refresh from 'material-ui-icons/Refresh'
import IconButton from 'material-ui/IconButton'

//Components
import Login from './components/Login'
import ChannelManager from './components/ChannelManager'
import UserLogo from './components/UserLogo'
import Chat from './components/Chat'

//Utility
import { getParams, removeParams, getBaseUrl } from './utility/utility'
import { jsonToMap } from './utility/JsonMapUtil'
import { LOCAL_STORAGE, CHANNELS, OAUTH } from './utility/localStorageWrapper'
import CONFIG from './config'

@observer // Watches store. when data changes, re-render component.
class App extends Component {
  constructor(props) {
    super(props)

    this.Main = null
    this.ChatComponent = null
  }

  componentDidMount() {
    let oAuth

    // Fix dimensions to window height
    store.updateDimensions(window.innerWidth, window.innerHeight)

    // Change background color of <body>
    document.body.style.backgroundColor = store.theme.palette.background.default

    oAuth = LOCAL_STORAGE.getItem(OAUTH) ? LOCAL_STORAGE.getItem(OAUTH) : getParams(document.location.hash)['access_token']

    if (CONFIG.env === 'production') {
      removeParams()
    }

    if (oAuth) {
      store.setAccessToken(oAuth)
      store.setUserObject().then((response) => {
        store.login().then(() => {
          // Set the components when logged in properly
          this.ChatComponent = <Chat />
          this.Main = <MainLayout ChatComponent={this.ChatComponent} />

          store.updateStreamers().then((streams) => {

            let channelsToJoin = []

            async function process(arr) {
              for (const item of arr) {
                await store.join(item)
              }
            }

            try {
              if (LOCAL_STORAGE.getItem(CHANNELS)) {
                const channels = jsonToMap(LOCAL_STORAGE.getItem(CHANNELS))
                for (const [k, v] of channels.entries()) {
                  if (v.autoJoin === true) {
                    channelsToJoin.push(k)
                  } else {
                    store.addChannel(k)
                  }
                }
                process(channelsToJoin)
              }

            } catch (err) {
              console.log(err)
            }

            this.forceUpdate()
          })
        })
      })
    }

    this.updateStreamersTimerID = setInterval(() => {
      if (store.oAuth) {

        store.updateStreamers().then((streams) => {
          const channels = toJS(store.channels.entries())
          if (streams === undefined) { return }
          for (const [key, value] of channels) {
            const joined = toJS(value).joined
            const autoJoin = toJS(value).autoJoin
            let online = true

            for (const [stream] of streams) {
              if (key === stream) {
                online = true
                break
                // Everything is good
              } else {
                online = false
              }
            }

            // AutoJoin if set to true.
            if (online === true && joined === false && autoJoin === true) {
              store.join(key).then(() => {
                this.forceUpdate()
                console.log(`Auto joined ${key}. joined: ${joined}, autoJoin: ${autoJoin}`)
              })
            }
            // Leave if stream goes offline but autoJoin remains true
            if (online === false && joined === true) {
              store.leave(key).then(() => {
                this.forceUpdate()
                console.log(`Left ${key} due to streamer signing off. online: ${online}, joined: ${toJS(store.channels.get(key).joined)}, autoJoin: ${autoJoin}`)
              })
            }
          }
        })
      }
    },
      120000 // 2 minutes or 120 seconds
    )

  }

  componentWillUnmount() {
    console.log('App unmounted.')
    clearInterval(this.updateStreamersTimerID);
    document.body.style.backgroundColor = null
  }

  render() {
    return (
      <MuiThemeProvider theme={store.theme}>
        <div>
          <div style={{ display: 'none' }}><WindowDimensions /></div>
          {store.oAuth ? this.Main : <LoginLayout />}
        </div>
      </MuiThemeProvider>
    );
  }
}

@observer
class LoginLayout extends Component {

  render() {
    return (
      <Grid style={{
        height: store.height,
        backgroundColor: store.theme.palette.background.default
      }} container alignItems='center' justify='center'>
        <Grid direction='column' style={{ width: 500, height: 500, backgroundColor: store.theme.palette.background.default, }} container alignItems='center' justify='center'>
          <div>
            <img style={{ width: 250, height: 250, margin: '2%' }} src={`${getBaseUrl()}/logo.svg`} alt='logo' />
          </div>
          <div>
            <Login style={{}} client_id={client_id} />
          </div>
        </Grid>
      </Grid>
    )
  }
}

@observer
class MainLayout extends Component {
  render() {
    return (
      <Grid style={{
        backgroundColor: store.theme.palette.background.default,
      }} spacing={0} container>
        {store.drawerOpen ?
          <Grid style={{
            height: store.height,
            minWidth: (store.width < store.widthBreakPoint) ? store.width : store.drawerWidth,
            maxWidth: (store.width < store.widthBreakPoint) ? '100%' : store.drawerWidth,
            backgroundColor: store.theme.palette.background.default,
            color: store.theme.palette.text.primary,
            overflowY: 'scroll',
            overflowX: 'hidden'
          }} item>
            <div style={{ padding: '10px' }}>
              {store.oAuth ?
                <div style={{
                  position: 'sticky',
                  top: 0,
                  display: 'flex', flexDirection: 'row',
                  flexWrap: 'nowrap', justifyContent: 'space-between',
                  backgroundColor: store.theme.palette.background.default,
                  zIndex: 9999,
                }}>
                  <div><UserLogo style={{ height: 50, }} name={store.userName} img={store.userLogo} /></div>
                  <div><IconButton onClick={() => store.updateStreamers()}><Refresh style={{ width: '100%' }} /></IconButton></div>
                  <div><IconButton onClick={() => store.handleDrawerOpen()}><LeftArrow style={{ width: '100%' }} /></IconButton></div>

                </div> : null}

              {store.developmentMode ?
                <div style={{ position: 'sticky', top: 0, zIndex: 9999 }}>
                  <div><Button onClick={() => store.updateStreamers()}>Update Streamers</Button></div>
                  <div><Button onClick={() => store.handleDrawerOpen()}>Close ChannelManager</Button></div>
                  <div><WindowDimensions /></div>
                  <div>{store.userName}</div>
                  <div>System Theme: {store.systemTheme}</div>
                  <div># of Messages: {store.msg_id}</div>
                  <div># of Streams: {store.streams.entries().length}</div>
                  <div># of Channels Joined: {store.joinedChannels.length}</div>
                  {/* <div>Talking in: {store.joinedChannels[store.channelSelectValue] !== undefined ?
                    store.joinedChannels[store.channelSelectValue].key
                    : null}</div> */}
                  <div>colorInt: {store.colorInt}</div>
                  <div>ChatMenuOpen: {String(store.chatMenuOpen)}</div>
                  <div>scrollToEnd: {String(store.scrollToEnd)}</div>
                  <div>channelSelectValue: {store.channelSelectValue}</div>
                  <div>mobileScreenSize: {String(store.mobileScreenSize)}</div>
                  <div>widthBreakPoint: {String(store.widthBreakPoint)}</div>
                  <div>highlight: {String(store.highlight)}</div>
                  <div>messagesNoColor: {String(store.messagesNoColor)}</div>
                </div>
                : null}
              <ChannelManager />
            </div>

          </Grid>
          : null
        }
        <Grid style={{
          backgroundColor: store.theme.palette.background.default,
          color: store.theme.palette.text.primary,
          overflowY: 'hidden',
          overflowX: 'hidden',
          margin: 0,
        }} item xs>
          <div style={{ display: (store.mobileScreenSize && store.drawerOpen) ? 'none' : 'inline' }}>
            {this.props.ChatComponent}
          </div>
        </Grid>
      </Grid>
    )
  }
}

@observer
class WindowDimensions extends Component {
  render() {
    return <span>{parseInt(store.width, 10)} x {parseInt(store.height, 10)}</span>;
  }
  updateDimensions() {
    store.updateDimensions(window.innerWidth, window.innerHeight)
  }
  componentWillMount() {
    this.updateDimensions();
  }
  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }
}

export default App