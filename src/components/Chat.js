import React, { Component } from 'react'
import moment from 'moment'
import axios from 'axios'
import { toJS } from 'mobx';
import { observer } from 'mobx-react'
import store from '../store/store';
import ReactHtmlParser from 'react-html-parser';

// Material-ui
import { withTheme } from 'material-ui/styles'
import { MenuItem } from 'material-ui/Menu';
import { blueGrey } from 'material-ui/colors'
import Select from 'material-ui/Select'
import IconButton from 'material-ui/IconButton'
import TextField from 'material-ui/TextField'
import RightArrow from 'material-ui-icons/KeyboardArrowRight'
import LeftArrow from 'material-ui-icons/KeyboardArrowLeft'
import ArrowDownward from 'material-ui-icons/ArrowDownward'

// Components
import ChatMenu from './ChatMenu'

// Utility
import twitch_emotes from '../emotes/twitch_emotes'
import bttv_emotes from '../emotes/bttv_emotes'
import { LOCAL_STORAGE, MESSAGES, } from '../utility/localStorageWrapper'
import { arrayToJson, jsonToArray, } from '../utility/JsonMapUtil'
import { removeHashtag } from '../utility/utility'

// Emotes
// http://static-cdn.jtvnw.net/emoticons/v1/356/3.0
let twitch_emotes_map = new Map()
for (let i = 0; i < twitch_emotes.length; i++) {
  twitch_emotes_map.set(twitch_emotes[i].code, `https://static-cdn.jtvnw.net/emoticons/v1/${twitch_emotes[i].id}/3.0`)
}

// http://cdn.betterttv.net/emote/{{id}}/{{image}}
let bttv_emotes_map = new Map()
for (let i = 0; i < bttv_emotes.length; i++) {
  bttv_emotes_map.set(bttv_emotes[i].code, `https://cdn.betterttv.net/emote/${bttv_emotes[i].id}/3x`)
}

// BTTV
let bttv_user_emotes_map = new Map()
// FFZ
let ffz_emotes_map = new Map()

window.twitch_emotes_map = twitch_emotes_map
window.ffz_emotes_map = ffz_emotes_map
window.bttv_emotes_map = bttv_emotes_map
window.bttv_user_emotes_map = bttv_user_emotes_map


async function getFFZEmotes(name) {
  let config = {
    url: `room/${name}`,
    method: 'get',
    baseURL: 'https://api.frankerfacez.com/v1/',
    params: { limit: 100 }
  }

  const req = await axios.request(config).then((response) => {
    return response
  }).catch((err) => {
    return undefined
  })

  return req
}

async function goFFZ(name) {
  const req = await getFFZEmotes(name)
    .then((response) => {
      if (response) {
        ffz_emotes_map.set(name, new Map())
        const data = Object.values(response.data.sets)[0].emoticons
        for (const item of data) {
          ffz_emotes_map.get(name).set(item.name, item.urls[1])
        }
        return data
      } else {
        return undefined
      }
    })

  return req
}

async function getBTTVEmotes(name) {
  let config = {
    url: `${name}`,
    method: 'get',
    baseURL: 'https://api.betterttv.net/2/channels/',
    params: { limit: 100 }
  }

  const req = await axios.request(config).then((response) => {
    return response
  }).catch((err) => {
    return undefined
  })

  return req
}

async function goBTTV(name) {
  const req = await getBTTVEmotes(name)
    .then((response) => {
      if (response) {
        bttv_user_emotes_map.set(name, new Map())
        const emotes = response.data.emotes // [id: "5912...", channel: 'scardor", code: "Hollup, imageType: "png""]
        for (const emote of emotes) {
          bttv_user_emotes_map.get(name).set(emote.code, `https://cdn.betterttv.net/emote/${emote.id}/3x`)
        }
        return emotes
      } else {
        return undefined
      }
    })

  return req
}

