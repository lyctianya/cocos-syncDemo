const DEBUG = true;

class HttpCom {
  private static _instance: HttpCom = null;
  public static getInstance(): HttpCom {
    if (!this._instance) {
      this._instance = new HttpCom();
    }
    return this._instance;
  }

  post(url: string, params?: Object, token?: string) {
    return new Promise((resolve, reject) => {
      let request = cc.loader.getXMLHttpRequest();
      const useUrl = url;
      if (params) {
        let arr = [];
        for (let key in params) {
          arr.push(`${key}=${params[key]}`);
        }
        url += "?" + arr.join("&");
      }
      if (token) {
        request.setRequestHeader("token", token);
      }
      request.open("POST", url);
      request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      request.onreadystatechange = () => {
        if (DEBUG)
          console.log("on  timedGetText  request.status is  ", request.status);
        if (request.status === 0) {
          // let timer = setTimeout(() =>
          //  {
          //      this.timedGetText(url,time,callback);
          //  },XMLHTTPTIME);
        }
        if (request.readyState !== 4) return;
        if (request.status === 200) {
          let data = JSON.parse(request.responseText);
          if (DEBUG) console.log(data.data);
          resolve(data);
        }
      };
      request.send(null);
    });
  }

  get(url: string, params?: Object, token?: string) {
    return new Promise((resolve, reject) => {
      let request = cc.loader.getXMLHttpRequest();
      const useUrl = url;
      if (params) {
        let arr = [];
        for (let key in params) {
          arr.push(`${key}=${params[key]}`);
        }
        url += "?" + arr.join("&");
      }
      if (token) {
        request.setRequestHeader("token", token);
      }
      request.open("GET", url);
      request.onreadystatechange = () => {
        if (DEBUG)
          console.log("on  timedGetText  request.status is  ", request.status);
        if (request.status === 0) {
          // let timer = setTimeout(() =>
          //  {
          //      this.timedGetText(url,time,callback);
          //  },XMLHTTPTIME);
        }
        if (request.readyState !== 4) return;
        if (request.status === 200) {
          let data = JSON.parse(request.responseText);
          if (DEBUG) console.log(data.data);
          resolve(data);
        }
      };
      request.send(null);
    });
  }

  /**通过网络获取json数据 */
  getNetJson(url) {
    return new Promise((resolve, reject) => {
      let request = cc.loader.getXMLHttpRequest();
      request.open("GET", url);
      request.onreadystatechange = () => {
        if (DEBUG)
          console.log("on  timedGetText  request.status is  ", request.status);
        if (request.status === 0) {
          // let timer = setTimeout(() =>
          //  {
          //      this.timedGetText(url,time,callback);
          //  },XMLHTTPTIME);
        }
        if (request.readyState !== 4) return;
        if (request.status === 200) {
          let data = JSON.parse(request.responseText);
          if (DEBUG) console.log(data.data);
          resolve(data);
        }
      };
      request.send(null);
    });
  }
}

export default HttpCom.getInstance();
