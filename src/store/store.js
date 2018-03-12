// store.js
import web_safe_colors from '../constants/web_safe_colors'
import { toJS, observable, action } from 'mobx';
import axios from 'axios'
import { clean } from '../utility/utility'
import jss from 'jss'
import preset from 'jss-preset-default'

// Utilities
import tmi from 'twitch-js'
import _ from 'lodash'

// Material-UI
import { createMuiTheme } from 'material-ui/styles'

// Utility
import CONFIG from '../config'
import { LOCAL_STORAGE, CHANNELS, OAUTH } from '../utility/localStorageWrapper'
import { mapToJson } from '../utility/JsonMapUtil'
import { removeHashtag } from '../utility/utility'

// One time setup with default plugins and settings.
jss.setup(preset())

window.toJS = toJS

const client_id = CONFIG.client_id
const redirect_uri = CONFIG.redirect_uri
const secure = CONFIG.secure
const debug = CONFIG.debug

const max_length = web_safe_colors.length - 1 // off by one

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
  @observable scrollToEnd = true
  @observable chatMenuOpen = false
  @observable messages = []
  @observable channelsStyles = {}
  @observable channelsSheet = jss.createStyleSheet(this.channelsStyleSheet, { link: true }).attach()
  @observable highlight = false
  @observable messagesNoColor = false
  @observable hideNonHighlighted = false
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
        const color = web_safe_colors[this.handleColorIncrement()]
        const result = await this.client.join(channel).then((data) => {
          this.channels.set(channel, {
            key: channel,
            color: color,
            joined: true,
            autoJoin: true,
          })
          // Save to localStorage
          LOCAL_STORAGE.setItem(CHANNELS, mapToJson(this.channels))
          this.joinedChannels = _.filter(toJS(this.channels), (ch) => { if (ch) return ch.joined })
          console.log(toJS(this.joinedChannels))
          this.channelSelectValue = this.channelSelectValue <= -1 ? 0 : this.channelSelectValue
          this.channelsSheet.addRule(removeHashtag(channel), {
            display: this.hideNonHighlighted ? 'none' : 'default',
            backgroundColor: this.messagesNoColor ? this.theme.palette.background.default : color,
            originalBackgroundColor: color,
            opacity: this.highlight ? 0.75 : 1,
          })
          return true
        })
        return result
      }
      // else {
      //   console.log(`${channel} not found/online. Will not join.`)
      // }
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
      autoJoin: false,
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
          this.channelSelectValue = this.channelSelectValue >= this.joinedChannels.length ? this.joinedChannels.length : this.channelSelectValue
          // this.channelsSheet.deleteRule(removeHashtag(channel))
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

  @action handleToggleHighlight() {
    this.highlight = !this.highlight
  }

  @action handleToggleMessagesNoColor() {
    this.messagesNoColor = !this.messagesNoColor
  }

  @action handleTogglehideNonHighlighted() {
    this.hideNonHighlighted = !this.hideNonHighlighted
  }
  
  /**
   * Initialize channel style sheet rules. Useful if it isn't initialized already
   * 
   * @memberof Store
   */
  @action initializeChannelSheetRules() {
    jss.removeStyleSheet(this.channelsSheet)
    this.channelsStyles = {}
    for (const k of this.joinedChannels) {
      this.channelsStyles[removeHashtag(k.key)] = {
        opacity: 1
      }
    }
    this.channelsSheet = jss.createStyleSheet(this.channelsStyles, { link: true }).attach()
  }

  /**
   * Set opacity of the channels style sheet
   * 
   * @param {any} name 
   * @param {any} opacity 
   * @memberof Store
   */
  @action setOpacityRule(name, opacity) {
    this.channelsSheet.getRule(name).prop('opacity', opacity)
  }

  /**
   * Set background color of a rule in channels style sheet.
   * 
   * @param {any} name 
   * @param {any} color 
   * @memberof Store
   */
  @action setBackgroundRule(name, color) {
    this.channelsSheet.getRule(name).prop('backgroundColor', `${color}`)
  }

  /**
   * Set custom rule for channels style sheet
   * 
   * @param {any} name 
   * @param {any} rule 
   * @param {any} data 
   * @memberof Store
   */
  @action setCustomRule(name, rule, data) {
    this.channelsSheet.getRule(name).prop(rule, data)
  }

  /**
   * Highlight messages of streamer
   * 
   * @param {any} streamer 
   * @memberof Store
   */
  @action toggleHighlight(streamer) {

    if (this.highlight) {
      for (const [k, v] of Object.entries(this.channelsSheet.classes)) {
        (streamer === k) ? this.setOpacityRule(k, 1) : this.setOpacityRule(k, 0.5)
      }
    } else {
      for (const [k, v] of Object.entries(this.channelsSheet.classes)) {
        this.setOpacityRule(k, 1)
      }
    }
  }


  /**
   * Set all messages to have no color background.
   * 
   * @memberof Store
   */
  @action toggleMessagesNoColor() {
    const color = store.theme.palette.background.default
    if (this.messagesNoColor) {
      for (const [k, v] of Object.entries(this.channelsSheet.classes)) {
        this.channelsSheet.getRule(k).prop('background-color', `${color}`)
      }
    } else {
      for (const [k, v] of Object.entries(this.channelsSheet.classes)) {
        const originalBackgroundColor = this.channelsSheet.getRule(k).style['original-background-color']
        this.channelsSheet.getRule(k).prop('background-color', `${originalBackgroundColor}`)
      }
    }
  }

  /**
   * Hides non highlighted messages
   * 
   * @memberof Store
   */
  @action toggleHideNonHighlighted(streamer) {
    if (this.hideNonHighlighted) {
      for (const [k, v] of Object.entries(this.channelsSheet.classes)) {
        (streamer === k) ? this.setCustomRule(k, 'display', 'default') : this.setCustomRule(k, 'display', 'none')
      }
    } else {
      for (const [k, v] of Object.entries(this.channelsSheet.classes)) {
        this.setCustomRule(k, 'display', 'default') 
      }
    }
  }

}

let store = window.store = new Store()

export { client_id }
export default store
