//model.js
define('Model', ['THREE', 'Part', 'Pose', 'Animation'], function (THREE, Part, Pose, Animation) {
    return class Model {
        constructor(options, callback) {
            this.skin = new Image();
            this.skinLayers = [];
            this.canvas;
            this.context;
            this.parts = {};
            this.mesh = new THREE.Mesh();
            this.partsData = {};
            this.name = '';
            this.texture;
            this.parent;
            this.typeMap = {}; //object
            this.typeIndex = 0;
            this.defaultType;
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
            if (this.defaultType !== undefined) this.typeIndex = this.typeMap[this.defaultType] || 0;
            else console.warn('No Model Type!');

            if (this.versionIndex !== undefined) this.version = this.versionMap[this.versionIndex] || 0;
            else console.warn('No Model Version!');
            this.mesh.name = this.name;
            this.skin.onload = function () {
                console.log('skin loaded')
                _this.update().initPoses().initAnimations();
            };
            if (this.callback instanceof Function) this.callback(this);
            return this;
        };

        initPoses() {
            let defaultPoseData = {};
            for (let partName in this.parts) {
                defaultPoseData[partName] = {
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
            // this.doPose('walk');
            return this;
        };

        initAnimations() {
            if (this.animations !== undefined) {
                for (let animationIndex in this.animations) {
                    let animationName = this.animations[animationIndex].name;
                    this.ANIMATIONS[animationName] = new Animation(this.animations[animationIndex], this.POSES).init();
                }
            }
            this.doAnimation('walk');
            return this;
        }

        doPose(poseName) {
            this.POSES[poseName] && this.POSES[poseName].do(false);
            return this;
        };

        doAnimation(animateName) {
            this.ANIMATIONS[animateName] !== undefined && this.ANIMATIONS[animateName].do();
            return this;
        };

        update(original) {
            let _this = this;
            let length = Object.keys(this.parts).length;
            if (length == 0) {
                for (let partName in this.partsData) {
                    let part = new Part({
                        name: partName,
                        skin: _this.skin,
                        data: _this.partsData[partName],
                        typeIndex: _this.typeIndex,
                        version: _this.version,
                        position: _this.partsData[partName].position,
                        center: _this.partsData[partName].center,
                        model: _this
                    });
                    this.mesh.add(part.mesh);
                    this.parts[partName] = part;
                }
                this.mesh.position.set(0, 0, 0);
            } else {
                for (let partName in this.partsData) {
                    this.parts[partName].setSkinLayers(this.skinLayers);
                    original ? this.parts[partName].reloadOriginalSkin() : this.parts[partName].drawSkin();
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

        focusePart(partName) {
            // if (this.animating == false)
            for (let partIndex in this.partsData) {
                if (partIndex == partName){
                    this.parts[partIndex].focuse();
                }else this.parts[partIndex].unFocuse();
            }
        }

        resetFocuse() {
            // if (this.animating == false)
            for (let partIndex in this.partsData) this.parts[partIndex].resetFocuse();
        }
    }
});
