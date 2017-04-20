define('Materials', ['THREE'], function (THREE) {
    let a = new THREE.MeshBasicMaterial({
        vertexColors: THREE.FaceColors,
        side: THREE.DoubleSide,
        overdraw: 1,
        fog: false,
        // wireframe: false,
        transparent: false,
        depthFunc:THREE.LessDepth
    });
    let b = new THREE.MeshBasicMaterial({
        visible: false,
        transparent: true,
        opacity: 0,
        depthFunc:THREE.GreaterEqualDepth
    });
    return {a: a, b: b};
});
