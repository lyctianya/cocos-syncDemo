import { difference, unique } from "./Tools";

class MemoryManager {
  private static _instance: MemoryManager = null;
  private totalAssets: Array<string> = [];
  private curAssets: Array<string> = [];
  public static getInstance(): MemoryManager {
    if (!this._instance) {
      this._instance = new MemoryManager();
    }
    return this._instance;
  }

  /**
   * 清理所有资源
   *
   * @memberof MemoryManage
   */
  public clearAll() {
    const total = unique(this.totalAssets.concat(this.curAssets));
    if (total.length > 0) {
      cc.loader.release(total);
    }
    this.totalAssets = [];
    this.curAssets = [];
  }

  /**
   * 将节点使用资源记录在案
   *
   * @param {cc.Node} node
   * @memberof MemoryManage
   */
  public addRecord(node: cc.Node | string) {
    if (node instanceof cc.Node) {
      const sprite = node.getComponent(cc.Sprite);
      if (sprite) this.addSpriteRecord(sprite);
      const dragon = node.getComponent(dragonBones.ArmatureDisplay);
      if (dragon) this.addDragonRecord(dragon);
      const spine = node.getComponent(sp.Skeleton);
      if (spine) this.addSpineRecord(spine);
    } else {
      this.addPrefabRecord(node);
    }
  }

  public addPrefabRecord(path: string) {
    const dep = cc.loader.getDependsRecursively(path);
    this.curAssets.push(...dep);
  }

  private addSpriteRecord(sprite: cc.Sprite) {
    const dep = cc.loader.getDependsRecursively(sprite.spriteFrame);
    this.curAssets.push(...dep);
  }

  private addDragonRecord(dragon: dragonBones.ArmatureDisplay) {
    const dep = cc.loader.getDependsRecursively(dragon.dragonAtlasAsset);
    const dep3 = cc.loader.getDependsRecursively(dragon.dragonAsset);
    const dep2 = cc.loader.getDependsRecursively(dragon.getMaterial(0));
    this.curAssets.push(...dep, ...dep3, ...dep2);
  }

  private addSpineRecord(spine: sp.Skeleton) {
    const dep = cc.loader.getDependsRecursively(spine.skeletonData);
    const dep2 = cc.loader.getDependsRecursively(spine.getMaterial(0));
    this.curAssets.push(...dep, ...dep2);
  }

  /**
   * 暂存当前页面的资源记录
   *
   * @memberof MemoryManage
   */
  public savePageRecord() {
    this.totalAssets = unique(this.totalAssets.concat(this.curAssets));
    this.curAssets = [];
  }

  /**
   * 释放当前页面的资源
   *
   * @memberof MemoryManage
   */
  public releasePageRecord() {
    if (this.curAssets.length > 0) {
      const curArr = unique(this.curAssets);
      cc.loader.release(curArr);
      this.totalAssets = difference(unique(this.totalAssets), curArr);
    }
    this.curAssets = [];
  }

  /**
   * 当前页面加载完成后，释放前一个页面的特有资源
   *
   * @memberof MemoryManage
   */
  public releasePrePageRecord() {
    if (this.totalAssets.length > 0) {
      const arr = difference(unique(this.totalAssets), unique(this.curAssets));
      cc.loader.release(arr);
    }
    this.totalAssets = [];
  }
}

export default MemoryManager.getInstance();
