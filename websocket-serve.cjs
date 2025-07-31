const WebSocket = require('ws')
const webSocketServe = new WebSocket.Server({ port: 8080 })

const webSocketList = []

function getUrlParams(url) {
  const params = {}
  if (!url) return params
  const items = url.split('?')
  if (items.length <= 1) {
    return params
  }

  const list = items[1].split('&')

  list.forEach((item) => {
    const keys = item.split('=')

    params[keys[0]] = keys[1]
  })

  return params
}

webSocketServe.on('connection', function connection(ws, request) {
  const key = request.url.split('/')[1].split('?')[0]
  const params = getUrlParams(request.url)
  console.log('新建连接:' + request.url)
  const webSocketConfig = webSocketList.find((item) => {
    return item.key === key
  })
  if (!webSocketConfig) {
    webSocketList.push({ url: request.url, key: key, webSocket: ws, request: request })
  } else {
    webSocketConfig.webSocket = ws
    webSocketConfig.request = request
  }

  ws.onmessage = (event) => {
    console.log('接收信息:' + params.to)
    // 接收到客户端信息后转发数据到指定客户端
    const webSocket = webSocketList.find((item) => {
      return item.key === params.to
    })

    if (!webSocket) {
      return
    }
    console.log('转发给:' + params.to)
    webSocket.webSocket.send(event.data)
  }

  ws.onclose = () => {
    const index = webSocketList.findIndex((item) => {
      return item.key === params.to
    })
    if (index >= 0) {
      webSocketList.splice(index, 1)
    }
    ws.close()
  }
})
console.log('websocket: 服务启动成功')
