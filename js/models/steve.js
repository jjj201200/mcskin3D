define('model.Steve', ['THREE', 'Model', 'Pose', 'Animation'], function (THREE, Model) {
    const modelOptions = {
        name: 'Steve',
        defaultType:'steve',
        typeMap: { steve: 0, alex: 1 },
        versionMap: ['new', 'original'],
        partsData: {//parts data
            head: {
                name: 'head',
                map: [{ //map中的索引对应typeMap中的数值
                    basic: {
                        boxSize: new THREE.Vector3(8, 8, 8),
                        textureSize: new THREE.Vector3(8, 8, 8),
                        texturePosition: {
                            original: new THREE.Vector2(8, 8),
                            new: new THREE.Vector2(8, 8),
                        },
                        visible: true,
                    },
                    overlay: {
                        boxSize: new THREE.Vector3(8.6, 8.6, 8.6),
                        textureSize: new THREE.Vector3(8, 8, 8),
                        texturePosition: {
                            original: new THREE.Vector2(40, 8),
                            new: new THREE.Vector2(40, 8),
                        },
                        visible: true,
                    }
                }],
                center: new THREE.Vector3(0, -3, 0),
                position: new THREE.Vector3(0, 10, 0), //部位在模型中的定位
            },
            body: {
                name: 'body',
                map: [{
                    basic: {
                        boxSize: new THREE.Vector3(8, 12, 4),
                        textureSize: new THREE.Vector3(8, 12, 4),
                        texturePosition: {
                            original: new THREE.Vector2(20, 20),
                            new: new THREE.Vector2(20, 20),
                        },
                        visible: true,
                    },
                    overlay: {
                        boxSize: new THREE.Vector3(8.59, 12.59, 4.59),
                        textureSize: new THREE.Vector3(8, 12, 4),
                        texturePosition: {
                            original: new THREE.Vector2(20, 36),
                            new: new THREE.Vector2(20, 36),
                        },
                        visible: true,
                    }
                }],
                center: new THREE.Vector3(0, 0, 0),
                position: new THREE.Vector3(0, 0, 0)
            },
            leftArm: {
                name: 'Left Arm',
                map: [{
                    basic: {
                        boxSize: new THREE.Vector3(4, 12, 4),
                        textureSize: new THREE.Vector3(4, 12, 4),
                        texturePosition: {
                            original: new THREE.Vector2(44, 20),
                            new: new THREE.Vector2(36, 52),
                        },
                        visible: true,
                    },
                    overlay: {
                        boxSize: new THREE.Vector3(4.8, 12.8, 4.8),
                        textureSize: new THREE.Vector3(4, 12, 4),
                        texturePosition: {
                            original: new THREE.Vector2(52, 52),
                            new: new THREE.Vector2(52, 52),
                        },
                        visible: true,
                    }
                }, {
                    basic: {
                        boxSize: new THREE.Vector3(3, 12, 4),
                        textureSize: new THREE.Vector3(3, 12, 4),
                        texturePosition: {
                            original: new THREE.Vector2(44, 20),
                            new: new THREE.Vector2(36, 52),
                        },
                        visible: true,
                    },
                    overlay: {
                        boxSize: new THREE.Vector3(3.8, 12.8, 4.8),
                        textureSize: new THREE.Vector3(3, 12, 4),
                        texturePosition: {
                            original: new THREE.Vector2(52, 52),
                            new: new THREE.Vector2(52, 52),
                        },
                        visible: true,
                    }
                }],
                center: new THREE.Vector3(-2, 5, 0),
                position: new THREE.Vector3(6, 0, 0)
            },
            rightArm: {
                name: 'Right Arm',
                map: [{
                    basic: {
                        boxSize: new THREE.Vector3(4, 12, 4),
                        textureSize: new THREE.Vector3(4, 12, 4),
                        texturePosition: {
                            original: new THREE.Vector2(44, 20),
                            new: new THREE.Vector2(44, 20),
                        },
                        visible: true,
                    },
                    overlay: {
                        boxSize: new THREE.Vector3(4.8, 12.8, 4.8),
                        textureSize: new THREE.Vector3(4, 12, 4),
                        texturePosition: {
                            original: new THREE.Vector2(44, 36),
                            new: new THREE.Vector2(44, 36),
                        },
                        visible: true,
                    }
                }, {
                    basic: {
                        boxSize: new THREE.Vector3(3, 12, 4),
                        textureSize: new THREE.Vector3(3, 12, 4),
                        texturePosition: {
                            original: new THREE.Vector2(44, 20),
                            new: new THREE.Vector2(44, 20),
                        },
                        visible: true,
                    },
                    overlay: {
                        boxSize: new THREE.Vector3(3.8, 12.8, 4.8),
                        textureSize: new THREE.Vector3(3, 12, 4),
                        texturePosition: {
                            original: new THREE.Vector2(44, 36),
                            new: new THREE.Vector2(44, 36),
                        },
                        visible: true,
                    }
                }],
                center: new THREE.Vector3(2, 5, 0),
                position: new THREE.Vector3(-6, 0, 0)
            },
            leftLeg: {
                name: 'Left Leg',
                map: [{
                    basic: {
                        boxSize: new THREE.Vector3(4, 12, 4),
                        textureSize: new THREE.Vector3(4, 12, 4),
                        texturePosition: {
                            original: new THREE.Vector2(4, 20),
                            new: new THREE.Vector2(20, 52),
                        },
                        visible: true,
                    },
                    overlay: {
                        boxSize: new THREE.Vector3(4.8, 12.8, 4.8),
                        textureSize: new THREE.Vector3(4, 12, 4),
                        texturePosition: {
                            original: new THREE.Vector2(4, 52),
                            new: new THREE.Vector2(4, 52),
                        },
                        visible: true,
                    }
                }],
                center: new THREE.Vector3(0, 6, 0),
                position: new THREE.Vector3(2, -12, 0)
            },
            rightLeg: {
                name: 'Right Leg',
                map: [{
                    basic: {
                        boxSize: new THREE.Vector3(4, 12, 4),
                        textureSize: new THREE.Vector3(4, 12, 4),
                        texturePosition: {
                            original: new THREE.Vector2(4, 20),
                            new: new THREE.Vector2(20, 52),
                        },
                        visible: true,
                    },
                    overlay: {
                        boxSize: new THREE.Vector3(4.8, 12.8, 4.81),
                        textureSize: new THREE.Vector3(4, 12, 4),
                        texturePosition: {
                            original: new THREE.Vector2(4, 36),
                            new: new THREE.Vector2(4, 36),
                        },
                        visible: true,
                    }
                }],
                center: new THREE.Vector3(0, 6, 0),
                position: new THREE.Vector3(-2, -12, 0)
            },
        },
        skin: (function () {
            let skin = new Image();
            skin.src = './defaultskin.png';
            return skin;
        })(),
        poses: [{
            name: 'walk',
            defination: {
                'head': {
                    rotate: new THREE.Vector3(-3, 0, 0)
                },
                'leftArm': {
                    rotate: new THREE.Vector3(15, 3, 0)
                },
                'rightArm': {
                    rotate: new THREE.Vector3(-30, -6, 0)
                },
                'leftLeg': {
                    rotate: new THREE.Vector3(-20, 0, 0)
                },
                'rightLeg': {
                    rotate: new THREE.Vector3(20, 0, 0)
                },
            },
            repeat: 0,
            duration: 800
        }, {
            name: 'walkBack',
            defination: {
                'head': {
                    rotate: new THREE.Vector3(3, 0, 0)
                },
                'leftArm': {
                    rotate: new THREE.Vector3(-30, 6, 0)
                },
                'rightArm': {
                    rotate: new THREE.Vector3(15, -3, 0)
                },
                'leftLeg': {
                    rotate: new THREE.Vector3(20, 0, 0)
                },
                'rightLeg': {
                    rotate: new THREE.Vector3(-20, 0, 0)
                },
            },
            repeat: 0,
            duration: 800
        }],
        animations: [
             {
                name:'walk',
                timeline: ['walk', 'walkBack'],
                restart: true,
            }
        ]
    };

    let Steve = new Model(modelOptions, function (model) {
        if (model.skin && model.skin.height) model.versionIndex = 0;
        else model.versionIndex = 1;
    });
    return Steve;
});
