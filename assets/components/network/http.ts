class HttpCom {
  private static _instance: HttpCom = null;
  public static getInstance(): HttpCom {
    if (!this._instance) {
      this._instance = new HttpCom();
    }
    return this._instance;
  }
}

export default HttpCom.getInstance();
