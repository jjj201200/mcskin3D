define('Materials', ['THREE'], function(THREE) {
    let a = new THREE.MeshBasicMaterial({
        color: 16777215,
        vertexColors: THREE.FaceColors,
        side: THREE.DoubleSide,
        overdraw: 1,
        fog: false,
        wireframe: false,
        transparent: true,
        opacity: 1
    });
    let b = new THREE.MeshBasicMaterial({
        visible: false,
        transparent: true,
        opacity: 0
    });
    return {a:a, b:b};
});
