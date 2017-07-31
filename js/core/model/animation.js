define('Animation', ['pose'], function (Pose) {
    class Animation {
        constructor(options, poses) {
            this.name = options.name;
            this.timeline = options.timeline;
            this.restart = options.restart;
            this.POSES = poses;
            this.topPose = undefined;
        };

        init() {
            if (this.timeline instanceof Array) {
                let headPose, nextPose;
                let length = this.timeline.length;
                for (let poseIndex = 0; poseIndex < length; ++poseIndex) {
                    let poseName = this.timeline[poseIndex];
                    if (this.POSES[poseName] !== undefined) {
                        if (headPose === undefined) {
                            this.topPose = this.POSES[poseName];
                            headPose = this.POSES[poseName];
                        } else {
                            headPose.setNextPose(this.POSES[poseName]);
                            headPose = this.POSES[poseName];
                        }
                        if (poseIndex + 1 === length && this.restart) {
                            headPose.setNextPose(this.topPose);
                        }
                    } else console.warn('Animation:error pose name');
                }
            } else console.error('Animation:error timeline!');
            return this;
        };
        do() {
            this.topPose.do(true);
            return this;
        };
    }
    return Animation;
});
