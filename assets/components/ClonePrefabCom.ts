const { ccclass, property } = cc._decorator;

const CloneTime = cc.Enum({
  onLoad: 0,
  start: 1,
  onEnable: 2,
});

@ccclass
export default class ClonePrefab extends cc.Component {
  @property({
    type: cc.Prefab,
    displayName: "预制"
  })
  prefab: cc.Prefab = null;

  @property({
    type: CloneTime,
    displayName: "创建时机",
    tooltip: "执行替代时机",
  })
  whenClone = CloneTime.onLoad;

  prefabNode: cc.Node = null;

  onLoad() {
    if (this.whenClone === CloneTime.onLoad) {
      this.doClone();
    }
  }

  onEnable() {
    if (this.whenClone === CloneTime.onEnable) {
      this.doClone();
    }
  }

  doClone() {
    const cloneNode = cc.instantiate(this.prefab);
    this.node.addChild(cloneNode);
    this.prefabNode = cloneNode;
  }

  start() {
    if (this.whenClone === CloneTime.start) {
      this.doClone();
    }
  }
}