@observer
class Chat extends Component {
  constructor(props) {
    super(props)

    this.messageCache = []
    this.regex_channel = /\/\#\S+|\S+\ +/ //['/#Tod', /#Tod    '] OK ['#Tod', '#Tod  '] Not OK.
  }
  componentDidMount() {
    this.chatScroll.addEventListener('scroll', this.handleChatScroll.bind(this))

    store.client.on('join', (channel, username, self) => {
      if (username === store.userName) {
        goFFZ(removeHashtag(channel))
        goBTTV(removeHashtag(channel))
      }
    })

    let m = (channel, userstate, message, time, key) => {
      const k1 = `${channel}-${key}`
      const k2 = `${time}-${key}`
      const k3 = `${userstate['display-name']}-${key}`
      const k4 = `message-${key}`
      return <div style={{ marginLeft: '5px', padding: 0, }} key={k1}>
        <span style={{
          opacity: '0.8', fontSize: '10px', fontWeight: 'bold',
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }} key={k2}>
          {time} {channel}
        </span>
        <span style={{ color: `${userstate['color']}`, marginLeft: '2px', }} key={k3}>{userstate['display-name'] + ': '} </span>
        <span style={{}} key={k4}>{this.parseForEmotes(message, removeHashtag(channel))}</span>
      </div>
    }

    let processMessage = (channel, message, key, opacity = 1) => {
      let color = blueGrey[900]

      store.channels.get(channel) ?
        color = store.channels.get(channel).color :
        color = blueGrey[900]

      const msg = <div style={{ backgroundColor: color, opacity: opacity }} channel={channel} key={key}>
        {message}
      </div>

      return msg
    }

    store.client.on('chat', (channel, userstate, message, self) => {
      const time = moment().format('h:mm:ss')
      // Save messages incase user exits
      const messageObj = { channel: channel, userstate: userstate, message: message, time: time }
      this.messageCache.push(messageObj)
      // Step 1
      const key = store.msg_id
      store.msg_id = store.msg_id + 1
      const msg = m(channel, userstate, message, time, key)
      // Step 2
      const newMessage = processMessage(channel, msg, key)
      // Step 3
      store.messages.push(newMessage)

      this.forceUpdate()

      if (store.scrollToEnd) {
        this.scrollToBottom()
      }
    })

    this.truncateTimerID = setInterval(
      () => {
        this.truncateMessages()
      },
      120000
    )

    this.saveMessagesID = setInterval(
      () => {
        if (this.messageCache.length > 0) {
          LOCAL_STORAGE.setItem(MESSAGES, arrayToJson(this.messageCache))
        }
      },
      10000 // 10 seconds
    )

    //Load past messages
    if (LOCAL_STORAGE.getItem(MESSAGES)) {
      const messageArrayObj = jsonToArray(LOCAL_STORAGE.getItem(MESSAGES))

      for (const obj of messageArrayObj) {
        const channel = obj.channel
        const userstate = obj.userstate
        const message = obj.message
        const time = obj.time
        const key = store.msg_id
        store.msg_id = store.msg_id + 1

        const msg = m(channel, userstate, message, time)
        const newMessage = processMessage(channel, msg, key, 0.75)
        store.messages.push(newMessage)
      }
    }

  }

  componentWillUnmount() {
    // Clear listeners and intervals
    this.chatScroll.removeEventListener('scroll', this.handleChatScroll.bind(this))
  }

  truncateMessages() {
    const truncatedMessages = store.messages
    if (truncatedMessages.length > 750) {
      truncatedMessages.splice(0, 350)
      store.messages = truncatedMessages
    }
    if (this.messageCache.length > 750) {
      this.messageCache = this.messageCache.splice(0, 350)
    }
  }

