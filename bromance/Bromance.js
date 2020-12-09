// Football-Bromance Widget v20201209 for Scriptable App
// created by Andreas Becker (andreasbecker.de)
// Happy to receive feedback on https://github.com/andreas-becker/scriptable
const FEED_URL = 'https://podcast3a6468.podigee.io/feed/aac'
const emptyData = {
  'link': FEED_URL,
  'itunes:title': 'Daten nicht verfügbar',
  'itunes:subtitle': '',
  'itunes:duration': '',
  'pubDate': ''
}
const data = await loadData()
const app = data[0] || emptyData
let widget = null

if (config.widgetFamily == "small") {
  widget = await createSmallWidget(app)
} else {
  widget = await createMediumWidget(app)
}
if (!config.runsInWidget) {
  await widget.presentMedium()
}
Script.setWidget(widget)
Script.complete()

async function createSmallWidget(app) {
  const w = new ListWidget()
  w.url = app['link']

  const header = w.addText(app['itunes:title'])
  header.textColor = Color.green()
  header.font = Font.mediumSystemFont(16)
  
  const title = w.addText('Football Bromance')
  title.textColor = Color.white()
  title.textOpacity = 0.5
  title.font = Font.mediumSystemFont(16)
  w.addSpacer()

  if(app['pubDate']) {
    const pubDate = w.addText(formattedPubDate(app['pubDate']))
    pubDate.textColor = Color.white()
    pubDate.font = Font.mediumSystemFont(15)
    pubDate.textOpacity = 0.7
    pubDate.rightAlignText()
  }

  return w
}

async function createMediumWidget(app) {
  const w = new ListWidget()
  w.url = app['link']

  const header = w.addText(app['itunes:title'])
  header.textColor = Color.green()
  header.font = Font.mediumSystemFont(16)

  const title = w.addText('Football Bromance')
  title.textColor = Color.white()
  title.textOpacity = 0.5
  title.font = Font.mediumSystemFont(16)
  w.addSpacer()

  if(app['itunes:subtitle']) {
    const subtitle = w.addText(app['itunes:subtitle'])
    subtitle.textColor = Color.white()
    subtitle.font = Font.mediumSystemFont(15)
    w.addSpacer()
  }

  if(app['pubDate'] && app['itunes:duration']) {
    const duration = w.addText(formattedPubDate(app['pubDate']) + ' • ' + formattedDuration(app['itunes:duration']))
    duration.textColor = Color.white()
    duration.font = Font.mediumSystemFont(15)
    duration.textOpacity = 0.7
    duration.rightAlignText()
  }

  return w
}

async function loadData() {
  let response = await new Request(FEED_URL).loadString()
  const parser = new XMLParser(response)

  let currentValue = null
  let items = []
  let currentItem = null

  parser.didStartElement = (name) => {
    currentValue = ""
    if(name == "item") {
      currentItem = {}
    }
  }

  parser.didEndElement = name => {
    const hasItem = currentItem != null
    if (hasItem && name == "itunes:title") {
      currentItem["itunes:title"] = currentValue
    }
    if (hasItem && name == "itunes:subtitle") {
      currentItem["itunes:subtitle"] = currentValue
    }
    if (hasItem && name == "itunes:duration") {
      currentItem["itunes:duration"] = currentValue
    }
    if (hasItem && name == "pubDate") {
      currentItem["pubDate"] = currentValue
    }
    if (hasItem && name == "link") {
      currentItem["link"] = currentValue
    }
    if (name == "item") {
      items.push(currentItem)
      currentItem = {}
    }
  }
  parser.foundCharacters = str => {
    currentValue += str
  }
  parser.parse()

  return items
}

function formattedDuration(duration) {
  return Math.floor(duration / 60) + ':' + ('0' + Math.floor(duration % 60)).slice(-2) + ' min'
}

function formattedPubDate(time) {
  switch (typeof time) {
    case 'number':
      break
    case 'string':
      time = +new Date(time)
      break
    case 'object':
      if (time.constructor === Date) time = time.getTime()
      break
    default:
      time = +new Date()
  }
  var time_formats = [
    [60, 'Sekunden', 1],
    [120, '1 Minute', '1 Minute'],
    [3600, 'Minuten', 60],
    [7200, '1 Stunde', '1 Stunde'],
    [86400, 'Stunden', 3600],
    [172800, 'Gestern', 'Morgen'],
    [604800, 'Tagen', 86400],
    [1209600, 'Letzte Woche', 'Nächste Woche'],
    [2419200, 'Wochen', 604800],
    [4838400, 'Letzten Monat', 'Nächsten Monat'],
    [29030400, 'Monaten', 2419200],
    [58060800, 'Letztes Jahr', 'Nächstes Jahr'],
    [2903040000, 'Jahren', 29030400],
  ]
  var seconds = (+new Date() - time) / 1000,
    token = 'vor',
    list_choice = 1

  if (seconds == 0) {
    return 'Gerade'
  }
  if (seconds < 0) {
    seconds = Math.abs(seconds)
    token = 'in'
    list_choice = 2
  }
  var i = 0, format
  while (format = time_formats[i++])
    if (seconds < format[0]) {
      if (typeof format[2] == 'string')
        return format[list_choice]
      else
        return token + ' ' + Math.floor(seconds / format[2]) + ' ' + format[1]
    }
  return time
}
