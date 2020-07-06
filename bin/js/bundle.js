(function () {
    'use strict';

    var REG = Laya.ClassUtils.regClass;
    var ui;
    (function (ui) {
        var test;
        (function (test) {
            class TestSceneUI extends Laya.Scene {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("test/TestScene");
                }
            }
            test.TestSceneUI = TestSceneUI;
            REG("ui.test.TestSceneUI", TestSceneUI);
        })(test = ui.test || (ui.test = {}));
    })(ui || (ui = {}));

    class GameUI extends ui.test.TestSceneUI {
        constructor() {
            super();
            this.currentIndex = 1;
            this.currentRotateX = 0;
            this.rotateNum = [-0.6, -1.6, -2.6];
            this.mouseDownX = 0;
            this.isMouseDown = false;
            this.lastMouseX = 0;
            this.isMoving = false;
            this.targetX = null;
            this.isReverse = false;
            Laya.MouseManager.multiTouchEnabled = false;
            Laya3D.init(0, 0);
            Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
            Laya.stage.screenMode = Laya.Stage.SCREEN_HORIZONTAL;
            const [browserWidth, browserheight] = [
                Laya.Browser.width,
                Laya.Browser.height,
            ].sort((a, b) => (a < b ? 1 : -1));
            this.progressLabel = this.scene.getChildByName("progress");
            this.progressLabel.pos(browserWidth / 2 - this.progressLabel.width / 2, browserheight / 2 - this.progressLabel.height / 2);
            this.preloadRes();
        }
        preloadRes() {
            var resource = ["res/LayaScene_0702_01/Conventional/5.ls"];
            Laya.loader.create(resource, Laya.Handler.create(this, () => setTimeout(() => this.onPreLoadFinish(), 500)), Laya.Handler.create(this, this.onProgress));
        }
        onProgress(p) {
            this.progressLabel.text = Math.ceil(p * 100) + "%";
        }
        onPreLoadFinish() {
            this._scene = Laya.stage.addChild(Laya.Loader.getRes("res/LayaScene_0702_01/Conventional/5.ls"));
            this.camera = this._scene.getChildByName("Main Camera");
            const rotateX = this.rotateNum[this.currentRotateX];
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
                    this.camera.transform.rotate(new Laya.Vector3(0, currentRotateX - this.currentRotateX, 0));
                    this.currentRotateX = currentRotateX;
                    if (this.currentRotateX === this.targetX) {
                        this.isMoving = false;
                        this.targetX = null;
                    }
                }
            });
            const directionLight = this._scene.addChild(new Laya.DirectionLight());
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

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("script/GameUI.ts", GameUI);
        }
    }
    GameConfig.width = 640;
    GameConfig.height = 1136;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "test/TestScene.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
        }
    }
    new Main();

}());
