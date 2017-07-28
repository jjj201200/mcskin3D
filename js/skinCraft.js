define('SkinCraft', [
    'require', 
    'THREE', 
     'jquery', 
     'Model', 
     'SceneRenderer',
     'Common',
     'item.Skin',
     'item.Component',
     'Queue',
     ], function (require, THREE, $, Model, SceneRenderer, Common, Skin, Component, Queue) {
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
                this.loadModel(this.modelName);
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
            // this.skinImg.onload = function () {
                // _this.model.addSkin(this);
            // };
            this.skinImg.onerror = function () {};
            return this;
        };
        this.loadModel = function (modelName) {
        //         let model = Chicken;
           require(['model.' + modelName],function(model){
                if (model!=undefined && model instanceof Model) {
                    // _this.queue = new Queue(model);
                    _this.model = model;
                    _this.sceneRenderer.addModel(_this.model);
                }else throw new Error('no model');
                return _this;
            });
        };
        this.init(options);
    }

    return SkinCraft;
});
