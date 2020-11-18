class WebSocketCom {
  private static _instance: WebSocketCom = null;
  private _webSocket: WebSocket = null;

  public static getInstance(): WebSocketCom {
    if (!this._instance) {
      this._instance = new WebSocketCom();
    }
    return this._instance;
  }

  public init(){
    
  }

}

export default WebSocketCom.getInstance();