  parseForEmotes(message, channel) {
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
          split_message[i] = `<img style='vertical-align: middle: padding: 1px;' height='38' src=${bttv_user_emotes_map.get(channel).get(code)} />`
        }
      }
    }
    return ReactHtmlParser(split_message.join(' '));
  }

  sendMessage(event) {
    const message = this.messageInput.value
    let channel = store.joinedChannels[store.channelSelectValue].key

    if (event.key === 'Enter') {
      event.preventDefault() // Prevents newlines from occuring in the text area

      if (message === '') { return }

      try {
        store.client.say(channel, message).then((data) => {
          this.scrollToBottom()
          console.log(`${channel} ${message}`)
        })
      } catch (err) {
        console.log(err)
      }

      this.messageInput.value = ''
    }
  }

  handleChange(e) {
    const index = parseInt(e.target.value, 10)
    store.channelSelectValue = index
  }

  handleChatScroll() {
    // console.log(this.chatScroll.scrollHeight )
    if (this.chatScroll.scrollHeight - Math.ceil(this.chatScroll.scrollTop) <= this.chatScroll.clientHeight) {
      store.scrollToEnd = true
      this.scrollToBottom()
    } else {
      if (store.scrollToEnd !== false) {
        store.scrollToEnd = false
      }
    }
  }

  scrollToBottom() {
    const chat = document.getElementById('chat');
    store.scrollToEnd = true
    chat.scrollTop = chat.scrollHeight;
    // this.messagesEnd.scrollIntoView({ behavior: "instant" })
  }

  switchChannel(event) {
    try {
      if (event.key === 'ArrowUp') {
        if (store.channelSelectValue < store.joinedChannels.length - 1) {
          store.channelSelectValue += 1
        } else {
          store.channelSelectValue = 0
        }
      }
      if (event.key === 'ArrowDown') {
        if (store.channelSelectValue < store.joinedChannels.length && store.channelSelectValue > 0) {
          store.channelSelectValue -= 1
        } else {
          store.channelSelectValue = store.joinedChannels.length - 1
        }
      }
    } catch (err) {
      console.log(err)
      store.channelSelectValue = 0
    }
  }

  render() {
    let channels = []
    let i = 0
    let w = 500
    store.drawerOpen ? w = store.width - store.drawerWidth - 10 : w = store.width - 10

    for (const channel of toJS(store.joinedChannels)) {
      channels.push(<MenuItem style={{ backgroundColor: this.props.theme.palette.background.default }} key={channel.key} value={i}>{channel.key}</MenuItem>)
      i += 1
    }
    const channelSelect = channels.length > 0 ?
      <Select style={{ maxWidth: 84 }} onChange={this.handleChange.bind(this)} value={parseInt(store.channelSelectValue, 10)} autoWidth={false}>
        {channels}
      </Select> :
      null

    const border = store.mobileScreenSize ? { border: '1px solid black' } : { borderBottom: '1px solid black' }
    const chatArea =
      <div style={{
        ...{
          width: '100%',
          height: store.height - 60,
          overflowY: 'scroll',
          overflowX: 'hidden',
        },
        ...border
      }}
        ref={(el) => { this.chatScroll = el }}
        id={'chat'}>
        <div>
          {store.messages}
        </div>
        <div id={'endOfChat'} ref={(el) => { this.messagesEnd = el }} />
      </div>

    const scrollBottomButton = store.scrollToEnd === false ?
      <IconButton onClick={this.scrollToBottom.bind(this)}><ArrowDownward /></IconButton> :
      <IconButton disabled onClick={this.scrollToBottom.bind(this)}><ArrowDownward /></IconButton>

    const textAreaChat = store.joinedChannels.length > 0 ?
      <TextField
        placeholder=
        {store.joinedChannels[store.channelSelectValue] ? `${store.joinedChannels[store.channelSelectValue].key}` :
        `Send a Message`
        }
        inputRef={(el) => { this.messageInput = el }}
        onKeyPress={this.sendMessage.bind(this)} onKeyDown={this.switchChannel.bind(this)}
        fullWidth />
      : null

    const drawerIcon = store.drawerOpen ? <LeftArrow /> : <RightArrow />
    const drawerControl = <IconButton onClick={() => store.handleDrawerOpen()}>{drawerIcon}</IconButton>

    return (
      <div style={{ height: store.height }}>
        {chatArea}
        <div style={{
          width: w, height: 60,
          display: 'flex', flexDirection: 'row',
          flexWrap: 'nowrap', justifyContent: 'space-evenly'
        }}>
          <div style={{ margin: 'auto', }}>{drawerControl}</div>
          <div style={{ margin: 'auto', }}><ChatMenu /></div>
          <div style={{ flexGrow: 2, margin: 'auto', minWidth: 150, }}>{textAreaChat}</div>
          <div style={{ margin: 'auto', marginLeft: '4px', }}>{channelSelect}</div>
          <div style={{ margin: 'auto', }}>{scrollBottomButton}</div>
        </div>
      </div>
    )
  }
}

export default withTheme()(Chat)