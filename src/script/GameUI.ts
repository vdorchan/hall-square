import { ui } from "./../ui/layaMaxUI";

/**
 * 本示例采用非脚本的方式实现，而使用继承页面基类，实现页面逻辑。在IDE里面设置场景的Runtime属性即可和场景进行关联
 * 相比脚本方式，继承式页面类，可以直接使用页面定义的属性（通过IDE内var属性定义），比如this.tipLbll，this.scoreLbl，具有代码提示效果
 * 建议：如果是页面级的逻辑，需要频繁访问页面内多个元素，使用继承式写法，如果是独立小模块，功能单一，建议用脚本方式实现，比如子弹脚本。
 */
export default class GameUI extends ui.test.TestSceneUI {
  private _scene: Laya.Scene3D;
  private camera: Laya.Camera;
  private currentIndex: number = 1;
  private currentRotateX: number = 0;

  rotateNum: number[] = [-0.6, -1.6, -2.6];

  mouseDownX = 0;
  isMouseDown = false;
  lastMouseX = 0;
  mouseDownTime: number;

  isMoving = false;
  targetX = null;
  isReverse = false;

  progressLabel: Laya.Label;

  constructor() {
    super();

    Laya.MouseManager.multiTouchEnabled = false;
    Laya3D.init(0, 0);
    Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
    Laya.stage.screenMode = Laya.Stage.SCREEN_HORIZONTAL;

    const [browserWidth, browserheight] = [
      Laya.Browser.width,
      Laya.Browser.height,
    ].sort((a, b) => (a < b ? 1 : -1));

    this.progressLabel = this.scene.getChildByName("progress") as Laya.Label;
    this.progressLabel.pos(
      browserWidth / 2 - this.progressLabel.width / 2,
      browserheight / 2 - this.progressLabel.height / 2
    );
    this.preloadRes();
  }

  preloadRes() {
    var resource = ["res/LayaScene_0702_01/Conventional/5.ls"];
    Laya.loader.create(
      resource,
      Laya.Handler.create(this, () => setTimeout(() => this.onPreLoadFinish(), 500)),
      Laya.Handler.create(this, this.onProgress)
    );
  }

  onProgress(p) {
    this.progressLabel.text = Math.ceil(p * 100) + "%";
  }

  onPreLoadFinish() {
    // 主场景
    this._scene = Laya.stage.addChild(
      Laya.Loader.getRes("res/LayaScene_0702_01/Conventional/5.ls")
    ) as Laya.Scene3D;

    this.camera = this._scene.getChildByName("Main Camera") as Laya.Camera;

    const rotateX = this.rotateNum[this.currentRotateX]
    this.camera.transform.rotate(new Laya.Vector3(0, rotateX, 0));
    this.currentRotateX = rotateX;

    Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.handleMouseDown);
    Laya.stage.on(Laya.Event.MOUSE_UP, this, this.handleMouseUp);

    Laya.timer.frameLoop(1, this, () => {
      if (this.isMouseDown && !isNaN(this.lastMouseX) && !this.isMoving) {
        if (Math.abs(this.lastMouseX - this.mouseX) > 10) {
          this.switchRotate(this.lastMouseX < this.mouseX);
          this.handleMouseUp();
        }
      }
      this.lastMouseX = Laya.stage.mouseX;

      if (this.isMoving && this.targetX) {
        const rotateX = this.isReverse ? 0.02 : -0.02;
        const currentRotateX = this.isReverse
          ? Math.min(this.currentRotateX + rotateX, this.targetX)
          : Math.max(this.currentRotateX + rotateX, this.targetX);

        this.camera.transform.rotate(
          new Laya.Vector3(0, currentRotateX - this.currentRotateX, 0)
        );
        this.currentRotateX = currentRotateX;
        if (this.currentRotateX === this.targetX) {
          this.isMoving = false;
          this.targetX = null;
        }
      }
    });

    //添加方向光
    const directionLight: Laya.DirectionLight = this._scene.addChild(
      new Laya.DirectionLight()
    ) as Laya.DirectionLight;
    directionLight.color = new Laya.Vector3(0.6, 0.6, 0.6);
    directionLight.transform.worldMatrix.setForward(new Laya.Vector3(1, -1, 0));
  }

  switchRotate(reverse) {
    this.isReverse = reverse;
    const index = this.currentIndex + (reverse ? -1 : 1);
    if (index >= 0 && index <= 2) {
      this.currentIndex = index;
      this.isMoving = true;
      this.targetX = this.rotateNum[index];
    }
  }

  handleMouseDown() {
    this.isMouseDown = true;
    this.lastMouseX = Laya.stage.mouseX;
    this.mouseDownX = Laya.stage.mouseX;
  }

  handleMouseUp() {
    this.isMouseDown = false;
    this.lastMouseX = null;
  }
}
