// store.js
import web_safe_colors from '../constants/web_safe_colors'
import { toJS, observable, action } from 'mobx';
import axios from 'axios'
import { clean } from '../utility/utility'

// Utilities
import tmi from 'twitch-js'
import _ from 'lodash'

// Material-UI
import { createMuiTheme } from 'material-ui/styles'

// Utility
import CONFIG from '../config'
import { LOCAL_STORAGE, CHANNELS, OAUTH } from '../utility/localStorageWrapper'
import { mapToJson } from '../utility/JsonMapUtil'

const client_id = CONFIG.client_id
const redirect_uri = CONFIG.redirect_uri
const secure = CONFIG.secure
const debug = CONFIG.debug

const max_length = web_safe_colors.length - 1 // off by one

let deleteToken = async function (token) {
  const config = {
    url: 'oauth2/revoke',
    method: 'post',
    baseURL: 'https://api.twitch.tv/kraken',
    data: {
      client_id: client_id,
      token: token,
    },
    headers: {
      'Accept': 'application/vnd.twitchtv.v5+json',
    },
  }
  const req = await axios.request(config).then((response) => {
    try {
      if (response.status === 200) {
        console.log(response)
        return response
      }
    } catch (err) {
      console.log(err)
      return response
    }
  })

  return req

}

window.deleteToken = deleteToken

class Store {
  // App
  developmentMode = debug
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
  @observable drawerWidth = 240

  // Channel Manager
  @observable streams
  client = undefined
  options = {
    options: {
      debug: false
    },
    connection: {
      reconnect: true,
      secure: secure,
    },
    identity: {
      username: '',
      password: ''
    },
  }
  @observable channels = new Map()
  widthBreakPoint = 530
  @observable mobileScreenSize = false

  // Chat
  @observable channelSelectValue = 0
  @observable joinedChannels = []
  @observable msg_id = 0
  @observable scrollToEnd = false
  @observable chatMenuOpen = false
  @observable messages = []
  @observable blackMessages = false
  colorInt = 0

  // Login
  @observable twitchLoginUrl = `https://api.twitch.tv/kraken/oauth2/authorize
?client_id=${client_id}
&redirect_uri=${redirect_uri}
&response_type=token
&scope=openid+chat_login+user_read`

  updateStreamersTimerID

  makeDeleteTokenURL(token) {
    const url = `https://api.twitch.tv/kraken/oauth2/revoke?client_id=${client_id}&token=${this.oAuth}`

    return url
  }

  /**
   * Set access token (oAuth)
   * 
   * @param {any} oAuth 
   * @memberof Store
   */
  @action setAccessToken(oAuth) {
    this.oAuth = oAuth
    LOCAL_STORAGE.setItem(OAUTH, oAuth)
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
  @action async join(channel) {
    try {
      if (this.streams.get(channel)) {
        const result = await this.client.join(channel).then((data) => {
          this.channels.set(channel, {
            key: channel,
            color: web_safe_colors[this.handleColorIncrement()],
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
        return result
      } else {
        console.log(`${channel} not found/online. Will not join.`)
      }
    } catch (err) {
      console.log(err)
      return false
    }
  }

  /**
   * Add a channel but do not join it
   * 
   * @param {any} channel 
   * @memberof Store
   */
  @action addChannel(channel) {
    this.channels.set(channel, {
      key: channel,
      color: web_safe_colors[this.handleColorIncrement()],
      joined: false
    })
    LOCAL_STORAGE.setItem(CHANNELS, mapToJson(this.channels))
  }

  /**
   * Leave a channel
   * 
   * @param {any} channel 
   * @memberof Store
   */
  @action async leave(channel, autoJoin = true) {
    channel = clean(channel)
    try {
      if (this.channels.get(channel)) {
        const result = await this.client.part(channel).then((data) => {
          // const autojoin = this.channels.get(channel).autojoin
          // const color = this.channels.get(channel).color
          this.channels.set(channel, {
            key: channel,
            joined: false,
            // color: color,
            autoJoin: autoJoin,
          })
          // Save to localStorage
          LOCAL_STORAGE.setItem(CHANNELS, mapToJson(this.channels))
          this.joinedChannels = _.filter(toJS(this.channels), (ch) => { if (ch) return ch.joined })
          // Update the channelSelectValue to prevent [mobx.array] Attempt to read an array index (integer) that is out of bounds
          store.channelSelectValue = store.channelSelectValue >= this.joinedChannels.length ? this.joinedChannels.length - 1 : store.channelSelectValue
          console.log(toJS(this.channels))
          console.log(toJS(this.joinedChannels))
          return true
        })
        return result
      }
    } catch (err) {
      console.log(err)
      return false
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
    this.mobileScreenSize = this.width < this.widthBreakPoint ? true : false
  }

  /**
   * Update drawerWidth.
   * 
   * @param {any} w 
   * @memberof Store
   */
  @action updateDrawerWidth(w) {
    this.drawerWidth = w
  }

  /**
   * Open/Close drawer.
   * 
   * @memberof Store
   */
  @action handleDrawerOpen() {
    this.drawerOpen = !this.drawerOpen
  }

  /**
   * Increment colorInt and make sure it doesn't go over max_length
   * 
   * @returns 
   * @memberof Store
   */
  @action handleColorIncrement() {
    const lastColorInt = this.colorInt
    this.colorInt += 1
    if (this.colorInt >= max_length) {
      this.colorInt = 0
    }
    return lastColorInt
  }

}

// function randomIntFromInterval(min, max) {
//   return Math.floor(Math.random() * (max - min + 1) + min);
// }

let store = window.store = new Store()

export { client_id }
export default store