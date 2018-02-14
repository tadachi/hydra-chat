import React, { Component } from 'react';
import logo from './logo.svg';

//components
import Emoji from './Emoji';

//styles
import './App.scss';
import './App.less';
import './App.styl';

//modules
import cssStyles from './First.module.css';
import sassStyles from './Second.module.scss';
import lessStyles from './Third.module.less';
import stylusStyles from './Fourth.module.styl';

const theme = createMuiTheme({
  palette: {
    type: 'dark', // Switching the dark mode on is a single property value change.
  },
});


class App extends Component {
  render() {
    return (
      <div className="App">
        <div className={cssStyles.header}>
          <img src={logo} className="App-logo" alt="logo" />
          <h2 className="App-title">
            <Emoji label="danger" emoji="☢" />
            <span> custom-react-scripts </span>
            <Emoji label="danger" emoji="☢" />
          </h2>
          <div className="App-subtitle">
            allow custom config for create-react-app without ejecting
          </div>
        </div>

        <div className={stylusStyles.description}>
          <div className={sassStyles.command}>
            <code>
              create-react-app my-app --scripts-version custom-react-scripts
            </code>
          </div>

          <p>
            If you want to enable/disable certain features just modify the
            <b> .env</b> file in the root directory of the project.
          </p>

          <b> Styling </b>
          <ul className="configs style-configs">
            <li>
              <code>REACT_APP_SASS=true</code>
              <span>- Enable SASS</span>
            </li>
            <li>
              <code>REACT_APP_LESS=true</code>
              <span>- Enable LESS</span>
            </li>
            <li>
              <code>REACT_APP_STYLUS=true</code>
              <span>- Enable Stylus</span>
            </li>
            <li>
              <code>REACT_APP_CSS_MODULES=true</code>
              <span>- Enable CSS modules </span>
            </li>
            <li>
              <code>REACT_APP_SASS_MODULES=true</code>
              <span>- Enable Sass modules </span>
            </li>
            <li>
              <code>REACT_APP_SASS_MODULES=true</code>
              <span>- Enable Stylus modules </span>
            </li>
            <li>
              <code>REACT_APP_SASS_MODULES=true</code>
              <span>- Enable Less modules </span>
            </li>
          </ul>

          <b>Babel</b>

          <ul className="configs babel-configs">
            <li>
              <code>REACT_APP_BABEL_STAGE_0=true</code>
              <span>- Enable stage-0 preset</span>
            </li>
            <li>
              <code>REACT_APP_DECORATORS=true</code>
              <span>- Enable usage of decorators</span>
            </li>
          </ul>

          <b>Other</b>

          <ul className="configs babel-configs">
            <li>
              <code>REACT_APP_WEBPACK_DASHBOARD=true</code>
              <span>
                - Enables connection to {' '}
                <a
                  target="_blank"
                  ref="noopener noreferrer"
                  href="https://github.com/FormidableLabs/electron-webpack-dashboard"
                >
                  webpack-dashboard
                </a>{' '}
                (must be installed)
              </span>
            </li>
          </ul>

          <br />
          <br />
          <a
            target="_blank"
            rel="noopener noreferrer"
            className={lessStyles.readmeLink}
            href="https://github.com/kitze/create-react-app/tree/master/packages/react-scripts"
          >
            Link to full README.md
          </a>
        </div>
      </div>
    );
  }
}

export default App;

const Layout = () => (
  <div style={{ flexGrow: 1 }} >
    <Grid container spacing={24}>
      <Grid style={{ backgroundColor: 'blue', width: '100px', height: store.height }} item xs={2}>
        <Paper style={{ ...paper }}>{store.width}</Paper>
        <Counter />
      </Grid>
      <Grid style={{ backgroundColor: 'red', height: store.height, }} item xs>
        <Paper style={{ ...paper }}>{store.height}</Paper>
        {test}
        <DrawerControl />
      </Grid>
    </Grid>
  </div>
)

const channelSelect = store.channels.length > 0 ?
  <Select onChange={this.handleChange('channel')} style={{ color: 'white' }} value={parseInt(store.channelSelectValue)} native>
    {this.state.joined_channels}
  </Select> :
  null

