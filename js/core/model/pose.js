define('Pose', ['THREE', 'TWEEN'], function (THREE, TWEEN) {
    return class Pose {
        constructor(options) {
            this.name = options.name;
            this.posesData = options.defination;
            this.duration = options.duration || 1000;
            this.repeat = options.repeat || 0;
            this.currentTweenData = {};
            this.targetTweenData = {};
            this.tween = {};
            this.nextPose = undefined;
        };

        init(model) {
            this.model = model;
            this.updateCurrentState().updateTargetState();
            delete this.posesData;
            let p = this;

            function onUpdate() {
                for (let partIndex in p.model.mesh.children) {
                    let partName = p.model.mesh.children[partIndex].name;
                    let translateX = this[partName + '_translateX'];
                    let translateY = this[partName + '_translateY'];
                    let translateZ = this[partName + '_translateZ'];
                    let rotateX = this[partName + '_rotateX'];
                    let rotateY = this[partName + '_rotateY'];
                    let rotateZ = this[partName + '_rotateZ'];
                    let scaleX = this[partName + '_scaleX'];
                    let scaleY = this[partName + '_scaleY'];
                    let scaleZ = this[partName + '_scaleZ'];
                    p.model.mesh.children[partIndex].position.set(translateX, translateY, translateZ);
                    p.model.mesh.children[partIndex].children[0].rotation.x = rotateX;
                    p.model.mesh.children[partIndex].children[0].rotation.y = rotateY;
                    p.model.mesh.children[partIndex].children[0].rotation.z = rotateZ;
                    p.model.mesh.children[partIndex].scale.set(scaleX, scaleY, scaleZ);
                }
            };

            let onStart = () => {
                p.model.currentPose = p.name;
            };
            this.tween = new TWEEN.Tween(this.currentTweenData)
                .to(this.targetTweenData, this.duration)
                .easing(TWEEN.Easing.Linear.None)
                .repeat(this.repeat)
                .onStart(onStart)
                .onUpdate(onUpdate);
            return this;
        };

        setNextPose(nextPose) {
            this.nextPose = nextPose;
        }

        do(chain) {
            this.updateCurrentState();
            this.model.mesh.currentPose = this.name;
            let p = this;

            function onComplete() {
                if (chain && p.nextPose) p.nextPose.do(chain);
            }

            this.tween.start().onComplete(onComplete);
            return this;
        };

        updateCurrentState() {
            for (let partIndex in this.model.mesh.children) {
                let part = this.model.mesh.children[partIndex];
                let partName = part.part.name;
                this.currentTweenData[partName + '_translateX'] = part.position.x;
                this.currentTweenData[partName + '_translateY'] = part.position.y;
                this.currentTweenData[partName + '_translateZ'] = part.position.z;
                // partName=='leftArm'&& console.log(part.children[0].rotation.x)
                this.currentTweenData[partName + '_rotateX'] = part.children[0].rotation.x;
                this.currentTweenData[partName + '_rotateY'] = part.children[0].rotation.y;
                this.currentTweenData[partName + '_rotateZ'] = part.children[0].rotation.z;
                this.currentTweenData[partName + '_scaleX'] = part.scale.x;
                this.currentTweenData[partName + '_scaleY'] = part.scale.y;
                this.currentTweenData[partName + '_scaleZ'] = part.scale.z;
            }
            return this;
        };

        updateTargetState() {
            for (let partName in this.posesData) {
                let part = this.posesData[partName];
                if (part.translate) {
                    this.targetTweenData[partName + '_translateX'] = part.translate.x || this.currentTweenData[partName + '_translateX'];
                    this.targetTweenData[partName + '_translateY'] = part.translate.y || this.currentTweenData[partName + '_translateY'];
                    this.targetTweenData[partName + '_translateZ'] = part.translate.z || this.currentTweenData[partName + '_translateZ'];
                }
                if (part.rotate) {
                    let euler = new THREE.Euler(THREE.Math.degToRad(part.rotate.x), THREE.Math.degToRad(part.rotate.y), THREE.Math.degToRad(part.rotate.z));
                    this.targetTweenData[partName + '_rotateX'] = euler.x || this.currentTweenData[partName + '_rotateX'];
                    this.targetTweenData[partName + '_rotateY'] = euler.y || this.currentTweenData[partName + '_rotateY'];
                    this.targetTweenData[partName + '_rotateZ'] = euler.z || this.currentTweenData[partName + '_rotateZ'];
                }
                if (part.scale) {
                    this.targetTweenData[partName + '_scaleX'] = part.scale.x || this.currentTweenData[partName + '_scaleX'];
                    this.targetTweenData[partName + '_scaleY'] = part.scale.y || this.currentTweenData[partName + '_scaleY'];
                    this.targetTweenData[partName + '_scaleZ'] = part.scale.z || this.currentTweenData[partName + '_scaleZ'];
                }

            }
            return this;
        };
    }
});
