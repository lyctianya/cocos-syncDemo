const { ccclass, property } = cc._decorator;

const CSC_voicePath = "db://assets/componentlib/voice/";
const audioList = [
  "",
  "long_01.mp3",
  "long_02.mp3",
  "long_03.mp3",
  "short_01.mp3",
  "short_02.wav",
  "short_03.mp3",
];

const JUDGE_VOICE_TYPE = cc.Enum({
  无: 0,
  正确长1: 1,
  正确长2: 2,
  正确长3_答对了: 3,
  正确短1: 4,
  正确短2: 5,
  正确短3: 6,
});

@ccclass
export default class Helloworld extends cc.Component {
  @property({
    type: JUDGE_VOICE_TYPE,
    displayName: "判断错误音频",
    editorOnly: true,
  })
  _wrongAudio = JUDGE_VOICE_TYPE.无;

  @property({
    type: JUDGE_VOICE_TYPE,
    displayName: "判断错误音频",
  })
  set wrong(value) {
    if (value === this._wrongAudio) {
      return;
    }
    this._wrongAudio = value;
    if (this._wrongAudio === JUDGE_VOICE_TYPE.无) {
      this.wrongAudio = null;
      return;
    }
    this.autoSetAudioClip(audioList[this._wrongAudio], (uuid) => {
      this.wrongAudio = uuid;
    });
  }

  get wrong() {
    return this._wrongAudio;
  }

  @property({
    type: cc.AudioClip,
    tooltip: "通过‘判断错误音频’自动设置",
    displayName: "错误音频",
  })
  wrongAudio: cc.AudioClip = null;

  @property({
    type: cc.Sprite,
    displayName: "图片",
    visible() {
      return this._wrongAudio === JUDGE_VOICE_TYPE.正确短1;
    },
  })
  bg: cc.Sprite = null;

  private _nodeNum = 1;

  @property({
    type: cc.Integer,
    max: 10,
    min: 0,
    displayName: "节点数量",
  })
  set nodeNum(vale) {
    this._nodeNum = vale;
    this.updateNode(this._nodeNum);
  }

  get nodeNum() {
    return this._nodeNum;
  }

  start() { }

  updateNode(num: number) {
    for (let i = 0; i < num; i++) {
      this.node.addChild(new cc.Node());
    }
  }

  autoSetAudioClip(url: string, cb = (ret) => { }) {
    cc.loader.load(
      {
        type: "uuid",
        uuid: Editor.assetdb.remote.urlToUuid(CSC_voicePath + url),
      },
      null,
      (e, data) => {
        if (e) {
          console.error("设置失败", url);
          return;
        }
        cb && cb(data);
      }
    );
  }
}
