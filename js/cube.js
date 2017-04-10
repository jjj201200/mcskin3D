define('Cube', ['THREE', 'Face', 'Materials'], function(THREE, Face, materials) {
    class Cube {
        constructor(options) {
            this.skin = new Image();
            this.skinLayers = [];
            this.name = '';
            this.boxSize;
            this.textureSize;
            this.canvas;
            this.context;
            this.texturePosition;
            this.parent;
            this.overlay;
            this.geometry;
            this.material;
            this.mesh = new THREE.Mesh();
            this.FACES = [];
            this.version;
            this.center = new THREE.Vector3(0, 0, 0);
            this.opacity = 1;
            this.showOriginalSkin = false;
            this.init(options);
        };


        init(options) {
            Object.assign(this, options);
            let data = options.data;
            delete options.data;
            Object.assign(this, this.options, data, options);

            this.initCanvas().initFACES().initMesh().reloadOriginalSkin().drew();
            return this;
        };
        initFACES() {
            let x = this.textureSize.x;
            let y = this.textureSize.y;
            let z = this.textureSize.z;
            let position = this.texturePosition[this.version];

            this.FACES = [
                new Face('left', z, y, x, position),
                new Face('right', z, y, x, position),
                new Face('top', x, z, y, position),
                new Face('bottom', x, z, y, position, true),
                new Face('front', x, y, z, position),
                new Face('back', x, y, z, position)
            ];
            return this;
        };
        initCanvas() {
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.skin.width;
            this.canvas.height = this.skin.height;
            this.context = this.canvas.getContext('2d');

            return this;
        };
        initMesh() {
            this.geometry = new THREE.BoxGeometry(this.boxSize.x, this.boxSize.y, this.boxSize.z, this.textureSize.x, this.textureSize.y, this.textureSize.z);
            this.geometry.name = this.name + ' geometry';
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
            this.material = new THREE.MeshFaceMaterial([a, b]);
            this.material.materials[0].opacity = this.opacity;
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.mesh.name = this.name + ' cube_in';
            this.mesh.cube = this;
            this.mesh.position.set(
                this.mesh.position.x - this.center.x,
                this.mesh.position.y - this.center.y,
                this.mesh.position.z - this.center.z
            );
            this.mesh = new THREE.Object3D().add(this.mesh);
            this.mesh.name = this.name + ' cube';
            return this;
        };
        findComponent(parent) {
            var mesh = parent || this.mesh.parent;
            if (mesh && mesh.name != '') {
                var res = mesh.name.match('component$');
                if (res !== null) {
                    return mesh;
                } else {
                    return this.findComponent(mesh.parent);
                }
            }
        };
        drew() {
            for (let faceIndex = 0; faceIndex < this.geometry.faces.length; faceIndex += 2) {
                //left right top bottom front back
                let restFaceIndex = faceIndex;

                let faceNumber;
                for (faceNumber in this.FACES) {
                    let area = this.FACES[faceNumber].area * 2;
                    if (restFaceIndex < area) break;
                    restFaceIndex -= area;
                }
                let FACE = this.FACES[faceNumber];
                let colorCoordinate = FACE.getCoordinate(restFaceIndex);
                let color = new THREE.Color(0);
                let colorData = this.context.getImageData(colorCoordinate.x, colorCoordinate.y, 1, 1).data;
                color.setRGB(colorData[0] / 255, colorData[1] / 255, colorData[2] / 255);
                this.geometry.faces[faceIndex].color = color;
                this.geometry.faces[faceIndex].materialIndex = colorData[3] < 255 ? 1 : 0;
                this.geometry.faces[faceIndex + 1].color = color;
                this.geometry.faces[faceIndex + 1].materialIndex = colorData[3] < 255 ? 1 : 0;
            }
            this.geometry.elementsNeedUpdate = true;
            return this;
        };
        clearCanvas() {
            this.context.clearRect(0, 0, this.skin.width, this.skin.height);
            return this;
        };
        drawSkin(original) {
            this.clearCanvas();
            this.showOriginalSkin = original;
            this.context.drawImage(this.skin, 0, 0);
            if (!this.showOriginalSkin) {
                for (let skinIndex in this.skinLayers) {
                    this.context.drawImage(this.skinLayers[skinIndex], 0, 0);
                }
            }

            this.drew();
            return this;
        };
        reloadOriginalSkin() {
            this.showOriginalSkin = true;
            this.drawSkin(this.showOriginalSkin);
            return this;
        };
        setSkinLayers(skinLayers) {
            this.skinLayers = skinLayers;
            return this;
        };
        setOpacity(opacity) {
            this.opacity = opacity;
            this.material.materials[0].opacity = opacity;
            // this.drawSkin(this.showOriginalSkin);
            return this;
        }
    };
    return Cube;
});
