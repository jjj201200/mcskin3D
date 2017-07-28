define('model.Chicken',['THREE', 'Model', 'Pose', 'Animation'], (THREE, Model)=>{
    const modelOptions = {
        name: 'Chicken',
        defaultType: 'chicken',
        typeMap: ['chicken'],
        versionMap:['original'],
        partsData:{
            head:{
                name:'head',
                map:[{
                    basic:{
                        boxSize: new THREE.Vector3(4, 6, 3),
                        textureSize: new THREE.Vector3(4, 6, 3),
                        texturePosition: {
                            original:new THREE.Vector2(3, 3)
                        },
                        visible: true,
                    }
                }],
                center: new THREE.Vector3(0,0,0),
                position: new THREE.Vector3(0,3,2.5),
            },
            bill:{
                name:'bill',
                map:[{
                    basic:{
                        boxSize: new THREE.Vector3(4, 2, 2),
                        textureSize: new THREE.Vector3(4, 2, 2),
                        texturePosition: {
                            original:new THREE.Vector2(16, 2)
                        },
                        visible: true,
                    }
                }],
                center: new THREE.Vector3(0,0,0),
                position: new THREE.Vector3(0,3,5),
            },
            chin:{
                name:'chin',
                map:[{
                    basic:{
                        boxSize: new THREE.Vector3(2, 2, 2),
                        textureSize: new THREE.Vector3(2, 2, 2),
                        texturePosition: {
                            original:new THREE.Vector2(16, 6)
                        },
                        visible: true,
                    }
                }],
                center: new THREE.Vector3(0,0,0),
                position: new THREE.Vector3(0,1,4),
            },
            leftLeg:{
                name:'leftLeg',
                map:[{
                    basic:{
                        boxSize: new THREE.Vector3(3, 5, 3),
                        textureSize: new THREE.Vector3(3, 5, 3),
                        texturePosition: {
                            original:new THREE.Vector2(29, 3)
                        },
                        visible: true,
                    }
                }],
                center: new THREE.Vector3(0,0,0),
                position: new THREE.Vector3(-2,-5,-1.5),
            },
            rightLeg:{
                name:'rightLeg',
                map:[{
                    basic:{
                        boxSize: new THREE.Vector3(3, 5, 3),
                        textureSize: new THREE.Vector3(3, 5, 3),
                        texturePosition: {
                            original:new THREE.Vector2(29, 3)
                        },
                        visible: true,
                    }
                }],
                center: new THREE.Vector3(0,0,0),
                position: new THREE.Vector3(2,-5,-1.5),
            },
            body:{
                name:'body',
                map:[{
                    basic:{
                        boxSize: new THREE.Vector3(6, 8, 6),
                        textureSize: new THREE.Vector3(6, 8, 6),
                        texturePosition: {
                            original:new THREE.Vector2(6, 15)
                        },
                        visible: true,
                    }
                }],
                rotation: new THREE.Vector3(1.57,0,0),
                center: new THREE.Vector3(0,0,0),
                position: new THREE.Vector3(0,0,-3),
            },
            leftWing:{
                name:'leftWing',
                map:[{
                    basic:{
                        boxSize: new THREE.Vector3(1, 4, 6),
                        textureSize: new THREE.Vector3(1, 4, 6),
                        texturePosition: {
                            original:new THREE.Vector2(30, 19)
                        },
                        visible: true,
                    }
                }],
                center: new THREE.Vector3(0,0,0),
                position: new THREE.Vector3(3.5,1,-3),
            },
            rightWing:{
                name:'leftWing',
                map:[{
                    basic:{
                        boxSize: new THREE.Vector3(1, 4, 6),
                        textureSize: new THREE.Vector3(1, 4, 6),
                        texturePosition: {
                            original:new THREE.Vector2(30, 19)
                        },
                        visible: true,
                    }
                }],
                center: new THREE.Vector3(0,0,0),
                position: new THREE.Vector3(-3.5,1,-3),
            },
        },
        skin: (function () {
            let skin = new Image();
            skin.src = './chicken.png';
            return skin;
        })(),
    };
    let Chicken = new Model(modelOptions, function (model) {
        if (model.skin && model.skin.height) model.versionIndex = 0;
        else model.versionIndex = 0;
    });
    return Chicken;
});