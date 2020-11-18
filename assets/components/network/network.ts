const { ccclass, property } = cc._decorator;

/**
 * 网络连接状态
 */
export enum NetWorkState {
  NetWorkState_NONE,
  NetWorkState_CONNECTING,
  NetWorkState_CONNECTED,
  NetWorkState_ERROR,
  NetWorkState_CLOSE,
  NetWorkState_TIMEOUT,
  NetWorkState_MAX,
}

@ccclass
export class NetWork {
  private static m_sInstance: NetWork = null;

  private m_cDstIP: string = "";
  private m_pSocket: WebSocket = null;
  private m_eNetWorkState: NetWorkState = NetWorkState.NetWorkState_NONE;
  private m_vDelegates: any[] = [];
  private m_bReciveHeadMsg: boolean = false;
  private m_nHeartbeatNum: any = -1; // 心跳包句柄
  private m_nConnectNum: any = -1; // 重连句柄
  private m_bIsSendHeard: boolean = true;
  private m_vMessageCallBack: any[] = [];
  private m_nConnectCount: number = 0; //当前连接的次数（用于判断重连的提示，比如连接三次都没连接上就提示玩家检查网络）
  private m_bIsHoldClose: boolean = false; //是否是手动关闭

  private m_nforgroundCount: number = -1;
  private m_nConnectGameServerNum: number = -1; //连接逻辑服务器的句柄
  private m_nConnectGameServerNum_1: number = -1; //连接逻辑服务器的句柄

  /**
   * 连接地址
   */
  private socketIP: string = "ws://192.168.0.127:8080";

  public getSocketIP(): string {
    return this.socketIP;
  }

  /**
   * 设置是否自动连接
   * @param is 是否自动连接
   */
  public setAutoConnect(is: boolean): void {
    this.m_bIsAutoConnect = is;
  }

  private forgroundConnect(): void {
    if (this.m_nforgroundCount != -1) {
      clearTimeout(this.m_nforgroundCount);
    }
    this.m_nforgroundCount = setTimeout(() => {
      this.socketIP && this.connect(this.socketIP, false);
    }, 500);
  }

  /**
   * 应用程序进入前台
   */
  private applocationEnterForeground(): void {
    console.log("applocationEnterForeground");
    this.forgroundConnect();
  }
  /**
   * 应用程序进入后台
   */
  private applocationEnterBackground(): void {
    console.log("applocationEnterBackground");
    this.closeNetWork(true);
  }

  public static getInstance(): NetWork {
    if (!this.m_sInstance) {
      this.m_sInstance = new NetWork();
      this.m_sInstance.init();
    }
    return this.m_sInstance;
  }

  private init(): void {
    this.m_eNetWorkState = NetWorkState.NetWorkState_NONE;
    this.m_bReciveHeadMsg = false;
    this.m_nHeartbeatNum = -1;
    this.m_nConnectNum = -1;

    cc.game.on(cc.game.EVENT_SHOW, this.applocationEnterForeground, this);
    cc.game.on(cc.game.EVENT_HIDE, this.applocationEnterBackground, this);
  }
  /**
   * 获取当前重连的次数
   */
  public getConnectCount(): number {
    return this.m_nConnectCount;
  }

  /**
   * 返回当前网络状态
   */
  public getNetWorkState(): NetWorkState {
    return this.m_eNetWorkState;
  }

  /**
   * 网络是否已经连接
   */
  public isConnect(): boolean {
    return this.getNetWorkState() == NetWorkState.NetWorkState_CONNECTED;
  }

  /**
   * 把自己添加到队列里，用于接受消息，要实现
   * public onMsg(msg: any):boolean{....}方法才能接收到消息
   * 如果你确定这个消息只在你这处理，就return true;否则return false；
   * @param delegate 需要接收消息的本身
   */
  public addDelegate(delegate: any): void {
    this.m_vDelegates.push(delegate);
  }

  /**
   * 把自己从队列里移除
   * @param delegate 添加时传入的对象本身
   */
  public removeDelegate(delegate: any): void {
    for (let idx = 0; idx < this.m_vDelegates.length; idx++) {
      if (this.m_vDelegates[idx] == delegate) {
        this.m_vDelegates.splice(idx, 1);
        break;
      }
    }
  }

  /**
   * 手动关闭连接
   */
  public closeNetWork(isHoldClose): void {
    this.m_cDstIP = "";
    let state = this.getNetWorkState();
    console.log("手动关闭 state : ", state);
    this.m_bIsHoldClose = isHoldClose;
    if (this.m_pSocket) {
      this.m_pSocket.onopen = () => {};
      this.m_pSocket.onclose = () => {};
      this.m_pSocket.onerror = () => {};
      this.m_pSocket.onmessage = () => {};
      this.m_pSocket.close();
    }
    this.onClose(null);
  }

  /**
   * 延时重新连接
   */
  private timeOutConnect(): void {
    this.m_pSocket && this.closeNetWork(false);
    if (!this.m_bIsHoldClose) {
      if (this.m_nConnectNum != -1) {
        clearTimeout(this.m_nConnectNum);
      }
      this.m_nConnectNum = setTimeout(() => {
        if (!this.connect(this.socketIP, false)) {
          console.log("cancel doConnect.");
        }
      }, clientDefine.clientDefine_connect_timeout);
    }
  }

