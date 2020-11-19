import { CONNECTTYPE } from "../enums/Enums";

const DEBUG = false;
const CONNECT_NUM = 3;
const LOST_NUM = 3;
const RECONNECTTIME = 1000; //单位毫秒

class WebSocketCom {
  private static _instance: WebSocketCom = null;
  private _webSocket: WebSocket = null;
  /**丢失的心跳个数 */
  private mLostNum: number = 0;
  /**url地址 */
  private mWsUrl: string = "";
  /**webSocket reconnect时间单位 毫秒 */
  private mWsReconnectTime = RECONNECTTIME;

  /**当前的websocket连接 */
  private mClientSockets: WebSocket = null;
  /**websocket的连接回掉函数 */
  private mCallBackFun = null;

  /**重连的次数 */
  private mReConnectNum = CONNECT_NUM;

  /**断线错误码 */
  private mErrorCode = 0;

  public static getInstance(): WebSocketCom {
    if (!this._instance) {
      this._instance = new WebSocketCom();
    }
    return this._instance;
  }

  private init(wsUrl: string, fn) {
    this.mLostNum = 0; //丢失的心跳个数
    this.mWsUrl = wsUrl; //url地址
    this.mWsReconnectTime = RECONNECTTIME; //webSocket reconnect时间单位 毫秒

    this.mClientSockets = null; //当前的连接
    this.mCallBackFun = fn; //回调函数

    this.mReConnectNum = CONNECT_NUM;

    this.mWsUrl = wsUrl;
    this.mCallBackFun = fn;

    this.createWebSocket(wsUrl);
  }

  /**
   * 创建一个socket
   * @param {*} url
   */
  private createWebSocket(url) {
    if (DEBUG) console.log("createWebSocket", url);
    try {
      if (DEBUG) console.log("createWebSocket", this.mClientSockets);
      this.mClientSockets = new WebSocket(url);
      this.initEventHandle();
      if (DEBUG) console.log("createWebSocket", this.mClientSockets);
    } catch (e) {
      this.reconnect(url);
    }
  }

  /**
   * 初始化事件
   */
  private initEventHandle() {
    this.mClientSockets.onclose = (event) => {
      console.log("[initEventHandle]websocket服务关闭了 onclose", event);
      this.mClientSockets.removeEventListener(
        "close",
        (this.mClientSockets, this.mClientSockets.onclose)
      );

      this.mErrorCode = event.code;

      if (this.mCallBackFun) this.mCallBackFun(CONNECTTYPE.CLOSE);
      this.reconnect(event.target.url);
    };

    this.mClientSockets.onerror = (event) => {
      console.log("[initEventHandle]websocket服务出错了 onerror", event);
      this.mClientSockets.removeEventListener(
        "error",
        (this.mClientSockets, this.mClientSockets.onerror)
      );
      this.mErrorCode = event.code;

      if (this.mCallBackFun) this.mCallBackFun(CONNECTTYPE.ERROR);
    };

    this.mClientSockets.onopen = (event) => {
      console.log("[initEventHandle]websocket 连接成功 onopen", event);
      this.mReConnectNum = CONNECT_NUM;
      if (this.mCallBackFun) this.mCallBackFun(CONNECTTYPE.OPEN);
      if (DEBUG)
        console.log("[initEventHandle]websocket onopen  ", this.mClientSockets);
    };

    this.mClientSockets.onmessage = (event) => {
      if (DEBUG) console.log(event.data, typeof event.data);
      //如果获取到消息，心跳检测重置
      //两层解析没有必要了
      var data = JSON.parse(event.data);
      // data = JSON.parse(data.message);
      if (DEBUG) console.log(data);
      if (data.type !== "HeartBeat") {
        var type = data.type;
        var msg = data.msg;
        if (DEBUG) console.log(type, msg);
      } else {
        console.log("recv   heart");
        let wsTime = new Date().getTime() - data.timeH5;
        this.mLostNum--;
        if (this.mLostNum < 0) {
          this.mLostNum = 0;
        }
      }
    };
  }

  /**
   * 重连,有可能外部调用
   * @param {*} url
   */
  public reconnect(url) {
    if (DEBUG) {
      console.log("事件重连");
    }

    --this.mReConnectNum;
    //没连接上会一直重连，设置延迟避免请求过多
    // let sleeptime = this.mWsReconnectTime*(CONNECT_NUM-this.mReConnectNum);
    let sleeptime = this.mWsReconnectTime * 1;

    console.log("[reconnect] mReConnectNum is: ", this.mReConnectNum);
    if (this.mReConnectNum <= 0) {
      //如果没有次数了则不再重连

      /**如果此时连接没有成功，切重连的次数已经用光，则请求http请求来获取当前的数据 */
      //当mReConnectNum = 0时留给了http请求获取数据，进行同步
      if (
        this.mClientSockets.readyState != this.mClientSockets.OPEN &&
        this.mReConnectNum == 0
      ) {
        if (this.mCallBackFun) {
          this.mCallBackFun(CONNECTTYPE.TIMEOUT);
        }
      }
      return;
    }

    setTimeout(() => {
      if (DEBUG) {
        console.log(
          "[reconnect] setTimeout sleep 1s called,  mReConnectNum is: ",
          this.mReConnectNum
        );
        console.log(
          "[reconnect] setTimeout sleep time is: ",
          sleeptime,
          "    now net time is ",
          new Date().getTime()
        );
      }

      if (this.mClientSockets.readyState != this.mClientSockets.OPEN) {
        if (DEBUG) {
          console.log(
            "[reconnect] mClientSockets will be close and begin new connect"
          );
        }

        this.mClientSockets.close(); //关闭websocket
        this.mClientSockets = null;
        this.createWebSocket(url);
      } else {
        console.log(
          "[reconnect] mClientSockets has been connected no need reconnect, readyState:  ",
          this.mClientSockets.readyState
        );
      }
    }, sleeptime);
  }

  /**发送消息 */
  public send_data(data) {
    let sock = this.mClientSockets;
    if (DEBUG) console.log(sock, data);
    if (DEBUG) console.log(typeof data);
    if (sock && this.mClientSockets.readyState == this.mClientSockets.OPEN) {
      sock.send(data);
    } else {
      // this.mReConnectNum = CONNECT_NUM;
      if (DEBUG)
        console.log("[send_data] reset mReConnectNum is ", CONNECT_NUM);
      console.log("send_data---" + data);
      this.reconnect(this.mWsUrl);
    }
  }
  /**发送心跳，发送的时候进行断线判断，如果丢失则启动断线操作 */
  public sendHeartBeat(_pack) {
    if (this.mLostNum >= LOST_NUM) {
      if (DEBUG) {
        console.log("maybe   websocket  shutdown ，do something");
      }
    }

    this.mReConnectNum = CONNECT_NUM;
    this.send_data(_pack);
    if (DEBUG)
      console.log("[sendHeartBeat] send heard packet message: ", _pack);
    this.mLostNum++;
  }

  /**websocket 连接是否成功 */
  public getIsSuccess() {
    return this.mClientSockets.readyState == this.mClientSockets.OPEN;
  }
}

export default WebSocketCom.getInstance();
