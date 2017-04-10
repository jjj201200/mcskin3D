define('GuiController', [
    'THREE',
    'dat'
], function (THREE, dat) {
    class GuiController {
        constructor({ folderName, opened = false, gui, folder }) {
            this.gui = gui === undefined ? new dat.GUI() : gui;
            if(folderName != undefined){
            	this.folder = this.gui.addFolder(folderName);
            }else if(folder != undefined) this.folder = folder;
            else this.folder = this.gui;
            opened && this.folder.open();
        };
        addFolder({ folderName, opened = false, gui, folder }) {
            let f = new GuiController({
                folderName: folderName,
                gui: gui || this.gui,
                folder: folder || undefined,
                opened: opened
            });
            return f;
        };
        /**
         * @param  {String}
         * @return {Folder}
         */
        getFolder(folderName) {
            let folder;
            if (folderName == undefined) folder = this.folder;
            else folder = this.gui['__folders'][folderName];
            // console.log(this.gui, folder, folderName)
            if (folder != undefined) return folder;
            else return this.folder.addFolder(folderName);
        };
        /**
         * @param {String}
         * @param {Light}
         */
        addLight({ folderName, light, opened = false }) {
            let folder = this.getFolder(folderName);
            let object = {
                able: light.visible,
                color: light.color.getHex(),
                intensity: light.intensity,
            };
            folder.add(object, 'able').onChange(function (e) {
                light.visible = e;
            });
            folder.addColor(object, 'color').onChange(function (e) {
                light.color = new THREE.Color(e);
            })
            folder.add(object, 'intensity', 0, 1).step(0.01).onChange(function (e) {
                light.intensity = e;
            });
            if (light instanceof THREE.AmbientLight) this._addAmbientLight(folder, light, object);
            if (light instanceof THREE.DirectionalLight) this._addDirectionalLight(folder, light, object);
            if (light instanceof THREE.SpotLight) this._addSpotLight(folder, light, object);
            if (light instanceof THREE.HemisphereLight) this._addHemisphereLight(folder, light, object);
            opened && folder.open();
        };
        _addAmbientLight(folder, light, object) {};
        _addDirectionalLight(folder, light, object) {
            if (light.helper) {
                object.helper = light.helper.visible;
                folder.add(object, 'helper').onChange(function (e) {
                    light.helper.visible = e;
                });
            }
            object.castShadow = light.castShadow;
            folder.add(object, 'castShadow').onChange(function (e) {
                light.castShadow = e;
            });
        };
        _addSpotLight(folder, light, object) {
            object.castShadow = light.castShadow;
            object.angle = light.angle;
            object.penumbra = light.penumbra;
            object.distance = light.distance;
            object.decay = light.decay;
            if (light.helper) {
                object.helper = light.helper.visible;
                folder.add(object, 'helper').onChange(function (e) {
                    light.helper.visible = e;
                });
            }
            folder.add(object, 'castShadow').onChange(function (e) {
                light.castShadow = e;
            });
            folder.add(object, 'intensity', 0, 1).step(0.01).onChange(function (e) {
                light.intensity = e;
            });
            folder.add(object, 'penumbra', 0, 1).step(0.01).onChange(function (e) {
                light.penumbra = e;
            });
            folder.add(object, 'decay', 0, 100).step(0.5).onChange(function (e) {
                light.exponent = e;
            });
            folder.add(object, 'angle', 0, Math.PI / 3).step(Math.PI / 180).onChange(function (e) {
                light.angle = e;
                light.helper.update();
            });
        };
        _addHemisphereLight(folder, light, object) {
            object.groundColor = light.groundColor.getHex();
            folder.addColor(object, 'groundColor').onChange(function (e) {
                light.color = new THREE.Color(e);
            });
        };
        addEditor({ folderName, editor, opened = false }) {
            let folder = this.getFolder(folderName);
            let object = {
                able: editor.able
            };
            folder.add(object, 'able').onChange(function (e) {
                editor.able = e;
                for (let object of editor.objects) object.visible = e;
                editor.rollPlane.visible = e;
            });
        };
        addRenderer({ folderName, renderer, opened = false }) {
            let folder = this.getFolder(folderName);
            let object = {
                backgroundColor: renderer.getClearColor().getHex()
            };
            folder.addColor(object, 'backgroundColor').onChange(function (e) {
                renderer.setClearColor(new THREE.Color(e));
            });
            opened && folder.open();
        };
        addObject3D(folderName, object) {

        };
        addMatetial({ folderName, material, opened = false }) {
            let folder = this.getFolder(folderName);
            let object = {
                color: material.color.getHex(),
                fog: material.fog,
                wireframe: material.wireframe,
            };
            folder.addColor(object, 'color').onChange(function (e) {
                material.color = new THREE.Color(e);
            });
            folder.add(object, 'fog').onChange(function (e) {
                material.fog = e;
            });
            folder.add(object, 'wireframe').onChange(function (e) {
                material.wireframe = e;
            });
            if (material instanceof THREE.MeshBasicMaterial) this._addMeshBasicMaterial(folder, material, object);
            if (material instanceof THREE.MeshLambertMaterial) this._addMeshLambertMaterial(folder, material, object);
            if (material instanceof THREE.MeshPhongMaterial) this._addMeshPhongMaterial(folder, material, object);
            opened && folder.open();

        };
        _addMeshBasicMaterial(folder, material, object) {};
        _addMeshLambertMaterial(folder, material, object) {
            object.emissive = material.emissive;
            object.skinning = material.skinning;
            folder.addColor(object, 'emissive').onChange(function (e) {
                material.emissive = new THREE.Color(e);
            });
            folder.add(object, 'skinning').onChange(function (e) {
                material.skinning = e;
            });
        };
        _addMeshPhongMaterial(folder, material, object) {
            object.emissive = material.emissive;
            object.emissiveIntensity = material.emissiveIntensity;
            object.specular = material.specular;
            object.skinning = material.skinning;
            folder.addColor(object, 'emissive').onChange(function (e) {
                material.emissive = new THREE.Color(e);
            });
            folder.add(object, 'emissiveIntensity', 0, 1).step(0.001).onChange(function (e) {
                material.emissiveIntensity = e;
            });
            folder.addColor(object, 'specular').onChange(function (e) {
                material.specular = new THREE.Color(e);
            });
            folder.add(object, 'skinning').onChange(function (e) {
                material.skinning = e;
            });
        };
    }
    return GuiController;
});