  /**
   * 开始连接并赋值ip
   * @param dstIP ip ws://127.0.0.1:8080/
   * @param isSendHeard 是否发送心跳包
   * @example
   * this.connect("ws://127.0.0.1:8080/", false);
   */
  public connect(dstIP: string, isSendHeard: boolean): boolean {
    this.m_cDstIP = dstIP;
    this.m_bIsSendHeard = isSendHeard;
    return this.doConnect();
  }

  /**
   * 使用上次ip继续连接
   */
  public doConnect(): boolean {
    if (
      this.getNetWorkState() == NetWorkState.NetWorkState_CONNECTED ||
      this.getNetWorkState() == NetWorkState.NetWorkState_CONNECTING
    ) {
      cc.error("already connect to server. state = " + this.getNetWorkState());
      return false;
    }
    if (!(this.m_cDstIP && this.m_cDstIP.length > 0)) {
      cc.error("dstIP is null.");
      return false;
    }
    this.m_bIsHoldClose = false;
    console.log("connect to server. dstIP = " + this.m_cDstIP);
    this.m_nConnectCount++;
    this.m_eNetWorkState = NetWorkState.NetWorkState_CONNECTING;
    this.m_pSocket = new WebSocket(this.m_cDstIP);
    //this.m_pSocket.binaryType = "arraybuffer";//设置发送接收二进制
    this.m_pSocket.onopen = this.onOpen.bind(this);
    this.m_pSocket.onclose = this.onClose.bind(this);
    this.m_pSocket.onerror = this.onError.bind(this);
    this.m_pSocket.onmessage = this.onMessage.bind(this);
    if (this.m_nConnectGameServerNum_1 != -1) {
      clearTimeout(this.m_nConnectGameServerNum_1);
    }
    this.m_nConnectGameServerNum_1 = setTimeout(() => {
      if (!this.isConnect()) {
        this.m_pSocket && this.closeNetWork(false);
      }
    }, clientDefine.clientDefine_timeout);

    return true;
  }

  private onOpen(ev): void {
    console.log(" open ");

    if (this.m_nConnectGameServerNum_1 != -1) {
      clearTimeout(this.m_nConnectGameServerNum_1);
    }

    this.m_bIsOnConnectGameServer = false;
    this.m_nConnectCount = 0;
    this.m_eNetWorkState = NetWorkState.NetWorkState_CONNECTED;
    let pEvent = new cc.Event.EventCustom(clientDefine.clientDefine_open, true);
    cc.systemEvent.dispatchEvent(pEvent);

    this.m_bIsSendHeard && this.doSendHeadBet();
  }
  private onClose(ev): void {
    console.log(" close ");

    if (this.m_nConnectGameServerNum_1 != -1) {
      clearTimeout(this.m_nConnectGameServerNum_1);
    }

    this.m_pSocket = null;
    this.m_eNetWorkState = NetWorkState.NetWorkState_CLOSE;
    let pEvent = new cc.Event.EventCustom(
      clientDefine.clientDefine_close,
      true
    );
    cc.systemEvent.dispatchEvent(pEvent);
    this.timeOutConnect();
  }
  private onError(ev): void {
    console.log(" error ");

    if (this.m_nConnectGameServerNum_1 != -1) {
      clearTimeout(this.m_nConnectGameServerNum_1);
    }

    this.m_eNetWorkState = NetWorkState.NetWorkState_ERROR;
    let pEvent = new cc.Event.EventCustom(
      clientDefine.clientDefine_failed,
      true
    );
    cc.systemEvent.dispatchEvent(pEvent);
  }
  private onMessage(ev): void {
    let message = JSON.parse(ev.data);
    if (this.m_vMessageCallBack[message.command]) {
      this.m_vMessageCallBack[message.command](message);
      this.m_vMessageCallBack[message.command] = null;
    } else {
      for (let idx = 0; idx < this.m_vDelegates.length; idx++) {
        if (
          this.m_vDelegates[idx] &&
          typeof this.m_vDelegates[idx].onMsg === "function" &&
          this.m_vDelegates[idx].onMsg(message)
        ) {
          break;
        }
      }
    }
  }

  /**
   * 发送消息
   * @param msgBody 需要发送的消息
   * @param command 消息ID
   */
  public sendMsg(
    msgBody: object,
    command: number,
    responseCommand: number = null,
    callBack: Function = null
  ): boolean {
    if (this.isConnect()) {
      msgBody.command = command;
      this.m_pSocket.send(msgBody);
      callBack && (this.m_vMessageCallBack[responseCommand] = callBack);
      return true;
    } else {
      console.log("send msg error. state = " + this.getNetWorkState());
    }
    return false;
  }

  /**
   * 发送心跳包
   */
  private doSendHeadBet(): void {
    if (!this.isConnect()) {
      cc.error(
        "doSendHeadBet error. netWork state = " + this.getNetWorkState()
      );
      this.timeOutConnect();
      return;
    }
    this.m_bReciveHeadMsg = false;

    this.sendMsg({}, 22);

    console.log("send head msg.");
    if (this.m_nHeartbeatNum != -1) {
      clearTimeout(this.m_nHeartbeatNum);
    }
    this.m_nHeartbeatNum = setTimeout(() => {
      if (this.m_bReciveHeadMsg) {
        this.doSendHeadBet();
      } else {
        this.timeOutConnect();
      }
    }, clientDefine.clientDefine_headmsg_timeout);
  }
}
