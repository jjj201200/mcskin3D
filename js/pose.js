define('Pose', ['THREE', 'TWEEN'], function (THREE, TWEEN) {
    class Pose {
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
                for (let componentIndex in p.model.mesh.children) {
                    let componentName = p.model.mesh.children[componentIndex].name;
                    let translateX = this[componentName + '_translateX'];
                    let translateY = this[componentName + '_translateY'];
                    let translateZ = this[componentName + '_translateZ'];
                    let rotateX = this[componentName + '_rotateX'];
                    let rotateY = this[componentName + '_rotateY'];
                    let rotateZ = this[componentName + '_rotateZ'];
                    let scaleX = this[componentName + '_scaleX'];
                    let scaleY = this[componentName + '_scaleY'];
                    let scaleZ = this[componentName + '_scaleZ'];
                    p.model.mesh.children[componentIndex].position.set(translateX, translateY, translateZ);
                    p.model.mesh.children[componentIndex].children[0].rotation.x = rotateX;
                    p.model.mesh.children[componentIndex].children[0].rotation.y = rotateY;
                    p.model.mesh.children[componentIndex].children[0].rotation.z = rotateZ;
                    p.model.mesh.children[componentIndex].scale.set(scaleX, scaleY, scaleZ);
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
            for (let componentIndex in this.model.mesh.children) {
                let component = this.model.mesh.children[componentIndex];
                let componentName = component.component.name;
                this.currentTweenData[componentName + '_translateX'] = component.position.x;
                this.currentTweenData[componentName + '_translateY'] = component.position.y;
                this.currentTweenData[componentName + '_translateZ'] = component.position.z;
                // componentName=='leftArm'&& console.log(component.children[0].rotation.x)
                this.currentTweenData[componentName + '_rotateX'] = component.children[0].rotation.x;
                this.currentTweenData[componentName + '_rotateY'] = component.children[0].rotation.y;
                this.currentTweenData[componentName + '_rotateZ'] = component.children[0].rotation.z;
                this.currentTweenData[componentName + '_scaleX'] = component.scale.x;
                this.currentTweenData[componentName + '_scaleY'] = component.scale.y;
                this.currentTweenData[componentName + '_scaleZ'] = component.scale.z;
            }
            return this;
        };

        updateTargetState() {
            for (let componentName in this.posesData) {
                let component = this.posesData[componentName];
                if (component.translate) {
                    this.targetTweenData[componentName + '_translateX'] = component.translate.x || this.currentTweenData[componentName + '_translateX'];
                    this.targetTweenData[componentName + '_translateY'] = component.translate.y || this.currentTweenData[componentName + '_translateY'];
                    this.targetTweenData[componentName + '_translateZ'] = component.translate.z || this.currentTweenData[componentName + '_translateZ'];
                }
                if (component.rotate) {
                    let euler = new THREE.Euler(THREE.Math.degToRad(component.rotate.x), THREE.Math.degToRad(component.rotate.y), THREE.Math.degToRad(component.rotate.z));
                    this.targetTweenData[componentName + '_rotateX'] = euler.x || this.currentTweenData[componentName + '_rotateX'];
                    this.targetTweenData[componentName + '_rotateY'] = euler.y || this.currentTweenData[componentName + '_rotateY'];
                    this.targetTweenData[componentName + '_rotateZ'] = euler.z || this.currentTweenData[componentName + '_rotateZ'];
                }
                if (component.scale) {
                    this.targetTweenData[componentName + '_scaleX'] = component.scale.x || this.currentTweenData[componentName + '_scaleX'];
                    this.targetTweenData[componentName + '_scaleY'] = component.scale.y || this.currentTweenData[componentName + '_scaleY'];
                    this.targetTweenData[componentName + '_scaleZ'] = component.scale.z || this.currentTweenData[componentName + '_scaleZ'];
                }

            }
            return this;
        };
    }
    return Pose;
});
