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

            this.model = undefined;


            this.editor = {
                editorSize: 100,
                inited: false,
                scale: 1,
                mouse: new THREE.Vector2(0, 0), //z=-1 important!
                able: false
            };
            this.initRenderer().resetCamera().initControler();

            let renderLoop = () => {
                requestAnimationFrame(renderLoop);
                TWEEN.update();
                this.render();
            };
            renderLoop();
        };

        render() {
            this.renderer.render(this.scene, this.camera);
        };

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
            this.camera.animation = {};
            this.camera.animation.speed = 300;
            this.camera.animation.moved = false;
            this.camera.animation.positionMoved = false;
            this.camera.animation.targetMoved = false;
            this.camera.animation.zoomMoved = false;
            this.camera.animation.target = new THREE.Vector3(0, 0, 0);

            this.renderer.shadowMapSoft = true;
            this.renderer.setSize(width, height);
            this.renderer.setClearColor(this.backgroundColor, 1);
            this.canvas = this.renderer.domElement;
            this.domElement.append(this.canvas);

            return this;
        };

        initControler() {
            let _this = this;
            let _editor = this.editor;
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.target = new THREE.Vector3(0, 0, 0);
            this.controls.zoomSpeed = Math.sqrt(_editor.scale);
            this.controls.userPanSpeed = 0;
            this.controls.enablePan = false;
            this.controls.maxDistance = _editor.editorSize * _editor.scale * _editor.scale;
            this.controls.minDistance = 45;
            this.controls.minZoom = 0.8;
            this.controls.maxZoom = 1.2;
            this.controls.mouseButtons.PAN = 1;
            this.controls.mouseButtons.ZOOM = 2;
            this.controls.mouseButtons.ORBIT = 2;
            this.controls.addEventListener('change', function () {
                _this.renderer.render(_this.scene, _this.camera);
            });
            _editor.raycaster = new THREE.Raycaster();
            _editor.objects = [];

            $(window).off('resize').on('resize', function () {
                _this.resizeCanvas();
            });
            this.clickTime = new Date().getTime();
            this.clickTimeout = undefined;
            this.dblclickDeltaTime = 300; //ms
            this.domElement.on('mousemove', function (e) {
                e.preventDefault();
                _editor.mouse.x = (e.clientX / _this.domElement.innerWidth()) * 2 - 1;
                _editor.mouse.y = -(e.clientY / _this.domElement.innerHeight()) * 2 + 1;

            }).on('mousedown', function (e) {
                e.preventDefault();
                e.stopPropagation();
                let nowClickTime = new Date().getTime();
                if (_this.clickTimeout === undefined) {
                    //focuse to component
                    _editor.raycaster.setFromCamera(_editor.mouse, _this.camera);
                    let intersects = _editor.raycaster.intersectObjects(_this.editor.objects);
                    let target = intersects[0].object.cube.findComponent();
                    _this.clickTimeout = setTimeout(function () { //click
                        if (e.button === 0) {
                            // console.log('click');
                            clearTimeout(_this.clickTimeout);
                            _this.clickTimeout = undefined;
                            if (intersects.length > 0) {
                                // _this.renderer.sortObjects = false;
                                _this.model.focuseComponent(target.name);
                                _this.cameraAnimation({
                                    target: target.position,
                                    zoom: 1.5,
                                    controls: true
                                });
                            }
                        }

                    }, _this.dblclickDeltaTime);
                }
                if (nowClickTime - _this.clickTime < _this.dblclickDeltaTime) { //double click
                    clearTimeout(_this.clickTimeout);
                    _this.clickTimeout = undefined;
                    if (e.button === 0) {
                        // console.log('dblclick');

                        //reset focuse
                        _this.model.resetFocuse();
                        // _this.renderer.sortObjects = false;
                        _this.cameraAnimation({
                            target: new THREE.Vector3(0, 0, 0),
                            zoom: 1,
                            controls: true
                        })
                    }

                } else _this.clickTime = new Date().getTime();


            });
            return this;
        };

        resetCamera() {
            this.camera.position.x = 0;
            this.camera.position.y = 0;
            this.camera.position.z = this.editor.editorSize / 2;
            this.camera.lookAt(this.camera.animation.target);
            if (this.controls) this.controls.target = this.camera.animation.target;
            return this;
        };

        cameraAnimation({position, target, zoom, controls = false}) {
            if (this.camera.animation.moved === false) {
                //position
                let _this = this;
                if (position !== undefined) {
                    let originalPosition = {
                        x: _this.camera.position.x,
                        y: _this.camera.position.y,
                        z: _this.camera.position.z
                    };
                    new TWEEN.Tween(originalPosition).to({
                        x: position.x,
                        y: position.y,
                        z: position.z
                    }, _this.camera.animation.speed).easing(TWEEN.Easing.Quadratic.InOut).onStart(function () {
                        _this.camera.animation.moved = true;
                        _this.camera.animation.positionMoved = true;
                    }).onUpdate(function () {
                        _this.camera.position = new THREE.Vector3(this.x, this.y, this.z);
                    }).onComplete(function () {
                        if (_this.camera.animation.targetMoved === false && _this.camera.animation.zoomMoved === false)
                            _this.camera.animation.moved = false;
                        _this.camera.animation.positionMoved = false;
                    }).start();
                }
                //target
                if (target !== undefined) {
                    let originalTarget = {
                        x: _this.model.focuseTarget.x,
                        y: _this.model.focuseTarget.y,
                        z: _this.model.focuseTarget.z
                    };
                    new TWEEN.Tween(originalTarget).to({
                        x: target.x,
                        y: target.y,
                        z: target.z
                    }, _this.camera.animation.speed).easing(TWEEN.Easing.Quadratic.InOut).onStart(function () {
                        _this.camera.animation.moved = true;
                        _this.camera.animation.targetMoved = true;
                    }).onUpdate(function () {
                        _this.camera.animation.target = new THREE.Vector3(this.x, this.y, this.z);
                        _this.model.focuseTarget = new THREE.Vector3(this.x, this.y, this.z);
                        _this.camera.lookAt(_this.camera.animation.target);
                        if (controls) _this.controls.target = _this.camera.animation.target;
                    }).onComplete(function () {
                        if (_this.camera.animation.positionMoved === false && _this.camera.animation.zoomMoved === false)
                            _this.camera.animation.moved = false;
                        _this.camera.animation.targetMoved = false;
                    }).start();
                }
                //zoom
                if (zoom !== undefined) {
                    let originalZoom = {
                        zoom: _this.camera.zoom
                    };
                    new TWEEN.Tween(originalZoom).to({
                        zoom: zoom
                    }, _this.camera.animation.speed).easing(TWEEN.Easing.Quadratic.InOut).onStart(function () {
                        _this.camera.animation.moved = true;
                        _this.camera.animation.zoomMoved = true;
                    }).onUpdate(function () {
                        _this.camera.animation.zoom = this.zoom;
                        _this.controls.object.zoom = _this.camera.animation.zoom;
                        _this.controls.object.updateProjectionMatrix();
                        _this.controls.update();
                    }).onComplete(function () {
                        if (_this.camera.animation.positionMoved === false && _this.camera.animation.targetMoved === false)
                            _this.camera.animation.moved = false;
                        _this.camera.animation.zoomMoved = false;
                    }).start();
                }
            }
        };

        resizeCanvas() {
            let [width, height] = [this.domElement.innerWidth(), this.domElement.innerHeight()];
            this.renderer.setSize(width, height);
            this.camera.updateProjectionMatrix();
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        };

        addModel(model) {
            this.model = model;
            this.scene.add(this.model.mesh);
            this.addChild(this.model.mesh.children);
            this.camera.lookAt(this.model.focuseTarget);
        };

        addChild(children) {// add components to editor
            for (let childIndex in children) {
                let child = children[childIndex];
                if (child.children.length > 0) this.addChild(child.children);
                else this.editor.objects.push(child);
            }
        };

        webglAvailable() {
            try {
                let canvas = document.createElement("canvas");
                return !!window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
            } catch (e) {
                return false
            }
        };
    }
    return SceneRenderer;
});