{/* More messages below modal box */ }
{
  (store.scrollToEnd === false) ?
    <div style={{ display: 'inline-block', position: 'absolute', top: `${800}px`, marginLeft: '10px', opacity: '0.85', backgroundColor: blueGrey[600], padding: 10, }}
      onClick={this.scrollToBottom.bind(this)} ref={(el) => { this.moreMessagesBelow = el; }} id={'moreMessagesBelow'}>
      <div>More Messages Below.</div>
    </div> :
    <div></div>
}

onKeyDown = { this.switchChannel.bind(this) }

render() {
  return (
    <MuiThemeProvider theme={store.theme}>
      <Router>
        <div>
          <Route exact path="/" component={observer(LoginLayout)} />
          <Route exact path="/login" component={observer(LoginLayout)} />
          <Route exact path="/chat" component={observer(MainLayout)} />
        </div>
      </Router>
    </MuiThemeProvider>
  );
}
}

// setTimeout(() => {
//     store.join('#icarusFW')
//     store.join('#Pasky')
//     store.join('#Metako')
//     store.join('#landail')
//     store.join('#DarkSaber2k')
//     store.join('#maurice_33')
//     store.join('#Aquas')
//     store.join('#Fiercekyo')
//     store.join('#mulsqi')
//     store.join('#bafael')
//     store.join('#theboyks')
//     store.join('#Raikou')
//     store.join('#perpetualmm')
//     store.join('#Bingchang')
//     store.join('#frokenok')
//     store.join('#vultus')
//     store.join('#neohart')
//     store.join('#zetsubera')
//     store.join('#procplays')
//     store.join('#lazerlong')
//     store.join('#testrunner')
//     store.join('#jiseed')
//     store.join('#xxxindyxxx')
//     store.join('#narcissawright')
//     store.join('#Goati_')
//     store.join('#TheLCC')
//     store.join('#azureseishin')
//     store.join('#pykn')
//     store.join('#jiggeh')
//     store.join('#chuboh')
//     store.join('#UFotekkie')
//     store.join('#Ty2358')
//     store.join('#sakegeist')
//     store.join('#klaige')
//     store.join('#Go1den')
//     store.join('#capnclever')
//     store.join('#omnigamer')
//     store.join('#sylux98')
//     store.join('#swordsmankirby')
//     store.join('#Macaw45')
//     store.join('#freddeh')
//     store.join('#ghou02')
//     store.join('#tterraj42')
//     store.join('#superKing13')
//     store.join('#CavemanDCJ')
//     store.join('#yagamoth')
//     store.join('#shadowJacky')
//     store.join('#Jenja23')
// }, 4000)

await this.client.join(channel).then((data) => {
  this.channels.set(channel, {
    key: channel,
    color: web_safe_colors[randomIntFromInterval(0, max_length - 1)],
    joined: true,
    autoJoin: true,
  })
  // Save to localStorage
  LOCAL_STORAGE.setItem(CHANNELS, mapToJson(this.channels))
  this.joinedChannels = _.filter(toJS(this.channels), (ch) => { if (ch) return ch.joined })
  // console.log(toJS(this.channels))
  // console.log(toJS(this.joinedChannels))
  return true
})

let parseForEmotes = (message, channel) => {
  let split_message = message.split(' ')
  for (let i in split_message) {
    const code = split_message[i]
    if (twitch_emotes_map.has(code)) {
      split_message[i] = `<img style='vertical-align: middle; padding: 1px;' height='38' src=${twitch_emotes_map.get(code)} />`
    }
    if (bttv_emotes_map.has(code)) {
      split_message[i] = `<img style='vertical-align: middle; padding: 1px;' height='38' src=${bttv_emotes_map.get(code)} />`
    }
    if (ffz_emotes_map.has(channel)) {
      // console.log(ffz_emotes_map)
      if (ffz_emotes_map.get(channel).has(code)) {
        split_message[i] = `<img style='vertical-align: middle; padding: 1px;' height='38' src=${ffz_emotes_map.get(channel).get(code)} />`
      }
    }
    if (bttv_user_emotes_map.has(channel)) {
      if (bttv_user_emotes_map.get(channel).has(code)) {
        split_message[i] = <img style={{ verticalAlign: 'middle', padding: '1px' }} alt='emote' height={38} src={bttv_user_emotes_map.get(channel).get(code)} />
      }
    }
  }
  return ReactHtmlParser(split_message.join(' '));
}