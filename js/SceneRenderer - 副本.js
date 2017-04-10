define('SceneRenderer', [
    'THREE',
    'TWEEN',
    'jquery',
    'GuiController',
    'ThreeBSP',
    'THREE.OrbitControls',
    'THREE.SubdivisionModifier',
    'THREE.SimplifyModifier'
], function (THREE, TWEEN, $, GuiController, ThreeBSP, OrbitControls, SubdivisionModifier, SimplifyModifier) {
    class SceneRenderer {
        constructor(domElement) {
            this.domElement = domElement;

            this.backgroundColor = '#252525';
            this.editor = {
                objects: [],
                editorSize: 100,
                inited: false,
                scale: 1,
                mouse: new THREE.Vector3(0, 0, -1), //z=-1 important!
                able: false
            };
            this.initRenderer().initLight().resetCamera().initControler();

            let renderLoop = () => {
                requestAnimationFrame(renderLoop);
                TWEEN.update();
                this.render();
            };
            renderLoop();
        }
        render() {
            this.renderer.render(this.scene, this.camera);
        }
        initRenderer(options) {
            this.renderer = this.webglAvailable() ? new THREE.WebGLRenderer({
                alpha: true,
                antialias: true,
                shadowMap: THREE.PCFSoftShadowMap,
                precision: 'lowp'
            }) : new THREE.CanvasRenderer;
            this.renderer.shadowMap.enabled = true;
            let [width, height] = [this.domElement.innerWidth(), this.domElement.innerHeight()];
            [this.canvasWidth, this.canvasWidth] = [width, height];
            this.scene = new THREE.Scene();

            this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);

            this.renderer.shadowMapSoft = true;
            this.renderer.setSize(width, height);
            this.renderer.setClearColor(this.backgroundColor, 1);
            this.canvas = this.renderer.domElement;
            this.domElement.append(this.canvas);

            return this;
        };
        initEditor() {

            this.initEditorComponents().initEditorEvent().initEditorGUI();
            for (let object of this.editor.objects) object.visible = this.editor.able;
            this.editor.rollPlane.visible = this.editor.able;
            this.editor.inited = true;
            return this;
        }
        initEditorComponents() {
            this.drawGrid();
            let _this = this;
            let _editor = this.editor;
            _editor.planeGeometry = new THREE.PlaneGeometry(_editor.editorSize * _editor.scale, _editor.editorSize * _editor.scale, 1, 1);
            _editor.plane = new THREE.Mesh(_editor.planeGeometry, new THREE.MeshLambertMaterial({
                color: '#ffffff',
                wireframe: false,
                emissive: '#777777'
            }));
            _editor.planeGeometry.rotateX(-Math.PI / 2);
            _editor.plane.receiveShadow = true;
            _editor.plane.name = 'plane';
            _this.scene.add(_editor.plane);
            _editor.objects.push(_editor.plane);
            _editor.rollPlaneGeometry = new THREE.PlaneGeometry(_editor.scale, _editor.scale);
            _editor.rollPlaneMaterial = new THREE.MeshBasicMaterial({
                color: '#ff0000',
                opacity: 1,
                transparent: true,
                side: THREE.DoubleSide,
                shading: THREE.FlatShading
            });
            _editor.rollPlane = new THREE.Mesh(_editor.rollPlaneGeometry, _editor.rollPlaneMaterial);
            _editor.rollCubeGeometry = new THREE.BoxGeometry(_editor.scale, _editor.scale, _editor.scale);
            _editor.Cube = new THREE.Mesh(_editor.rollCubeGeometry, new THREE.MeshPhongMaterial({ color: '#ffffff' }));
            _editor.Cube.castShadow = true;
            _editor.Cube.receiveShadow = true;
            _this.scene.add(_editor.rollPlane);

            return this;
        };
        initLight() {
            let _editor = this.editor;
            this.center = new THREE.Object3D({ name: 'centerObject', position: new THREE.Vector3(0, _editor.editorSize / 2, 0) });
            this.scene.add(this.center);
            var union = _editor.editorSize * _editor.scale;
            let mainLightPosition = new THREE.Vector3(union, union, union);
            //ambientLight
            this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);

            this.scene.add(this.ambientLight);

            //directionalLight
            this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
            this.directionalLight.position.set(union, union, union);
            this.directionalLight.target = this.center;
            this.directionalLight.visible = true;
            this.directionalLight.castShadow = false;
            this.directionalLight.shadow.camera.near = 10;
            this.directionalLight.shadow.camera.far = union * 2;
            this.directionalLight.shadow.camera.top = union;
            this.directionalLight.shadow.camera.right = union;
            this.directionalLight.shadow.camera.bottom = -union;
            this.directionalLight.shadow.camera.left = -union;
            this.directionalLight.shadow.mapSize.width = 1024 * 4;
            this.directionalLight.shadow.mapSize.height = 1024 * 4;
            this.directionalLight.debug = false;
            this.directionalLight.distance = union * 10;
            this.directionalLight.helper = new THREE.DirectionalLightHelper(this.directionalLight);
            this.directionalLight.helper.visible = false;
            this.scene.add(this.directionalLight, this.directionalLight.helper);
            this.directionalLight.helper.update();

            //spotLight
            this.spotLight = new THREE.SpotLight(0xffffff, 0.3);
            this.spotLight.visible = true;
            this.spotLight.position.set(union / 2, union / 2, union / 2);
            this.spotLight.castShadow = false;
            this.spotLight.target = this.center;
            this.spotLight.angle = Math.PI / 3;
            this.spotLight.distance = union * 10;
            this.spotLight.shadow.darkness = 0.2;
            this.spotLight.shadow.camera.near = 10;
            this.spotLight.shadow.camera.far = union * 2;
            this.spotLight.shadow.mapSize.width = 1024;
            this.spotLight.shadow.mapSize.height = 1024;
            this.spotLight.helper = new THREE.SpotLightHelper(this.spotLight);
            this.spotLight.helper.visible = false;
            this.scene.add(this.spotLight, this.spotLight.helper);
            this.spotLight.helper.update();

            //hemisphereLight
            this.hemisphereLight = new THREE.HemisphereLight('#333333', '#333333', 0.5);
            this.hemisphereLight.visible = false;
            this.hemisphereLight.position.set(0, union, 0);
            this.scene.add(this.hemisphereLight);

            //set ground spot light
            //front light
            this.directionalLightFront = new THREE.DirectionalLight().copy(this.directionalLight);
            // this.spotLightFront.visible = false;
            this.directionalLightFront.position.set(-union / 2, union / 2, -union / 2);
            this.directionalLightFrontHelper = new THREE.DirectionalLightHelper(this.directionalLightFront);
            this.scene.add(this.directionalLightFront, this.directionalLightFrontHelper);
            this.directionalLightFrontHelper.visible = false;
            this.directionalLightFrontHelper.update();

            //back light
            this.directionalLightBack = new THREE.DirectionalLight().copy(this.directionalLightFront);
            this.directionalLightBack.position.set(union / 2, union / 2, -union / 2);
            this.directionalLightBackHelper = new THREE.DirectionalLightHelper(this.directionalLightBack);
            this.scene.add(this.directionalLightBack, this.directionalLightBackHelper);
            this.directionalLightBackHelper.visible = false;

            this.directionalLightBackHelper.update();

            //left light
            this.directionalLightLeft = new THREE.DirectionalLight().copy(this.directionalLightFront);
            this.directionalLightLeft.position.set(-union / 2, union / 2, union / 2);
            this.directionalLightLeftHelper = new THREE.DirectionalLightHelper(this.directionalLightLeft);
            this.scene.add(this.directionalLightLeft, this.directionalLightLeftHelper);
            this.directionalLightLeftHelper.visible = false;

            this.directionalLightLeftHelper.update();

            return this;
        };
        initControler() {
            let _this = this;
            let _editor = this.editor;
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.target = new THREE.Vector3(0, 0, 0);
            this.controls.zoomSpeed = Math.sqrt(_editor.scale);
            this.controls.userPanSpeed = 0;
            this.controls.maxDistance = 100 * _editor.editorSize * _editor.scale * _editor.scale;
            this.controls.minDistance = 0.1;
            this.controls.mouseButtons.PAN = 1;
            this.controls.mouseButtons.ZOOM = 2;
            this.controls.mouseButtons.ORBIT = 2;
            this.controls.addEventListener('change', function () {
                _this.renderer.render(_this.scene, _this.camera);
            });

            $(window).off('resize').on('resize', function (e) {
                _this.resizeCanvas();
            });
            return this;
        };
        initEditorEvent() {
            let _this = this;
            let _editor = this.editor;

            //mouse status
            _editor.mouseDown = false;
            _editor.mouseUp = false;

            _editor.tempMesh = new THREE.Mesh();
            _editor.tempMesh.material = new THREE.MeshPhongMaterial({
                color: '#ffffff',
                wireframe: false,
                side: THREE.DoubleSide,
                emissive: '#111111',
                specular: '#555555',
                shininess: 15
            });
            _editor.tempMesh.name = 'temp';
            _editor.tempMesh.receiveShadow = true;
            _editor.tempMesh.castShadow = true;
            _this.scene.add(_editor.tempMesh);

            _editor.resultMesh = new THREE.Mesh();
            _editor.resultMesh.geometry = new THREE.Geometry();
            _editor.resultMesh.material = new THREE.MeshPhongMaterial({
                color: '#ff0000',
                wireframe: false,
                side: THREE.DoubleSide,
                emissive: '#111111',
                specular: '#555555',
                shininess: 15,
                transparent: true,
                wireframe: true
            });

            _editor.resultMesh.name = 'result';
            _editor.resultMesh.receiveShadow = true;
            _editor.resultMesh.castShadow = true;
            _editor.originalResultMesh = _editor.resultMesh.clone();
            _editor.resultBSP = this.createBSP(new THREE.Geometry());
            _this.scene.add(_editor.resultMesh);
            _editor.objects.push(_editor.resultMesh);

            _editor.insertStartVector = new THREE.Vector3(0, 0, 0);
            _editor.insertEndVector = new THREE.Vector3(0, 0, 0);
            _editor.planeAdjustVector = new THREE.Vector3(0, 0, 0);
            _editor.onPlaneAdjustVector = new THREE.Vector3(0, 0.001, 0);

            _editor.tempVoxelCube = _editor.Cube.clone();
            _editor.tempCubeSize = new THREE.Vector3(1, 1, 1);
            _editor.sizeAdjustVector = new THREE.Vector3(0, 0.5, 0);
            _editor.minSizeAdjustVector = new THREE.Vector3(1, 1, 1);

            _editor.angelDelta = {
                azimutha: 0,
                polar: 0
            };
            _editor.dragDelta = {
                azimutha: 0,
                polar: 0
            };
            _editor.mouseDownDragAngel = {
                azimutha: 0,
                polar: 0
            };
            _editor.raycaster = new THREE.Raycaster();
            _this.domElement.on('mousemove', function (e) {
                if (!_editor.able) return;
                e.preventDefault();

                //dikaer
                _editor.mouse.x = (e.clientX / _this.domElement.innerWidth()) * 2 - 1;
                _editor.mouse.y = -(e.clientY / _this.domElement.innerHeight()) * 2 + 1;
                _editor.raycaster.setFromCamera(_editor.mouse, _this.camera);
                var intersects = _editor.raycaster.intersectObjects(_editor.objects);
                if (intersects.length > 0) {
                    let intersect = intersects[0];
                    let k = new THREE.Vector3(0.0000001, 0.0000001, 0.0000001);
                    let v = new THREE.Vector3(0, 0, 0).copy(_editor.planeAdjustVector);

                    let vp = new THREE.Vector3(0, 0, 0);
                    intersect.face.normal.add(k).floor();
                    intersect.point.add(k).floor();
                    if (intersect.face.normal.x < 0) {
                        v.x -= _editor.scale + 0.001;
                        vp.y = -Math.PI / 2;
                    } else if (intersect.face.normal.x > 0) {
                        vp.y = Math.PI / 2;
                        v.x += 0.001;
                    }
                    if (intersect.face.normal.y < 0) {
                        v.y -= _editor.scale + 0.001;
                        vp.x = Math.PI / 2;
                    } else if (intersect.face.normal.y > 0) {
                        vp.x = -Math.PI / 2;
                        v.y += 0.001
                    }
                    if (intersect.face.normal.z < 0) {
                        v.z -= _editor.scale + 0.001;
                        vp.x = Math.PI;
                    } else if (intersect.face.normal.z > 0) {
                        v.z += 0.001
                    }
                    var adjust = new THREE.Vector3().copy(intersect.face.normal).multiplyScalar(0.5);
                    _editor.rollPlane.position
                        .copy(intersect.point)
                        .divideScalar(_editor.scale)
                        .floor()
                        .multiplyScalar(_editor.scale)
                        .addScalar(_editor.scale / 2)
                    let tempInsertEndVector = new THREE.Vector3().copy(_editor.rollPlane.position);
                    _editor.rollPlane.position.sub(adjust);

                    _editor.rollPlane.position.add(v);
                    if (intersect.object == _editor.plane) {
                        _editor.rollPlane.rotation.x = -Math.PI / 2;
                        _editor.rollPlane.rotation.y = 0;
                        _editor.rollPlane.rotation.z = 0;
                        _editor.rollPlane.position.add(_editor.onPlaneAdjustVector);
                    } else {
                        _editor.rollPlane.rotation.x = vp.x;
                        _editor.rollPlane.rotation.y = vp.y;
                        _editor.rollPlane.rotation.z = vp.z;
                    }
                    if (_editor.mousedown) {

                        if (e.button == 0) { //left click

                            //get second position vector
                            var insertEndVector = new THREE.Vector3(0, 0, 0).copy(tempInsertEndVector);
                            if (_editor.insertEndVector === undefined || !insertEndVector.equals(_editor.insertEndVector)) {
                                if (!e.shiftKey) {
                                    _editor.insertEndVector = insertEndVector;
                                    //create direction vector
                                    let tempCubeCreateVector = new THREE.Vector3().copy(_editor.insertEndVector).sub(_editor.insertStartVector).add(_editor.sizeAdjustVector).floor();
                                    _editor.resultMesh.material.opacity = 1;

                                    //compute cube size
                                    let tempCubeSize = new THREE.Vector3().copy(tempCubeCreateVector);
                                    if (tempCubeSize.x < 0) tempCubeSize.x = -tempCubeSize.x;
                                    if (tempCubeSize.y < 0) tempCubeSize.y = -tempCubeSize.y;
                                    if (tempCubeSize.z < 0) tempCubeSize.z = -tempCubeSize.z;
                                    tempCubeSize.add(_editor.minSizeAdjustVector);
                                    _editor.tempCubeSize.copy(tempCubeSize);
                                    let voxel = new THREE.Mesh().copy(_editor.tempVoxelCube);
                                    voxel.geometry = new THREE.BoxGeometry(tempCubeSize.x, tempCubeSize.y, tempCubeSize.z);

                                    //set cube position
                                    let positionAdjustVector = new THREE.Vector3().copy(tempCubeCreateVector).multiplyScalar(0.5);
                                    voxel.position.copy(_editor.insertStartVector).add(positionAdjustVector);

                                    //create cube's BSP
                                    let voxelBSP = _this.createBSP(voxel);
                                    _editor.tempBSP = voxelBSP.subtract(_editor.resultBSP);

                                    _editor.tempMesh.geometry = _editor.tempBSP.toGeometry();
                                    _editor.tempMesh.updateMatrix();
                                } else { //shift
                                    let p = new THREE.Vector3().copy(intersect.face.normal);
                                    if (intersect.face.normal.x < 0)
                                        p.x += _editor.scale;
                                    if (intersect.face.normal.y < 0)
                                        p.y += _editor.scale;
                                    if (intersect.face.normal.z < 0)
                                        p.z += _editor.scale;
                                    insertEndVector.sub(p)

                                    _editor.insertEndVector = insertEndVector;
                                    let tempCubeCreateVector = new THREE.Vector3().copy(_editor.insertEndVector).sub(_editor.insertStartVector).add(_editor.sizeAdjustVector).floor();
                                    let tempCubeSize = new THREE.Vector3().copy(tempCubeCreateVector);
                                    if (tempCubeSize.x < 0) tempCubeSize.x = -tempCubeSize.x;
                                    if (tempCubeSize.y < 0) tempCubeSize.y = -tempCubeSize.y;
                                    if (tempCubeSize.z < 0) tempCubeSize.z = -tempCubeSize.z;
                                    tempCubeSize.add(_editor.minSizeAdjustVector);
                                    _editor.tempCubeSize.copy(tempCubeSize);

                                    let voxel = new THREE.Mesh().copy(_editor.tempVoxelCube);
                                    voxel.geometry = new THREE.BoxGeometry(tempCubeSize.x, tempCubeSize.y, tempCubeSize.z);


                                    let positionAdjustVector = new THREE.Vector3().copy(tempCubeCreateVector).multiplyScalar(0.5);
                                    voxel.position.copy(_editor.insertStartVector).add(positionAdjustVector);

                                    if (_editor.tempMesh.geometry.faces == undefined || _editor.tempMesh.geometry.faces.length == 0) return;
                                    let voxelBSP = _this.createBSP(voxel);
                                    let tempResult = _this.createBSP(_editor.originalResultMesh);
                                    _editor.tempBSP = tempResult.subtract(voxelBSP);
                                    _editor.resultMesh.material.opacity = 0.05;

                                    _editor.tempMesh.geometry = _editor.tempBSP.toGeometry();
                                    _editor.tempMesh.updateMatrix();
                                }

                            }
                        }
                    }
                    _this.render();
                }
            }).on('mousedown', function (e) {
                if (!_editor.able) return;
                e.preventDefault();
                if (e.button == 2) {
                    _this.updateDragDelta();
                    _editor.mouseDownDragAngel.azimutha = _editor.angelDelta.azimutha;
                    _editor.mouseDownDragAngel.polar = _editor.angelDelta.polar;
                }
                if (e.button == 0) {
                    _editor.mousedown = true;
                    _editor.mouseup = false;

                    _editor.raycaster.setFromCamera(_editor.mouse, _this.camera);
                    let intersects = _editor.raycaster.intersectObjects(_editor.objects);

                    if (intersects.length > 0) {
                        let intersect = intersects[0];
                        let k = new THREE.Vector3(0.0000001, 0.0000001, 0.0000001);
                        let v = new THREE.Vector3(0, 0, 0);
                        intersect.face.normal.add(k).floor();
                        intersect.point.add(k).floor();
                        let voxel = new THREE.Mesh().copy(_editor.tempVoxelCube);
                        voxel.geometry = new THREE.BoxGeometry(1, 1, 1);
                        voxel.position.copy(intersect.point).divideScalar(_editor.scale).floor().multiplyScalar(_editor.scale).addScalar(_editor.scale / 2)

                        if (!e.shiftKey) {
                            if (intersect.face.normal.x < 0)
                                v.x -= _editor.scale;
                            if (intersect.face.normal.y < 0)
                                v.y -= _editor.scale;
                            if (intersect.face.normal.z < 0)
                                v.z -= _editor.scale;
                            voxel.position.add(v);
                            _editor.insertStartVector.copy(voxel.position);
                            let voxelBSP = _this.createBSP(voxel);
                            _editor.tempBSP = voxelBSP.subtract(_editor.resultBSP);
                            _editor.tempMesh.geometry = _editor.tempBSP.toGeometry();
                            _editor.tempMesh.updateMatrix();

                        } else if (e.shiftKey) {
                            if (_editor.resultMesh.geometry.faces == undefined || _editor.resultMesh.geometry.faces.length == 0) return;
                            v.copy(intersect.face.normal);
                            if (intersect.face.normal.x < 0)
                                v.x += _editor.scale;
                            if (intersect.face.normal.y < 0)
                                v.y += _editor.scale;
                            if (intersect.face.normal.z < 0)
                                v.z += _editor.scale;
                            voxel.position.sub(v)
                            _editor.insertStartVector = new THREE.Vector3(0, 0, 0).copy(voxel.position);
                            let voxelBSP = _this.createBSP(voxel);
                            _editor.originalResultMesh = _editor.resultMesh.clone();
                            let tempResult = _this.createBSP(_editor.originalResultMesh);
                            _editor.tempBSP = tempResult.subtract(voxelBSP);
                            _editor.resultMesh.material.opacity = 0.05;
                            _editor.tempMesh.geometry = _editor.tempBSP.toGeometry();
                            _editor.tempMesh.updateMatrix();

                        }
                    }
                } else if (e.button == 2 && _editor.mouseup) {
                    _this.domElement.trigger('mouseup');
                }
            }).on('mouseup', function (e) {
                if (!_editor.able) return;
                e.preventDefault();
                if (_editor.tempBSP !== undefined && e.button === 0) {
                    _editor.mousedown = false;
                    _editor.mouseup = true;
                    _editor.insertEndVector = undefined;
                    // _this.updateDragDelta();

                    _editor.raycaster.setFromCamera(_editor.mouse, _this.camera);
                    let intersects = _editor.raycaster.intersectObjects(_editor.objects);

                    // let resultBSP = _this.createBSP(_this.resultMesh);
                    let tempBSP = _this.createBSP(_editor.tempMesh);
                    if (!e.shiftKey) {
                        _editor.resultMesh.geometry = _editor.resultBSP.union(tempBSP).toGeometry();
                    } else {
                        _editor.resultMesh.geometry = tempBSP.toGeometry();
                        _editor.resultMesh.material.opacity = 1;
                    }
                    _editor.resultMesh.geometry.mergeVertices();

                    // var modifier = new THREE.SubdivisionModifier(0);
                    // modifier.modify(_this.resultMesh.geometry);
                    // var simplify = new THREE.SimplifyModifier(_this.resultMesh.geometry);
                    // _this.resultMesh.geometry = simplify.toGeometry();

                    // _this.resultMesh.updateMatrix();
                    // console.log(simplify.toGeometry());
                    // console.log(_this.createCubeGeometry(1, 1, 1));
                    // console.log(_this.resultMesh.geometry,_this.resultMesh.geometry.vertices.length, _this.resultMesh.geometry.faces.length)
                    _editor.tempMesh.geometry = new THREE.Geometry();

                    _editor.resultBSP = _this.createBSP(_editor.resultMesh);

                }

            });
            return this;
        }
        initEditorGUI() {
            let _this = this;
            let _editor = this.editor;
            this.guiController = new GuiController({
                opened: true
            });
            this.guiController.addRenderer({
                folderName: 'Renderer',
                renderer: this.renderer,
                opened: true
            });
            let editorGUI = this.guiController.addFolder({
                folderName: 'Editor',
                opened: true
            });
            editorGUI.addEditor({
                editor: this.editor
            })
            let lightGUI = editorGUI.addFolder({
                folderName: 'Lights',
                gui: editorGUI.folder
            });
            lightGUI.addLight({
                folderName: 'AmbientLight',
                light: this.ambientLight
            });
            lightGUI.addLight({
                folderName: 'DirectionalLight',
                light: this.directionalLight
            });
            lightGUI.addLight({
                folderName: 'DirectionalLightFront',
                light: this.directionalLightFront
            });
            lightGUI.addLight({
                folderName: 'DirectionalLightBack',
                light: this.directionalLightBack
            });
            lightGUI.addLight({
                folderName: 'DirectionalLightLeft',
                light: this.directionalLightLeft
            });
            lightGUI.addLight({
                folderName: 'SpotLightLight',
                light: this.spotLight
            });
            lightGUI.addLight({
                folderName: 'HemisphereLight',
                light: this.hemisphereLight
            });
            let materialGUI = editorGUI.addFolder({
                folderName: 'Materials',
                gui: editorGUI.folder
            });
            materialGUI.addMatetial({
                folderName: 'MeshMaterial',
                material: this.editor.resultMesh.material
            });
            materialGUI.addMatetial({
                folderName: 'PlaneMaterial',
                material: this.editor.plane.material
            })

            return this;
        };
        resetCamera() {
            this.camera.position.x = 0;
            this.camera.position.y = this.editor.editorSize / 5;
            this.camera.position.z = this.editor.editorSize / 2;
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
            return this;
        };
        resizeCanvas() {
            let [width, height] = [this.domElement.innerWidth(), this.domElement.innerHeight()];
            this.renderer.setSize(width, height);
            this.camera.updateProjectionMatrix();
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
        drawGrid() {
            let _this = this
            let _editor = this.editor
            let [size, step] = [_editor.editorSize * _editor.scale / 2, _editor.scale];
            let geometry = new THREE.Geometry();
            let material = new THREE.LineBasicMaterial({
                color: 0x000000,
                opacity: 0.1,
                transparent: true
            });
            for (let i = -size; i <= size; i += step) {
                geometry.vertices.push(new THREE.Vector3(-size, 0, i));
                geometry.vertices.push(new THREE.Vector3(size, 0, i));

                geometry.vertices.push(new THREE.Vector3(i, 0, -size));
                geometry.vertices.push(new THREE.Vector3(i, 0, size));
            }
            _editor.grid = new THREE.LineSegments(geometry, material);
            _editor.grid.visible = false;
            _this.scene.add(_editor.grid);
            return this;
        };
        createBSP(geometry) {
            let matrix = undefined;
            geometry = geometry instanceof THREE.Geometry ? geometry : geometry instanceof THREE.Mesh ? (geometry.updateMatrix(), matrix = geometry.matrix.clone(), geometry.geometry) : void 0;
            matrix !== undefined && geometry.applyMatrix(matrix);
            // let bspVertices = [];
            // let bspPolygons = [];
            // let threeVertices = geometry.vertices;
            // let threePolygons = geometry.faces;
            // for (let verticIndex in threeVertices) {
            //     let v = threeVertices[verticIndex]
            //     bspVertices.push(new ThreeBSP.Vertex(v.x, v.y, v.z));
            // }
            // for (let polygonIndex in threePolygons) {
            //     let p = threePolygons[polygonIndex];
            //     bspPolygons.push(new ThreeBSP.Polygon([bspVertices[p.a], bspVertices[p.b], bspVertices[p.c]], p.normal));
            // }
            // let node = new ThreeBSP.Node(bspPolygons);
            return new ThreeBSP(geometry);
        };
        updateDragDelta() {
            this.editor.angelDelta.azimutha = this.controls.getAzimuthalAngle();
            this.editor.angelDelta.polar = this.controls.getPolarAngle();
        };
        webglAvailable() {
            try {
                var canvas = document.createElement("canvas");
                return !!window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
            } catch (e) {
                return false
            }
        };
    }
    return SceneRenderer;
});
