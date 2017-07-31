/*
 * @Author: jjj201200@gmail.com 
 * @Date: 2017-07-31 14:52:59 
 * @Last Modified by: jjj201200@gmail.com
 * @Last Modified time: 2017-07-31 15:12:31
 */
/* 
    the main module of the application
    features:
        check renderer enviroment support
        initialization application
*/
define('@core/SkinCraft', [
    '@lib/THREE',
    '@lib/jQuery',
    '@core/Common',
    '@core/Renderer',
    '@core/ModelManager',
], function (THREE, $, Common, Renderer, ModelManager) {
    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    return class SkinCraft {
        constructor({ domElement }) {
            if (domElement === undefined) throw new Error('no domElement');
            this.domElement = domElement;
            this.init();
        }
        init(options) {
            this.renderer = new Renderer({ domElement: this.domElement });
            this.modelManager = new ModelManager({ renderer: this.renderer });
            
            return this;
        }

        // initSceneEditor(){
        //     this.sceneRenderer = new SceneRenderer(this.domElement);
        //     return this;
        // }
        // resetCanvasSize() {
        //     return this;
        // }
        // setSkin(url) {
        //     let _this = this;
        //     this.skinImg = new Image;
        //     this.skinImg.src = url;
        //     // this.skinImg.onload = function () {
        //     // _this.model.addSkin(this);
        //     // };
        //     this.skinImg.onerror = function () { };
        //     return this;
        // }
        // loadModel(modelName) {
        //     require(['model.' + modelName], function (model) {
        //         if (model != undefined && model instanceof Model) {
        //             _this.model = model;
        //             _this.sceneRenderer.addModel(_this.model);
        //         } else throw new Error('no model');
        //         return _this;
        //     });
        // }
    };
});