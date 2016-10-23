const RtmClient = require('@slack/client').RtmClient
const RTM_EVENTS = require('@slack/client').RTM_EVENTS
const dateFormat = require('dateformat')
const fs = require('fs')

const Config = require('./config.json')
const DataFilePath = './' + Config.data_file
const LogData = require(DataFilePath)
const updateSheets = require('./sheets')

let rtm

const save = (key, _date) => {
  let date = dateFormat(_date, "yyyy/mm/dd")
  let time = dateFormat(_date, "HH:MM")
  let index = LogData.findIndex( (row) => row[0] === date)
  if (index === -1) {
    LogData.push([date, null, null])
    index = LogData.length - 1
  }

  if (key === 'in') LogData[index][1] = time
  if (key === 'out') LogData[index][2] = time

  fs.writeFileSync(DataFilePath, JSON.stringify(LogData))
}

module.exports = class KintaiBot {
  constructor() {
    // this.status = {key: null, updated_at: null}
    rtm = new RtmClient(Config.slack_token, {logLevel: Config.log_level})
  }

  reply(message, text) {
    let params = { icon_emoji: ':santa:'}
    setTimeout( () => rtm.sendMessage(`<@${message.user}> ${text}`, message.channel), 1000)
  }

  start() {
    rtm.start()
    console.log('app started!')

    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
      console.log(message)
      if (message.type !== 'message') return false
      if (!message.text) return false

      let date = new Date()
      let date_formatted = dateFormat(new Date(), "mm/dd HH:MM")
      if (message.text.match(/おは/)) {
        save('in', date)
        this.reply(message, `おはようございます！出勤を記録しました。 => ${date_formatted}`)
      }
      if (message.text.match(/おつ|お疲/)) {
        save('out', date)
        this.reply(message, `お疲れ様でした！退勤を記録しました。 => ${date_formatted}`)
      }

      updateSheets()
    })
  }
}
