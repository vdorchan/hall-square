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
            this.currentIndex = 0;
            this.currentY = 0;
            this.rotateNum = [-0.6, -1.6, -2.6];
            this.touchStartX = 0;
            this.preloadRes();
        }
        preloadRes() {
            var resource = ['res/LayaScene_0702_01/Conventional/5.ls'];
            Laya.loader.create(resource, Laya.Handler.create(this, this.onPreLoadFinish), Laya.Handler.create(this, this.onProgress));
        }
        onProgress(p) { }
        onPreLoadFinish() {
            this._scene = Laya.stage.addChild(Laya.Loader.getRes('res/LayaScene_0702_01/Conventional/5.ls'));
            this.camera = this._scene.getChildByName('Main Camera');
            this.camera.transform.rotate(new Laya.Vector3(0, -0.6, 0));
            this.currentY = -0.6;
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.handleMouseDown);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.handleMouseUp);
            console.log(this.camera);
            var directionLight = this._scene.addChild(new Laya.DirectionLight());
            directionLight.color = new Laya.Vector3(0.6, 0.6, 0.6);
            directionLight.transform.worldMatrix.setForward(new Laya.Vector3(1, -1, 0));
        }
        switchRotate(reverse) {
            const index = this.currentIndex + (reverse ? -1 : 1);
            if (index >= 0 && index <= 2) {
                this.currentIndex = index;
                const rotateY = this.rotateNum[index] - this.currentY;
                this.currentY += rotateY;
                this.camera.transform.rotate(new Laya.Vector3(0, rotateY, 0));
            }
        }
        handleMouseDown() {
            this.touchStartX = Laya.stage.mouseX;
            console.log('this.touchStartX', this.touchStartX);
        }
        handleMousemove() {
        }
        handleMouseUp() {
            const distance = Laya.stage.mouseX - this.touchStartX;
            console.log({ distance });
            if (Math.abs(distance) > 100) {
                this.switchRotate(distance < 0);
            }
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
