export class WebSocketClient {
  constructor(url: string, key: string) {
    this.webSocket = this.init(url, key)
    this.user = key
  }

  user: string

  webSocket: WebSocket

  init(url: string, key: string) {
    return new WebSocket(`${url}?key=${key}`)
  }

  send(data: any) {
    this.webSocket.send(data)
  }
}
