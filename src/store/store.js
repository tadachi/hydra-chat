// store.js
import web_safe_colors from '../constants/web_safe_colors'
import { toJS, observable, action } from 'mobx';
import axios from 'axios'
import { clean } from '../utility/utility'

// Utilities
import tmi from  'twitch-js'
import _ from 'lodash'

// Material-UI
import {createMuiTheme} from 'material-ui/styles'

const client_id = 'gpa5zi9y5d70q9b2lcpcwvikp7mek0'

const max_length = web_safe_colors.length - 1 // off by one

console.log(tmi)

class Store {
  // App
  @observable systemTheme = 'dark' // dark or light
  @observable systemThemes = ['dark', 'light']
  @observable systemThemeValue = 0
  @observable theme = createMuiTheme({
    palette: {
      type: store.systemTheme, // Switching the dark mode on is a single property value change.
    },
  });
  @observable oAuth = ''
  @observable userName = ''
  @observable userLogo = ''
  @observable width = 0
  @observable height = 0
  @observable drawerOpen = true
  @observable drawerWidth = 350

  // Channel Manager
  @observable streams
  client = undefined
  options = {
    options: {
      debug: true
    },
    connection: {
      reconnect: true
    },
    identity: {
      username: '',
      password: ''
    },
  }
  @observable channels = new Map()

  // Chat
  @observable channelSelectValue = 0
  @observable joinedChannels = []
  @observable messages = []
  @observable msg_id = 0
  @observable scrollToEnd = true
  @observable chatMenuOpen = false

  /**
   * Set access token (oAuth)
   * 
   * @param {any} oAuth 
   * @memberof Store
   */
  @action setAccessToken(oAuth) {
    this.oAuth = oAuth
  }

  /**
   * 
   * 
   * @memberof Store
   */
  @action async login() {
    if (this.oAuth) {
      this.options.identity.username = this.userName
      this.options.identity.password = this.oAuth
      this.client = new tmi.client(this.options)

      try {
        await this.client.connect()
      } catch (err) {
        console.log(err)
      }
    }
  }

  /**
   * Set username, userlogo
   * 
   * @returns 
   * @memberof Store
   */
  @action async setUserObject() {
    if (!this.oAuth) {
      throw Error('Twitch oAuth is not set!')
    }

    let config = {
      url: 'user',
      method: 'get',
      baseURL: 'https://api.twitch.tv/kraken',
      headers: {
        'Accept': 'application/vnd.twitchtv.v5+json',
        'Client-Id': client_id,
        'Authorization': `OAuth ${this.oAuth}`
      },
    }

    const req = await axios.request(config).then((response) => {
      if (response.status === 200) {
        this.userName = response.data.name
        this.userLogo = response.data.logo
      } else {
        throw Error(response)
      }

      return response
    })

    return req
  }

  /**
   * Set/Update list of streamers
   * 
   * @returns
   * @memberof Store
   */
  @action async updateStreamers() {
    let config = {
      url: 'streams/followed',
      method: 'get',
      baseURL: 'https://api.twitch.tv/kraken',
      headers: { 'Accept': 'application/vnd.twitchtv.v5+json', 'Authorization': `OAuth ${this.oAuth}` },
      params: { limit: 100 }
    }

    const req = await axios.request(config)
      .then((response) => {
        if (response.status === 200) {
          let newStreams = new Map()
          for (const stream of response.data.streams) {
            const displayName = `#${stream.channel.display_name}`
            const name = `#${clean(stream.channel.name)}`
            const game = stream.game
            const viewers = stream.viewers
            const status = stream.channel.status

            newStreams.set(
              name, { displayName: displayName, game: game, viewers: viewers, status: status }
            )
            this.streams = newStreams
          }
          return newStreams
        } else {
          return undefined
        }
      }).catch(function (err) {
        console.log(err)
        return undefined
      })

    return req
  }

  /**
   * Join a channel
   * 
   * @param {any} channel 
   * @memberof Store
   */
  @action join(channel) {
    channel = clean(channel)
    try {
      if (this.streams.get(channel)) {
        this.client.join(channel).then((data) => {
          this.channels.set(channel, {
            key: channel,
            color: web_safe_colors[randomIntFromInterval(0, max_length - 1)],
            joined: true,
            autojoin: false
          })
          this.joinedChannels = _.filter(toJS(this.channels), (ch) => { if (ch) return ch.joined})
          console.log(toJS(this.channels))
          console.log(toJS(this.joinedChannels))
        })
      } else {
        console.log(`${channel} not found/online. Will not join.`)
      }
    } catch (err) {
      console.log(err)
    }

  }

  /**
   * Leave a channel
   * 
   * @param {any} channel 
   * @memberof Store
   */
  @action leave(channel) {
    channel = clean(channel)
    try {
      if (this.streams.get(channel)) {
        this.client.part(channel).then((data) => {
          // const autojoin = this.channels.get(channel).autojoin
          // const color = this.channels.get(channel).color
          this.channels.set(channel, {
            key: channel,
            joined: false,
            // color: color,
            // autojoin: autojoin
          })
          this.joinedChannels = _.filter(toJS(this.channels), (ch) => { if (ch) return ch.joined})
          console.log(toJS(this.channels))
          console.log(toJS(this.joinedChannels))
        })
      }
    } catch (err) {
      console.log(err)
    }
  }


  /**
   * Update width and height of the whole app.
   * 
   * @param {any} w 
   * @param {any} h 
   * @memberof Store
   */
  @action updateDimensions(w, h) {
    this.width = w
    this.height = h + 10 //Covers missing pixels at the bottom of the window
    console.log(this.width + ' ' + this.height)
  }

  /**
   * Update drawerWidth.
   * 
   * @param {any} w 
   * @memberof Store
   */
  @action updateDrawerWidth(w) {
    this.drawerWidth = w
    console.log('drawerWidth' + this.drawerWidth)
  }

  /**
   * Open/Close drawer.
   * 
   * @memberof Store
   */
  @action handleDrawerOpen() {
    this.drawerOpen = !this.drawerOpen
  }
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let store = window.store = new Store()

export { client_id }
export default store