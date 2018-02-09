import React, { Component } from 'react'
import './App.css'

// Mobx
import { observer} from 'mobx-react'
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
          store.updateStreamers()
          this.forceUpdate()
        })
      })
    }
  }

  componentWillUnmount() {}

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
          <div style={{visibility: 'hidden'}}><WindowDimensions /></div>
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
        height: store.height,
        backgroundColor: store.theme.palette.background.default
      }} container>
        {store.drawerOpen ?
          <Grid style={{
            height: store.height,
            minWidth: store.drawerWidth,
            maxWidth: store.drawerWidth,
            backgroundColor: store.theme.palette.background.default,
            color: store.theme.palette.text.primary,
            overflowY: 'scroll',
            overflowX: 'hidden'
          }} item>
            <div style={{ marginLeft: '4%' }}>
              {store.oAuth ?
                <UserPaper style={{ marginTop: '2%' }} name={store.userName} img={store.userLogo} /> : null}
              <div><Button onClick={() => store.updateStreamers()}>Update Streamers</Button></div>
              <div><WindowDimensions /></div>
              <div>{store.userName}</div>
              {/* <div>{store.oAuth}</div> */}
              <div>System Theme: {store.systemTheme}</div>
              <div># of Messages: {store.msg_id}</div>
              <div># of Channels Joined: {store.joinedChannels.length}</div>
              <div>ChatMenuOpen: {String(store.chatMenuOpen)}</div>
              <div>scrollToEnd: {String(store.scrollToEnd)}</div>
              <div>channelSelectValue: {store.channelSelectValue}</div>
            </div>
            <ChannelManager />
          </Grid>
          : null
        }
        <Grid style={{
          backgroundColor: store.theme.palette.background.default,
          color: store.theme.palette.text.primary,
          overflowY: 'hidden',
          overflowX: 'hidden'
        }} item xs>
          <div>{ChatComponent}</div>
          {/* <div><ThemeSelect /></div> */}
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