//model.js
define('Model', ['THREE', 'Component', 'Pose', 'Animation'], function(THREE, Component, Pose, Animation) {
    class Model {
        constructor(options, callback) {
            this.skin = new Image();
            this.skinLayers = [];
            this.canvas;
            this.context;
            this.components = {};
            this.mesh = new THREE.Mesh();
            this.data = {};
            this.name = '';
            this.texture;
            this.parent;
            this.typeMap = {}; //object
            this.typeIndex = 0;
            this.type;
            this.versionMap = []; //array
            this.version;
            this.versionIndex = 0;
            this.poses = {}; //defination data
            this.POSES = {};
            this.animations = {}; //defination data
            this.ANIMATIONS = {};
            this.callback = callback;

            this.focuseTarget = new THREE.Vector3(0, 0, 0);
            this.animating = false;

            Object.assign(this, options);
            this.init();
        };
        init() {
            let _this = this;
            if (this.typeMap === undefined || this.versionMap === undefined) {
                console.error('No Model TypeMap Or VersionMap!');
                return;
            }
            if (this.type !== undefined) this.typeIndex = this.typeMap[this.type] || 0;
            else console.warn('No Model Type!');

            if (this.versionIndex !== undefined) this.version = this.versionMap[this.versionIndex] || 0;
            else console.warn('No Model Version!');
            this.mesh.name = this.name;
            this.skin.onload = function() {
                _this.update().initPoses().initAnimations()
            };
            if (this.callback instanceof Function) this.callback(this);
            return this;
        };

        initPoses() {
            let defaultPoseData = {};
            for (let componentName in this.components) {
                defaultPoseData[componentName] = {
                    translate: new THREE.Vector3(0, 0, 0),
                    rotate: new THREE.Vector3(0, 0, 0),
                    scale: new THREE.Vector3(0, 0, 0)
                }
            }
            this.POSES['default'] = new Pose({
                name: 'default',
                defination: defaultPoseData,
                duration: 1000
            }).init(this);
            if (this.poses !== undefined) {
                for (let poseIndex in this.poses) {
                    let poseName = this.poses[poseIndex].name;
                    this.POSES[poseName] = new Pose(this.poses[poseIndex]).init(this);
                }
            }
            this.doPose('walk');
            return this;
        };
        initAnimations() {
            if (this.animations !== undefined) {
                for (let animationIndex in this.animations) {
                    let animationName = this.animations[animationIndex].name;
                    this.ANIMATIONS[animationName] = new Animation(this.animations[animationIndex], this.POSES).init();
                }
            }
            // this.doAnimation('walk');
            return this;
        }
        doPose(poseName) {
            this.POSES[poseName] && this.POSES[poseName].do(false);
            return this;
        };
        doAnimation(animateName) {
            console.log(this.ANIMATIONS[animateName])
            this.ANIMATIONS[animateName] && this.ANIMATIONS[animateName].do();
            return this;
        };
        update(original) {
            let _this = this;
            let length = Object.keys(this.components).length;
            if (length == 0) {
                for (let componentIndex in this.data) {
                    let component = new Component({
                        name: componentIndex + ' ' + 'component',
                        componentName: componentIndex,
                        skin: _this.skin,
                        data: _this.data[componentIndex],
                        typeIndex: _this.typeIndex,
                        version: _this.version,
                        position: _this.data[componentIndex].position,
                        center: _this.data[componentIndex].center,
                        model: _this
                    });
                    this.mesh.add(component.mesh);
                    this.components[componentIndex] = component;
                }
                this.mesh.position.set(0, 0, 0);
            } else {
                for (let componentIndex in this.data) {
                    this.components[componentIndex].setSkinLayers(this.skinLayers);
                    original ? this.components[componentIndex].reloadOriginalSkin() : this.components[componentIndex].drawSkin();
                }
            }

            return this;
        };
        reloadOriginalSkin() {
            this.update(true);
            return this;
        };
        addSkin(skinImg) {
            if (skinImg.complete) this.skinLayers.push(skinImg);
            this.update();
            return this;
        };
        focuseComponent(componentName) {
            // if (this.animating == false)
                for (let componentIndex in this.data) {
                    if (componentIndex == componentName) this.components[componentIndex].focuse();
                    else this.components[componentIndex].unFocuse();
                }
        }
        resetFocuse() {
            // if (this.animating == false)
                for (let componentIndex in this.data) this.components[componentIndex].resetFocuse();
        }
    };

    return Model;
});
