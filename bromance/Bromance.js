// Football-Bromance Widget v20201208 for Scriptable App
// created by Andreas Becker (andreasbecker.de)
// Happy to receive feedback on https://github.com/andreas-becker/scriptable

const widget = await createWidget()
if (!config.runsInWidget) {
  await widget.presentMedium()
}
Script.setWidget(widget)
Script.complete()

async function createWidget(items) {
  const data = await loadData()
  const list = new ListWidget()
  if(data) {
    const header = list.addText(data[0]['itunes:title'])
    header.textColor = Color.green()
    header.font = Font.mediumSystemFont(16)

    const title = list.addText('Football Bromance')
    title.textColor = Color.white()
    title.textOpacity = 0.5
    title.font = Font.mediumSystemFont(16)
    list.addSpacer()

    const subtitle = list.addText(data[0]['itunes:subtitle'])
    subtitle.textColor = Color.white()
    subtitle.font = Font.mediumSystemFont(15)
    list.addSpacer()

    const duration = list.addText(formattedPubDate(data[0]['pubDate']) + ' • ' + formattedDuration(data[0]['itunes:duration']))
    duration.textColor = Color.white()
    duration.font = Font.mediumSystemFont(15)
    duration.textOpacity = 0.7
    duration.rightAlignText()

    list.url = data[0]['link']
  } else {
    list.addSpacer()
    list.addText("Daten nicht verfügbar")
  }
  return list
}

async function loadData() {
  let response = await new Request('https://podcast3a6468.podigee.io/feed/aac').loadString()
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
    [60, 'sekunden', 1],
    [120, 'vor 1 Minute', 'in 1 Minute'],
    [3600, 'minuten', 60],
    [7200, 'vor 1 Stunde', 'in 1 Stunde'],
    [86400, 'Stunden', 3600],
    [172800, 'Gestern', 'Morgen'],
    [604800, 'Tage', 86400],
    [1209600, 'Letzte Woche', 'Nächste Woche'],
    [2419200, 'Wochen', 604800],
    [4838400, 'Letzten Monat', 'Nächsten Monat'],
    [29030400, 'Monate', 2419200],
    [58060800, 'Letztes Jahr', 'Nächstes Jahr'],
    [2903040000, 'Jahre', 29030400],
  ]
  var seconds = (+new Date() - time) / 1000,
    token = 'vor',
    list_choice = 1

  if (seconds == 0) {
    return 'Gerade'
  }
  if (seconds < 0) {
    seconds = Math.abs(seconds)
    token = 'In'
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
