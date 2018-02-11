import React, { Component } from 'react'
import './App.css'

// Mobx
import { observer } from 'mobx-react'
import store from './store/store';
import { client_id } from './store/store'

// Material-ui
import { MuiThemeProvider } from 'material-ui/styles';
import Grid from 'material-ui/Grid'
import Button from 'material-ui/Button'

//Components
import Login from './components/Login'
import ChannelManager from './components/ChannelManager'
import UserPaper from './components/UserPaper'
import Chat from './components/Chat'
// import ThemeSelect from './components/ThemeSelect'

//Utility
import { getParams, getBaseUrl } from './utility/utility'
import { jsonToMap } from './utility/JsonMapUtil'
import { LOCAL_STORAGE, CHANNELS } from './utility/localStorageWrapper'

let Main = null
let ChatComponent = null
@observer // Watches store. when data changes, re-render component.
class App extends Component {
  componentDidMount() {
    // Fix dimensions to window height
    store.updateDimensions(window.innerWidth, window.innerHeight)

    const oAuth = getParams(document.location.hash)['access_token']
    if (oAuth) {
      store.setAccessToken(oAuth)
      store.setUserObject().then((response) => {
        store.login().then(() => {
          Main = <MainLayout />
          ChatComponent = <Chat />
          store.updateStreamers().then((streams) => {
            console.log(streams)
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
  }

  componentWillUnmount() { }

  render() {
    return (
      <MuiThemeProvider theme={store.theme}>
        <div>
          {store.oAuth ? Main : <LoginLayout />}
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
            <img style={{ width: 250, height: 250, margin: '2%' }} src={`${getBaseUrl()}/logo.jpg`} alt='logo' />
          </div>
          <div>
            <Login style={{}} client_id={client_id} />
          </div>
          <div style={{ visibility: 'hidden' }}><WindowDimensions /></div>
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
                <div style={{position: 'sticky', top: 0}}><UserPaper style={{ marginTop: '5px' }} name={store.userName} img={store.userLogo} /></div> : null}
              {store.developmentMode ?
                <div>
                  <div><Button onClick={() => store.updateStreamers()}>Update Streamers</Button></div>
                  <div><Button onClick={() => store.handleDrawerOpen()}>Close ChannelManager</Button></div>
                  <div><WindowDimensions /></div>
                  <div>{store.userName}</div>
                  <div>System Theme: {store.systemTheme}</div>
                  <div># of Messages: {store.msg_id}</div>
                  <div># of Channels Joined: {store.joinedChannels.length}</div>
                  <div>ChatMenuOpen: {String(store.chatMenuOpen)}</div>
                  <div>scrollToEnd: {String(store.scrollToEnd)}</div>
                  <div>channelSelectValue: {store.channelSelectValue}</div>
                  <div>mobileScreenSize: {String(store.mobileScreenSize)}</div>
                </div>
                : null}
            </div>
            <ChannelManager />
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
          <div style={{ display: (store.mobileScreenSize && store.drawerOpen) ? 'none' : 'inline' }}>{ChatComponent}</div>
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