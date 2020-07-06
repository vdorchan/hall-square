import { ui } from './../ui/layaMaxUI'
import CameraMoveScript from './CameraMoveScript'

/**
 * 本示例采用非脚本的方式实现，而使用继承页面基类，实现页面逻辑。在IDE里面设置场景的Runtime属性即可和场景进行关联
 * 相比脚本方式，继承式页面类，可以直接使用页面定义的属性（通过IDE内var属性定义），比如this.tipLbll，this.scoreLbl，具有代码提示效果
 * 建议：如果是页面级的逻辑，需要频繁访问页面内多个元素，使用继承式写法，如果是独立小模块，功能单一，建议用脚本方式实现，比如子弹脚本。
 */
export default class GameUI extends ui.test.TestSceneUI {
  private _scene: Laya.Scene3D
  private camera: Laya.Camera
  private currentIndex: number = 0
  private currentRotateX: number = 0

  rotateNum: number[] = [-0.6, -1.6, -2.6]

  touchStartX = 0
  isTouch = false
  lastMouseX = 0

  constructor() {
    super()

    this.preloadRes()

    Laya.MouseManager.multiTouchEnabled = false
    Laya3D.init(0, 0)
    Laya.stage.scaleMode = Laya.Stage.SCALE_FULL
    Laya.stage.screenMode = Laya.Stage.SCREEN_HORIZONTAL
  }

  preloadRes() {
    var resource = ['res/LayaScene_0702_01/Conventional/5.ls']
    Laya.loader.create(resource, Laya.Handler.create(this, this.onPreLoadFinish), Laya.Handler.create(this, this.onProgress))
  }

  onProgress(p) {}

  onPreLoadFinish() {
    // 主场景
    this._scene = Laya.stage.addChild(Laya.Loader.getRes('res/LayaScene_0702_01/Conventional/5.ls')) as Laya.Scene3D

    this.camera = this._scene.getChildByName('Main Camera') as Laya.Camera
    // this.camera.addComponent(CameraMoveScript)

    this.camera.transform.rotate(new Laya.Vector3(0, -0.6, 0))
    this.currentRotateX = -0.6

    // Laya.stage.on(Laya.Event.CLICK, this, () => {
    //   const index = this.currentIndex + 1
    //   if (index >=0 && index <= 2) {
    //     this.currentIndex = index
    //     const rotateX= this.rotateNum[index] - this.currentRotateX
    //     this.currentRotateX += rotateX
    //     this.camera.transform.rotate(new Laya.Vector3(0, rotateX, 0))
    //   }
    // })

    // Laya.stage.on(Laya.Event.RIGHT_CLICK, this, () => {
    //   const index = this.currentIndex - 1
    //   if (index >=0 && index <= 2) {
    //     this.currentIndex = index
    //     const rotateX= this.rotateNum[index] - this.currentRotateX
    //     this.currentRotateX += rotateX
    //     this.camera.transform.rotate(new Laya.Vector3(0, rotateX, 0))
    //   }
    // })

    Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.handleMouseDown)
    // Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.handleMousemove)
    Laya.stage.on(Laya.Event.MOUSE_UP, this, this.handleMouseUp)

    let rotateX = 0
    Laya.timer.frameLoop(1, this, () => {
      const elapsedTime:number = Laya.timer.delta;
      if (this.isTouch && !isNaN(this.lastMouseX)) {
        var offsetX:number = Laya.stage.mouseX - this.lastMouseX;
        rotateX = offsetX * 0.00006 * elapsedTime;
        const currentRotateX = this.currentRotateX + rotateX
        if (currentRotateX < -0.6 && currentRotateX > -2.6) {
          this.currentRotateX = currentRotateX
          this.camera.transform.rotate(new Laya.Vector3(0, rotateX, 0))
        }
      }
      this.lastMouseX = Laya.stage.mouseX
    })


    console.log(this.camera)
    // Laya.stage.setChildIndex(this._scene, 0)

    //添加照相机
    // var camera: Laya.Camera = this._scene.addChild(new Laya.Camera(0, 0.1, 100)) as Laya.Camera
    // camera.transform.translate(new Laya.Vector3(0, 3, 3))
    // camera.transform.rotate(new Laya.Vector3(-30, 0, 0), true, false)

    //添加方向光
    var directionLight: Laya.DirectionLight = this._scene.addChild(new Laya.DirectionLight()) as Laya.DirectionLight
    directionLight.color = new Laya.Vector3(0.6, 0.6, 0.6)
    directionLight.transform.worldMatrix.setForward(new Laya.Vector3(1, -1, 0))
  }

  switchRotate(reverse) {
    const index = this.currentIndex + (reverse ? -1 : 1)
    if (index >= 0 && index <= 2) {
      this.currentIndex = index
      const rotateX = this.rotateNum[index] - this.currentRotateX
      this.currentRotateX += rotateX

      // Laya.Tween.to(this.camera.transform.rotate, new Laya.Vector3(0, rotateX, 0), 1000, Laya.Ease.backOut)

      // this.camera.transform.rotate(new Laya.Vector3(0, rotateX, 0))
    }
  }

  handleMouseDown() {
    this.isTouch = true
    this.touchStartX = Laya.stage.mouseX
    console.log('this.touchStartX', this.touchStartX)
  }

  handleMousemove() {
    if (!this.isTouch) {
      return
    }
    
    const distance = Laya.stage.mouseX - this.touchStartX
    console.log('move', Laya.stage.mouseX)
    this.currentRotateX += distance * 0.0000006
    this.camera.transform.rotate(new Laya.Vector3(0, this.currentRotateX, 0))
  }

  handleMouseUp() {
    this.isTouch = false
    // const distance = Laya.stage.mouseX - this.touchStartX
    // if (Math.abs(distance) > 5) {
    //   this.switchRotate(distance > 0)
    // }
  }
}
