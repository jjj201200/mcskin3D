define('SkinCraft', [
    'require', 
    'THREE', 
     'jquery', 
     'Model', 
     'Steve',
     'SceneRenderer'
     ], function (require, THREE, $, Model, Steve,SceneRenderer) {
    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    function SkinCraft(options) {
        let _this = this;
        this.options = {
            modelName: 'Steve',
            model: undefined,
            skinImg: undefined,
            domElement: undefined,
        };
        this.init = function (options) {
            Object.assign(this, this.options, options);

            if (this.domElement) {
                    this.initSceneEditor();
                    this.loadModel();
            }
            return this;
        };
        
        this.initSceneEditor = function(){
            this.sceneRenderer = new SceneRenderer(this.domElement);
            return this;
        }
        this.resetCanvasSize = function () {
            return this;
        };
        this.addSkin = function (url) {
            let _this = this;
            this.skinImg = new Image;
            this.skinImg.src = url;
            this.skinImg.onload = function () {
                _this.model.addSkin(this);
            };
            this.skinImg.onerror = function () {};
            return this;
        };
        this.loadModel = function () {
            // var model = require(this.modelName);
            // console.log(model instanceof Model)
            // if (model!=undefined && model instanceof Model) {
            this.model = Steve;
            this.sceneRenderer.addModel(this.model);

            // }else console.log('no model');
            return this;
        };

        this.init(options);
    }

    return SkinCraft;
});
