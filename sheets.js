var google = require('googleapis')
var sheets = google.sheets('v4')

const Config = require('./config.json')

var key = require('./'+Config.service_account_file)
var scopes = [
  'https://www.googleapis.com/auth/spreadsheets'
]

var jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  scopes,
  null
)

var params = {
  auth: jwtClient,
  spreadsheetId: Config.spreadsheet_id,
  range: 'A1',
  valueInputOption: 'USER_ENTERED',
  resource: {
    values: []
  }
}

module.exports = function() {
  params.resource.values = [
    ['Date', 'In', 'Out'], ... require('./' + Config.data_file)
  ]
  jwtClient.authorize(function (err, tokens) {
    if (err) { console.log(err); return }

    sheets.spreadsheets.values.update(params, (err, res) => {
      if (err) { console.error(err); return }

      console.log(res)
    })
  })
}
