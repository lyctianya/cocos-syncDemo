class MusicManger {
  preSoundID: number = null;
  //  加载音乐
  loadEffect(_name, _callBack?) {
    cc.loader.loadRes(_name, function (err, clip) {
      if (err) {
        console.log('loadMusic  "_name" error');
      } else {
        if (_callBack) _callBack();
      }
    });
  }

  effectPlayError(_path: string) {
    if (cc.loader.md5Pipe) {
      _path = cc.loader.md5Pipe.transformURL(_path);
      console.log("[iosPlayeEffect] md5pipe", _path);
    }
    let rootPath = window.location.href.split("index");
    let effPath = rootPath[0] + _path;
    console.error("[error] playerID:", " url:", effPath);
  }

  play(_clip, _loop = false) {
    let id = cc.audioEngine.playEffect(_clip, _loop);
    return id;
  }

  /**播放音效
   * @_name      当前的音频
   * @_isOnly    是否停止正在播放的音频，为true的时候停止,默认为true
   * @_callBack  回调函数
   */
  playEffect(_name, _isOnly = true, _callBack = null) {
    if (_isOnly == true && this.preSoundID != null)
      cc.audioEngine.stopEffect(this.preSoundID);
    cc.loader.loadRes(_name, (err, clip) => {
      if (clip && clip._audio.sampleRate != RATE) {
        this.effectPlayError(clip.nativeUrl);
      }

      let id = this.play(clip, false);
      if (_isOnly == true) this.preSoundID = id;
      cc.audioEngine.setFinishCallback(id, () => {
        if (_callBack && _callBack != null) _callBack();
      });
    });
  }

  // 传入 clip 播放音乐
  playEffectClip(_clip, _isOnly = true, _callBack = null) {
    if (_isOnly == true && this.preSoundID != null)
      cc.audioEngine.stopEffect(this.preSoundID);
    let self = this;
    let id = self.play(_clip, false);
    if (_isOnly == true) self.preSoundID = id;
    cc.audioEngine.setFinishCallback(id, () => {
      if (_callBack && _callBack != null) _callBack();
    });
  }
  //  停止音效
  stopEffect() {
    cc.audioEngine.stopAllEffects();
  }

  // 播放背景音效
  playBgMusic(path) {
    cc.loader.loadRes(path, cc.AudioClip, function (err, clip) {
      cc.audioEngine.playMusic(clip, true);
    });
  }
  // 停止背景音效
  pauseBgMusic() {
    cc.audioEngine.pauseMusic();
  }
  // 恢复背景音效
  resumeBgMusic() {
    cc.audioEngine.resumeMusic();
  }
  /**设置背景音乐声音大小
   * @volume  :参数为0 - 1.0
   */
  setBgMusicVolume(volume) {
    cc.audioEngine.setMusicVolume(volume);
  }
  /**设置音效声音大小
   * @volume  :参数为0 - 1.0
   */
  setEffectVolume(volume) {
    cc.audioEngine.setEffectsVolume(volume);
  }
}
export default new MusicManger();
