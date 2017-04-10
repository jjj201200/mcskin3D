function webglAvailable() {
    try {
        var canvas = document.createElement("canvas");
        return !!window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    } catch (e) {
        return false
    }
}
WEBGL = webglAvailable();
var WIDTH = 0;
var HEIGHT = 0;
var MULTISAMPLING = 1;
var SKIN_WIDTH = 64;
var SKIN_HEIGHT = 64;
var SKIN_LEGACY_HEIGHT = 32;
var DEFAULT_SKIN_URL = "/static/img/default_skin.png";
var ALEX_SKIN_URL = "/static/img/alex.png";
var SCROLLABLE_BORDER_FACTOR = 1 / 16;
var SCROLLABLE_BORDER_MIN = 30;
var LEGACY_MODE = false;
var BACKGROUND_COLOR = 15724527;
var OVERLAP = 1;
var GRID_OFFSET = WEBGL ? 0.01 : 0.1;
var POSE_STEPS = 10;
var POSE_INTERVAL = 10;
var DOUBLETAP_INTERVAL = 150;
var COLOR_STEPS = 12;

function SkinEditor() {
    var skin_img, steve, scene, projector, camera, renderer, controls, toolbox, modelChanger, color, default_skin, initial_alex;
    this.grid_enabled = true;

    function init() {
        initRenderer();
        initControls();
        initActions();
        initToolbox()
    }

    function initRenderer() {
        scene = new THREE.Scene;
        projector = new THREE.Projector;
        setSize();
        camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1E3);
        resetCamera();
        if (WEBGL) renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        else renderer = new THREE.CanvasRenderer;
        renderer.setSize(WIDTH * MULTISAMPLING, HEIGHT * MULTISAMPLING);
        renderer.setClearColor(BACKGROUND_COLOR, 1);
        $("#canvas").append(renderer.domElement);
        $(window).resize(function () {
            if (setSize()) {
                renderer.setSize(WIDTH * MULTISAMPLING, HEIGHT);
                camera.aspect = WIDTH / HEIGHT;
                camera.updateProjectionMatrix()
            }
        })
    }

    function setSize() {
        var height = self.mobileVersion() ? 460 : 490;
        var width = $(".skineditor").width() - 2;
        if (width != WIDTH || height != HEIGHT) {
            WIDTH = width;
            HEIGHT = height;
            return true
        }
        return false
    }
    this.mobileVersion = function () {
        return !$(".sidebar").is(":visible")
    };

    function resetCamera() {
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 50;
        camera.lookAt(new THREE.Vector3(0, 0, 0))
    }

    function rgbToHex(r, g, b) {
        if (r > 255 || (g > 255 || b > 255)) throw "Invalid color component";
        var hex = (r << 16 | g << 8 | b).toString(16);
        return "#" + ("000000" + hex).slice(-6)
    }

    function initControls() {
        controls = new THREE.OrbitControls(camera, $("#canvas").get(0));
        controls.addEventListener("change", self.render);
        var last_tap = 0;
        $("#canvas").on("mousedown", function (e) {
            if (e.button !== 0 || !toolbox.startDrawing(e)) controls.onMouseDown(e)
        }).on("touchstart",
            function (e) {
                if (e.originalEvent.touches.length == 1 && e.timeStamp - last_tap < DOUBLETAP_INTERVAL) toolbox.dblclick(e);
                else if (e.originalEvent.touches.length == 1 && scrollableBorder(e)) return;
                else if (e.originalEvent.touches.length > 1 || !toolbox.startDrawing(e)) controls.onTouchStart(e.originalEvent);
                else last_tap = e.timeStamp;
                e.preventDefault()
            }).on("mousemove touchmove", function (e) {
            self.updateGrid(e);
            toolbox.move(e)
        }).on("mouseout touchend", function () { self.updateGrid(false) }).dblclick(function (e) { toolbox.dblclick(e) });
        $(document).on("mouseup touchend", function () { toolbox.stopDrawing() });
        $(".bodypart").click(function (e) {
            var bodypart = $(this).data("bodypart");
            var layer = $(this).data("layer");
            $(".bodypart[data-bodypart=" + bodypart + "][data-layer=" + layer + "]").toggleClass("hidden");
            self.toggleBodyPart(bodypart, layer, !$(this).hasClass("hidden"));
            return false
        });
        $("#grid").change(function () { self.toggleGrid(this.checked) });
        $(".zoom-in").click(function () {
            controls.zoomIn(1.1);
            return false
        });
        $(".zoom-out").click(function () {
            controls.zoomOut(1.1);
            return false
        });
        $(".center").click(function () {
            resetCamera();
            controls.center = new THREE.Vector3;
            return false
        });
        $(".move").mousedown(function (e) {
            controls.onMouseDown(e, true);
            return false
        }).on("touchstart", function (e) {
            controls.onTouchStart(e.originalEvent, true);
            return false
        }).click(function () {
            return false
        });
        $("#stance").change(function () { poses[this.value].apply(steve) });
        $("#model").change(function () { modelChanger.changeModel(this.value == "alex") })
    }

    function scrollableBorder(e) {
        var canvas_offset = $("#canvas").offset();
        var x = e.originalEvent.touches[0].pageX - canvas_offset.left;
        var border = Math.max(SCROLLABLE_BORDER_FACTOR * WIDTH, SCROLLABLE_BORDER_MIN);
        return x < border || x > WIDTH - border && self.mobileVersion()
    }

    function initActions() {
        $(".download").click(function () {
            var form = $("<form action='/skineditor/download' method='post'><input type='hidden' name='data' value='" + steve.dataURL() + "' /></form>").appendTo("body");
            if (self.mobileVersion()) form.attr("target", "_blank");
            form.submit();
            return false
        });
        $(".change").click(function () {
            $("<form action='/skineditor/change' method='post' target='_blank'><input type='hidden' name='data' value='" +
                steve.dataURL() + "' /><input type='hidden' name='alex' value='" + (steve.alex ? 1 : 0) + "' /></form>").appendTo("body").submit();
            return false
        });
        $(".upload").click(function () {
            $("#upload_file").click();
            return false
        });
        $("#upload_file").change(function () { $("#upload_form").submit() })
    }

    function initToolbox() { toolbox = new Toolbox(self) }
    this.loadSkin = function (url, alex) {
        default_skin = !url;
        initial_alex = !!alex;
        url = url || DEFAULT_SKIN_URL;
        skin_img = new Image;
        skin_img.src = url;
        skin_img.onload = loadSkinSuccess;
        skin_img.onerror =
            loadSkinError
    };

    function loadSkinSuccess() {
        steve = new Steve(skin_img, initial_alex);
        scene.add(steve.object);
        toolbox.setContext(steve.skin_context);
        modelChanger = new ModelChangeTool(scene, steve, toolbox, default_skin);
        renderLoop()
    }

    function loadSkinError() {
        if (skin_img.url != DEFAULT_SKIN_URL) skin_img.src = DEFAULT_SKIN_URL;
        else console.log("Unable to load default skin file.")
    }

    function renderLoop() {
        requestAnimationFrame(renderLoop);
        controls.update();
        self.render()
    }
    this.render = function () { renderer.render(scene, camera) };
    this.cast_ray = function (x, y, require_color) {
        if (!steve) return null;
        var canvas_offset = $("#canvas").offset();
        var vector = new THREE.Vector3((x - canvas_offset.left) / WIDTH * 2 - 1, 1 - (y - canvas_offset.top) / HEIGHT * 2, 0.5);
        projector.unprojectVector(vector, camera);
        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var objects = raycaster.intersectObjects([steve.object], true);
        for (var i in objects)
            if (!objects[i].object.ignore_intersect && (objects[i].object.visible && (!require_color ||
                    objects[i].face.materialIndex != 1))) return objects[i];
        return null
    };
    var grid_visible = false;
    this.updateGrid = function (e) {
        var visible;
        if (!self.grid_enabled || e === false) visible = false;
        else if (e) visible = !!self.cast_ray(e.pageX, e.pageY);
        if (visible != grid_visible) {
            grid_visible = visible;
            for (var i in steve.bodyparts) {
                steve.bodyparts[i].base.grid.box.visible = grid_visible && steve.bodyparts[i].base.visible;
                steve.bodyparts[i].overlay.grid.box.visible = grid_visible && steve.bodyparts[i].overlay.visible
            }
            self.render()
        }
    };
    this.toggleBodyPart =
        function (bodypart, layer, visible) { steve[bodypart][layer].toggleVisibility(visible) };
    this.toggleGrid = function (enabled) {
        if (self.grid_enabled == enabled) return;
        self.grid_enabled = enabled;
        self.render()
    };
    var self = this;
    init()
}

function Steve(skin_img, initial_alex) {
    var skin_canvas, skin_context, flipped_canvas, flipped_context, export_canvas, export_context, swap_canvas, swap_context, swap_available, torso, head, left_arm, right_arm, left_leg, right_leg, object_cache = {};
    var self = this;
    self.alex = false;

    function init() {
        initCanvas();
        initModel()
    }

    function initCanvas() {
        skin_canvas = document.createElement("canvas");
        skin_canvas.width = SKIN_WIDTH;
        skin_canvas.height = SKIN_HEIGHT;
        self.skin_context = skin_context = skin_canvas.getContext("2d");
        flipped_canvas =
            document.createElement("canvas");
        flipped_canvas.width = SKIN_WIDTH;
        flipped_canvas.height = SKIN_LEGACY_HEIGHT;
        flipped_context = flipped_canvas.getContext("2d");
        export_canvas = document.createElement("canvas");
        export_canvas.width = SKIN_WIDTH;
        export_canvas.height = SKIN_HEIGHT;
        export_context = export_canvas.getContext("2d");
        skin_context.drawImage(skin_img, 0, 0);
        if (skin_img.height == SKIN_LEGACY_HEIGHT) convertLegacySkin();
        else if (initial_alex || skin_context.getImageData(50, 16, 1, 1).data[3] === 0) {
            self.alex = true;
            $(".bodypart").addClass("alex");
            $("#model").selectpicker("val", "alex")
        }
    }
    self.updateModel = function (alex_) {
        self.alex = alex_;
        initModel(true)
    };

    function initModel(no_overlay_detection) {
        if (!object_cache[self.alex]) {
            self.object = new THREE.Object3D("steve");
            object_cache[self.alex] = {
                object: self.object,
                torso: new BodyPart({
                    name: "torso",
                    size: new THREE.Vector3(8, 12, 4),
                    texture_offset: new THREE.Vector2(16, 16),
                    overlay_texture_offset: new THREE.Vector2(16, 32),
                    origin: new THREE.Vector3(0, 2, 0),
                    position: new THREE.Vector3(0, 0, 0),
                    texture: skin_context,
                    parent: self,
                    overlay: 0.95
                }),
                head: new BodyPart({ name: "head", size: new THREE.Vector3(8, 8, 8), texture_offset: new THREE.Vector2(0, 0), overlay_texture_offset: new THREE.Vector2(32, 0), origin: new THREE.Vector3(0, 8, 0), position: new THREE.Vector3(0, 4, 0), texture: skin_context, parent: self, overlay: 1 }),
                left_arm: self.alex ? new BodyPart({
                    name: "left arm",
                    size: new THREE.Vector3(3, 12, 4),
                    texture_offset: new THREE.Vector2(32, 48),
                    overlay_texture_offset: new THREE.Vector2(48, 48),
                    origin: new THREE.Vector3(3.5, 8, 0),
                    position: new THREE.Vector3(2, -6, 0),
                    texture: skin_context,
                    parent: self,
                    overlay: 1.05
                }) : new BodyPart({ name: "left arm", size: new THREE.Vector3(4, 12, 4), texture_offset: new THREE.Vector2(32, 48), overlay_texture_offset: new THREE.Vector2(48, 48), origin: new THREE.Vector3(4, 8, 0), position: new THREE.Vector3(2, -6, 0), texture: skin_context, parent: self, overlay: 1.05 }),
                right_arm: self.alex ? new BodyPart({
                    name: "right arm",
                    size: new THREE.Vector3(3, 12, 4),
                    texture_offset: new THREE.Vector2(40, 16),
                    overlay_texture_offset: new THREE.Vector2(40, 32),
                    origin: new THREE.Vector3(-3.5,
                        8, 0),
                    position: new THREE.Vector3(-2, -6, 0),
                    texture: skin_context,
                    parent: self,
                    overlay: 1.05
                }) : new BodyPart({ name: "right arm", size: new THREE.Vector3(4, 12, 4), texture_offset: new THREE.Vector2(40, 16), overlay_texture_offset: new THREE.Vector2(40, 32), origin: new THREE.Vector3(-4, 8, 0), position: new THREE.Vector3(-2, -6, 0), texture: skin_context, parent: self, overlay: 1.05 }),
                left_leg: new BodyPart({
                    name: "left leg",
                    size: new THREE.Vector3(4, 12, 4),
                    texture_offset: new THREE.Vector2(16, 48),
                    overlay_texture_offset: new THREE.Vector2(0,
                        48),
                    origin: new THREE.Vector3(2, -4, 0),
                    position: new THREE.Vector3(0, -6, 0),
                    texture: skin_context,
                    parent: self,
                    overlay: 1
                }),
                right_leg: new BodyPart({ name: "right leg", size: new THREE.Vector3(4, 12, 4), texture_offset: new THREE.Vector2(0, 16), overlay_texture_offset: new THREE.Vector2(0, 32), origin: new THREE.Vector3(-2, -4, 0), position: new THREE.Vector3(0, -6, 0), texture: skin_context, parent: self, overlay: 1.01 })
            }
        }
        var objects = object_cache[self.alex];
        for (var i in objects) {
            self[i] = objects[i];
            if (no_overlay_detection && i != "object") {
                objects[i].base.update();
                objects[i].overlay.update()
            }
        }
        self.bodyparts = [self.torso, self.head, self.left_arm, self.right_arm, self.left_leg, self.right_leg];
        toggleOverlay(no_overlay_detection)
    }

    function convertLegacySkin() {
        flipped_context.translate(64, 0);
        flipped_context.scale(-1, 1);
        flipped_context.drawImage(skin_canvas, 0, 0);
        skin_context.drawImage(flipped_canvas, 52, 20, 12, 12, 16, 52, 12, 12);
        skin_context.drawImage(flipped_canvas, 48, 20, 4, 12, 28, 52, 4, 12);
        skin_context.drawImage(flipped_canvas, 52, 16, 4, 4, 24, 48, 4, 4);
        skin_context.drawImage(flipped_canvas,
            56, 16, 4, 4, 20, 48, 4, 4);
        skin_context.drawImage(flipped_canvas, 12, 20, 12, 12, 32, 52, 12, 12);
        skin_context.drawImage(flipped_canvas, 8, 20, 4, 12, 44, 52, 4, 12);
        skin_context.drawImage(flipped_canvas, 12, 16, 4, 4, 40, 48, 4, 4);
        skin_context.drawImage(flipped_canvas, 16, 16, 4, 4, 36, 48, 4, 4)
    }

    function toggleOverlay(no_overlay_detection) {
        for (var i in self.bodyparts) {
            var bodypart = self.bodyparts[i];
            if (!no_overlay_detection) {
                if (!isTextureEmpty(bodypart.overlay_texture_offset, bodypart.size)) {
                    bodypart.overlay.toggleVisibility(true);
                    $("div[data-layer=overlay][data-bodypart=" +
                        bodypart.name.replace(" ", "_") + "]").removeClass("hidden")
                }
            } else {
                bodypart.overlay.toggleVisibility(!$("div[data-layer=overlay][data-bodypart=" + bodypart.name.replace(" ", "_") + "]").hasClass("hidden"));
                bodypart.base.toggleVisibility(!$("div[data-layer=base][data-bodypart=" + bodypart.name.replace(" ", "_") + "]").hasClass("hidden"))
            }
        }
    }

    function isTextureEmpty(offset, size) {
        var w = size.x * 2 + size.z * 2;
        var h = size.y + size.z;
        var data = skin_context.getImageData(offset.x, offset.y, w, h).data;
        for (var x = 0; x < w; x++)
            for (var y =
                    0; y < h; y++)
                if ((y > size.z || x > size.z && x < w - size.z) && data[(x + y * w) * 4 + 3] > 0) return false;
        return true
    }
    this.dataURL = function () {
        export_context.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
        for (var i in self.bodyparts) {
            var bodypart = self.bodyparts[i];
            var w = bodypart.size.x * 2 + bodypart.size.z * 2;
            var h = bodypart.size.z + bodypart.size.y;
            export_context.putImageData(skin_context.getImageData(bodypart.texture_offset.x, bodypart.texture_offset.y, w, h), bodypart.texture_offset.x, bodypart.texture_offset.y);
            if (bodypart.overlay.visible) export_context.putImageData(skin_context.getImageData(bodypart.overlay_texture_offset.x,
                bodypart.overlay_texture_offset.y, w, h), bodypart.overlay_texture_offset.x, bodypart.overlay_texture_offset.y)
        }
        return export_canvas.toDataURL()
    };
    init()
}

function BodyPart(options) {
    this.name = options.name;
    this.size = options.size;
    this.texture_offset = options.texture_offset;
    this.overlay_texture_offset = options.overlay_texture_offset;
    this.origin = options.origin;
    this.position = options.position;
    this.texture = options.texture;
    this.parent = options.parent;
    this.overlay_size = options.overlay;
    var self = this;

    function init() {
        self.object = new THREE.Object3D;
        self.object.name = self.name + " bodypart";
        self.object.position = self.origin;
        self.object.object = self;
        self.parent.object.add(self.object);
        self.base = new Box({ name: self.name, size: self.size, position: self.position, texture_offset: self.texture_offset, texture: self.texture, parent: self, adjustment: self.overlay_size - 1 });
        self.overlay = new Box({ name: self.name + " overlay", size: self.size, position: self.position, texture_offset: self.overlay_texture_offset, texture: self.texture, parent: self, overlay: self.overlay_size })
    }
    init()
}
var materials = [new THREE.MeshBasicMaterial({ color: 16777215, vertexColors: THREE.FaceColors, side: THREE.DoubleSide, overdraw: 1 }), new THREE.MeshBasicMaterial({ visible: false, opacity: 0 }), new THREE.MeshBasicMaterial({ color: 15658734, wireframe: true, wireframeLinewidth: 0.3 }), new THREE.MeshBasicMaterial({ color: 4473924, wireframe: true, wireframeLinewidth: 0.3 })];

function Box(options) {
    this.name = options.name;
    this.size = options.size;
    this.position = options.position;
    this.texture_offset = options.texture_offset;
    this.texture = options.texture;
    this.parent = options.parent;
    this.overlay = options.overlay || false;
    this.visible = !this.overlay;
    this.adjustment = options.adjustment || 0;
    var self = this;

    function init() {
        self.object = new THREE.Object3D;
        self.object.name = self.name;
        self.object.position = self.position;
        self.object.object = self;
        self.parent.object.add(self.object);
        self.box_size = self.size.clone();
        if (self.overlay) self.box_size.add(new THREE.Vector3(self.overlay, self.overlay, self.overlay));
        else if (self.adjustment) self.box_size.add(new THREE.Vector3(self.adjustment, self.adjustment, self.adjustment));
        initBox();
        self.grid = new Grid({ name: self.name, size: self.size, box_size: self.box_size, parent: self })
    }

    function initBox() {
        self.box_geometry = new THREE.CubeGeometry(self.box_size.x, self.box_size.y, self.box_size.z, self.size.x, self.size.y, self.size.z);
        self.box = new THREE.Mesh(self.box_geometry, new THREE.MeshFaceMaterial(materials));
        self.box.name = self.name + " texture";
        self.box.visible = self.visible;
        self.box.object = self;
        self.object.add(self.box);
        drawTexture()
    }
    this.update = function () {
        self.object.remove(self.box);
        initBox()
    };

    function drawTexture() {
        for (var face_index in self.box_geometry.faces) {
            var texture_coords = self.textureCoordinate(face_index);
            var data = self.texture.getImageData(texture_coords.x, texture_coords.y, 1, 1).data;
            var color = new THREE.Color(0);
            color.setRGB(data[0] / 255, data[1] / 255, data[2] / 255);
            self.box_geometry.faces[face_index].color =
                color;
            self.box_geometry.faces[face_index].materialIndex = data[3] < 255 && self.overlay ? 1 : 0
        }
    }
    this.textureCoordinate = function (face_index, return_face) {
        var face;
        for (face in FACES) {
            var faces = FACES[face].faces(this.size);
            if (face_index < faces) break;
            face_index -= faces
        }
        face = FACES[face];
        if (return_face) return face;
        var position = face.position(this.size, face_index);
        position.add(this.texture_offset);
        return position
    };
    this.boxFace = function (face_index) {
        return self.textureCoordinate(face_index, true)
    };
    this.facesOnFace = function (target_face) {
        var face;
        var face_index = 0;
        for (face in FACES) {
            var faces = FACES[face].faces(this.size);
            if (FACES[face] == target_face) break;
            face_index += faces
        }
        return self.box_geometry.faces.slice(face_index, face_index + FACES[face].faces(self.size))
    };
    this.toggleVisibility = function (visible) {
        self.visible = visible;
        self.box.visible = visible
    };
    init()
}

function Face(name, x, y, offset, mirror) {
    this.name = name;
    this.x = x;
    this.y = y;
    this._offset = offset;
    this.mirror = !!mirror;
    this.faces = function (size) {
        return size[this.x] * size[this.y]
    };
    this.offset = function (size) {
        var offset = size.clone();
        offset.applyMatrix3(this._offset);
        return offset
    };
    this.position = function (size, face_index) {
        var position = this.offset(size);
        if (this.mirror) {
            position.x += Math.floor(face_index) % size[this.x];
            position.y += size[this.y] - 1 - Math.floor(face_index / size[this.x])
        } else {
            position.x += Math.floor(face_index) % size[this.x];
            position.y += Math.floor(face_index / size[this.x])
        }
        return position
    }
}
var FACES = [new Face("left", "z", "y", new THREE.Matrix3(1, 0, 1, 0, 0, 1, 0, 0, 0)), new Face("right", "z", "y", new THREE.Matrix3(0, 0, 0, 0, 0, 1, 0, 0, 0)), new Face("top", "x", "z", new THREE.Matrix3(0, 0, 1, 0, 0, 0, 0, 0, 0)), new Face("bottom", "x", "z", new THREE.Matrix3(1, 0, 1, 0, 0, 0, 0, 0, 0), true), new Face("front", "x", "y", new THREE.Matrix3(0, 0, 1, 0, 0, 1, 0, 0, 0)), new Face("back", "x", "y", new THREE.Matrix3(1, 0, 2, 0, 0, 1, 0, 0, 0))];

function Grid(options) {
    this.name = options.name;
    this.size = options.size;
    this.box_size = options.box_size;
    this.parent = options.parent;
    var self = this;

    function init() {
        self.box_size.add(new THREE.Vector3(GRID_OFFSET, GRID_OFFSET, GRID_OFFSET));
        self.box_geometry = new THREE.CubeGeometry(self.box_size.x, self.box_size.y, self.box_size.z, self.size.x, self.size.y, self.size.z);
        self.box = new THREE.Mesh(self.box_geometry, materials[self.parent.overlay ? 2 : 3]);
        self.box.name = self.name + " grid";
        self.box.ignore_intersect = true;
        self.box.visible =
            false;
        self.parent.object.add(self.box)
    }
    init()
}
var poseTimer = null;

function Pose(positions) {
    this.positions = positions;
    this.apply = function (steve, no_animation) {
        if (no_animation) {
            for (var i in steve.bodyparts) {
                var bodypart = steve.bodyparts[i];
                var rotation = this.positions[bodypart.name];
                bodypart.object.rotation.x = rotation.x;
                bodypart.object.rotation.y = rotation.y;
                bodypart.object.rotation.z = rotation.z
            }
            return
        }
        if (poseTimer) window.clearInterval(poseTimer);
        var step = 0;
        var start = {};
        var end = this.positions;
        for (var i in steve.bodyparts) {
            var bodypart = steve.bodyparts[i];
            start[bodypart.name] =
                new THREE.Vector3(bodypart.object.rotation.x, bodypart.object.rotation.y, bodypart.object.rotation.z)
        }
        poseTimer = window.setInterval(function () {
            step++;
            for (var i in steve.bodyparts) {
                var bodypart = steve.bodyparts[i];
                var rotation = start[bodypart.name].clone();
                var direction = end[bodypart.name].clone();
                direction.sub(rotation);
                direction.multiplyScalar(step / POSE_STEPS);
                rotation.add(direction);
                bodypart.object.rotation.x = rotation.x;
                bodypart.object.rotation.y = rotation.y;
                bodypart.object.rotation.z = rotation.z
            }
            if (step >=
                POSE_STEPS) {
                window.clearInterval(poseTimer);
                poseTimer = null
            }
        }, POSE_INTERVAL)
    }
}
var pi2 = Math.PI / 2;
var null_vector = new THREE.Vector3(0, 0, 0);
var poses = {
    Default: new Pose({ "head": null_vector, "torso": null_vector, "left arm": null_vector, "right arm": null_vector, "left leg": null_vector, "right leg": null_vector }),
    Hug: new Pose({ "head": null_vector, "torso": null_vector, "left arm": new THREE.Vector3(0, 0, pi2), "right arm": new THREE.Vector3(0, 0, -pi2), "left leg": new THREE.Vector3(0, 0, 0.2), "right leg": new THREE.Vector3(0, 0, -0.2) }),
    Walk: new Pose({
        "head": null_vector,
        "torso": null_vector,
        "left arm": new THREE.Vector3(-0.2, 0, 0.1),
        "right arm": new THREE.Vector3(0.2,
            0, -0.1),
        "left leg": new THREE.Vector3(0.2, 0, 0),
        "right leg": new THREE.Vector3(-0.2, 0, 0)
    }),
    Run: new Pose({ "head": new THREE.Vector3(-0.2, 0, 0), "torso": null_vector, "left arm": new THREE.Vector3(1.4, 0, 0.1), "right arm": new THREE.Vector3(-1.4, 0, -0.1), "left leg": new THREE.Vector3(-0.5, 0, 0), "right leg": new THREE.Vector3(0.5, 0, 0) }),
    Fly: new Pose({
        "head": new THREE.Vector3(-0.2, 0, 0),
        "torso": null_vector,
        "left arm": new THREE.Vector3(0.2, 0, 0.3),
        "right arm": new THREE.Vector3(-0.2, 0, -0.1),
        "left leg": new THREE.Vector3(0,
            0, 0.5),
        "right leg": new THREE.Vector3(0, 0, -0.5)
    })
};

function rgbToHex(r, g, b) {
    if (r > 255 || (g > 255 || b > 255)) throw "Invalid color component";
    var hex = (r << 16 | g << 8 | b).toString(16);
    return "#" + ("000000" + hex).slice(-6)
}

function Brush(toolbox) {
    this.draw = function (context, x, y, object, face, color) {
        var original = context.getImageData(x, y, 1, 1).data;
        var original_hex = original[3] < 255 && object.object.overlay ? null : rgbToHex(original[0], original[1], original[2]);
        if (original_hex == color) return null;
        var data = { update: false, color: original_hex, material: face.materialIndex };
        face.color = new THREE.Color(color);
        context.fillStyle = color;
        context.fillRect(x, y, 1, 1);
        if (face.materialIndex !== 0) {
            face.materialIndex = 0;
            data.update = WEBGL
        }
        return data
    };
    this.undo =
        function (context, x, y, object, face, color, data) {
            if (data.color === null) toolbox.eraser.draw(context, x, y, object, face, color, data);
            else {
                context.fillStyle = data.color;
                context.fillRect(x, y, 1, 1);
                face.materialIndex = data.material;
                face.color = new THREE.Color(data.color)
            }
        };
    this.dblclick = new Bucket(toolbox)
}

function DoubleBucket(toolbox) {
    this.draw = function (context, x, y, object, face, color) {
        var box = object.object;
        var size = box.size;
        var w = size.z * 2 + size.x * 2;
        var h = size.y + size.z;
        var original = context.getImageData(box.texture_offset.x, box.texture_offset.y, w, h);
        var different = false;
        var data = original.data;
        for (var dx = 0; dx < w; dx++) {
            for (var dy = 0; dy < h; dy++) {
                var i = (dx + dy * w) * 4;
                if (rgbToHex(data[i], data[i + 1], data[i + 2]) != color || data[i + 3] != 255) {
                    different = true;
                    break
                }
            }
            if (different) break
        }
        if (!different) return null;
        data = {
            update: true,
            original: original,
            offset: box.texture_offset
        };
        context.fillStyle = color;
        context.fillRect(box.texture_offset.x, box.texture_offset.y, w, h);
        return data
    };
    this.undo = function (context, x, y, object, face, color, data) { context.putImageData(data.original, data.offset.x, data.offset.y) }
}

function Bucket(toolbox) {
    this.draw = function (context, x, y, object, face, color) {
        var box_face = object.object.boxFace(face.index);
        var offset = box_face.offset(object.object.size);
        offset.add(object.object.texture_offset);
        var w = object.object.size[box_face.x],
            h = object.object.size[box_face.y],
            original = context.getImageData(offset.x, offset.y, w, h);
        var different = false;
        var data = original.data;
        for (var dx = 0; dx < w; dx++) {
            for (var dy = 0; dy < h; dy++) {
                var i = (dx + dy * w) * 4;
                if (rgbToHex(data[i], data[i + 1], data[i + 2]) != color || data[i + 3] !=
                    255) {
                    different = true;
                    break
                }
            }
            if (different) break
        }
        if (!different) return null;
        context.fillStyle = color;
        context.fillRect(offset.x, offset.y, w, h);
        return { offset: offset, original: original, update: true }
    };
    this.undo = function (context, x, y, object, face, color, data) { context.putImageData(data.original, data.offset.x, data.offset.y) };
    this.dblclick = new DoubleBucket(toolbox)
}

function Eraser(toolbox) {
    this.draw = function (context, x, y, object, face, color) {
        if (!object.object.overlay || face.materialIndex !== 0) return null;
        var original = context.getImageData(x, y, 1, 1);
        var data = { update: WEBGL, color: rgbToHex(original.data[0], original.data[1], original.data[2]), material: face.materialIndex };
        context.clearRect(x, y, 1, 1);
        face.materialIndex = 1;
        return data
    };
    this.undo = function (context, x, y, object, face, color, data) {
        context.fillStyle = data.color;
        context.fillRect(x, y, 1, 1);
        face.materialIndex = data.material;
        face.color = new THREE.Color(data.color)
    };
    this.dblclick = new DoubleEraser(toolbox)
}

function DoubleEraser(toolbox) {
    this.draw = function (context, x, y, object, face, color) {
        var box = object.object;
        if (!box.overlay) return null;
        var size = box.size;
        var w = size.z * 2 + size.x * 2;
        var h = size.y + size.z;
        var original = context.getImageData(box.texture_offset.x, box.texture_offset.y, w, h);
        var different = false;
        var data = original.data;
        for (var dx = 0; dx < w && !different; dx++)
            for (var dy = 0; dy < h; dy++) {
                var i = (dx + dy * w) * 4;
                if (data[i + 3] !== 0) {
                    different = true;
                    break
                }
            }
        if (!different) return null;
        data = { update: true, original: original, offset: box.texture_offset };
        context.clearRect(box.texture_offset.x, box.texture_offset.y, w, h);
        return data
    };
    this.undo = function (context, x, y, object, face, color, data) { context.putImageData(data.original, data.offset.x, data.offset.y) }
}

function Eyedropper(toolbox) {
    this.draw = function (context, x, y, object, face, color) {
        var data = context.getImageData(x, y, 1, 1).data;
        var new_hex = rgbToHex(data[0], data[1], data[2]);
        toolbox.color = new_hex;
        $(".swatch.active .color").minicolors("value", new_hex)
    };
    this.require_color = true
}

function ModelChangeTool(scene, steve, toolbox, default_skin) {
    var skin_context = steve.skin_context,
        history = toolbox.history,
        alex = steve.alex,
        alex_img;
    var self = this;
    init();

    function init() {
        if (default_skin) {
            alex_img = new Image;
            alex_img.src = ALEX_SKIN_URL
        }
    }
    this.changeModel = function (alex_) {
        if (alex_ != alex)
            if (history.head() && history.head().tool == self) history.undo();
            else {
                var original = skin_context.getImageData(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
                history.push(skin_context, null, null, { object: { update: function () {} } }, null, null,
                    self, original);
                self.draw(skin_context, null, null, null, null, null)
            }
    };
    this.draw = function (context, x, y, object, face, color) {
        alex = !alex;
        if (alex && (history.length() === 1 && default_skin)) context.drawImage(alex_img, 0, 0);
        else if (alex) {
            convertArm(40, 16, 1);
            convertArm(40, 32, 1);
            convertArm(32, 48, 0);
            convertArm(48, 48, 0)
        } else {
            convertArmBack(40, 16, 1);
            convertArmBack(40, 32, 1);
            convertArmBack(32, 48, 0);
            convertArmBack(48, 48, 0)
        }
        updateSteve()
    };

    function convertArm(x, y, right) {
        if (right) copy(x + 5, y, 3, 4, -1);
        copy(x + 8 + right, y, 3, 4, -1 - right);
        if (right) copy(x + 5, y + 4, 3, 12, -1);
        copy(x + 8, y + 4, 4, 12, -1);
        copy(x + 13 - right, y + 4, 3, 12, right - 2);
        skin_context.clearRect(x + 10, y + 0, 2, 4);
        skin_context.clearRect(x + 14, y + 4, 2, 12)
    }

    function convertArmBack(x, y, right) {
        copy(x + 8 + right, y, 3, 4, -1 - right, 1);
        if (right) copy(x + 5, y, 3, 4, -1, 1);
        copy(x + 13 - right, y + 4, 3, 12, right - 2, 1);
        copy(x + 8, y + 4, 4, 12, -1, 1);
        if (right) copy(x + 5, y + 4, 3, 12, -1, 1);
        if (right) {
            fill(x + 4, y, 16);
            fill(x + 8, y, 4);
            fill(x + 15, y + 4, 12)
        } else {
            fill(x + 7, y, 16);
            fill(x + 11, y, 4);
            fill(x + 12, y + 4, 12)
        }
    }

    function copy(x, y, w, h, d, b) {
        b = b || 0;
        skin_context.putImageData(skin_context.getImageData(x +
            d * b, y, w, h), x + d * !b, y)
    }

    function fill(x, y, h) {
        skin_context.fillStyle = toolbox.color;
        skin_context.fillRect(x, y, 1, h)
    }
    this.undo = function (context, x, y, object, face, color, data) {
        alex = !alex;
        context.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
        context.putImageData(data, 0, 0);
        updateSteve()
    };

    function updateSteve() {
        scene.remove(steve.object);
        steve.updateModel(alex);
        poses[$("#stance").val()].apply(steve, true);
        scene.add(steve.object);
        $(".bodypart").toggleClass("alex", alex);
        $("#model").val(alex ? "alex" : "steve")
    }
}

function History(editor) {
    var past = [],
        future = [],
        self = this;

    function init() {
        registerRepeating(".undo", self.undo);
        registerRepeating(".redo", self.redo)
    }

    function registerRepeating(id, callback) {
        var interval = null;
        $(id).mousedown(function () {
            callback();
            interval = window.setInterval(callback, 100)
        }).click(function (e) { e.preventDefault() });
        $(document).mouseup(function () {
            if (interval) {
                window.clearInterval(interval);
                interval = null
            }
        })
    }
    this.undo = function () {
        var action = past.pop();
        if (action) {
            future.push(action);
            action.tool.undo(action.context,
                action.x, action.y, action.object, action.face, action.color, action.data);
            action.object.object.update()
        }
        self.updateButtons();
        editor.render()
    };
    this.redo = function () {
        var action = future.pop();
        if (action) {
            past.push(action);
            action.tool.draw(action.context, action.x, action.y, action.object, action.face, action.color);
            action.object.object.update()
        }
        self.updateButtons();
        editor.render()
    };
    this.push = function (context, x, y, object, face, color, tool, data) {
        past.push({
            context: context,
            x: x,
            y: y,
            object: object,
            face: face,
            color: color,
            tool: tool,
            data: data
        });
        future = [];
        self.updateButtons()
    };
    this.head = function () {
        return past.length > 0 ? past[past.length - 1] : null
    };
    this.updateButtons = function () {
        $(".undo").toggleClass("disabled", past.length === 0);
        $(".redo").toggleClass("disabled", future.length === 0)
    };
    this.length = function () {
        return past.length
    };
    init()
}

function Toolbox(editor) {
    this.context = null;
    this.history = new History(editor);
    this.brush = new Brush(this);
    this.bucket = new Bucket(this);
    this.eraser = new Eraser(this);
    this.eyedropper = new Eyedropper(this);
    this.tool = this.brush;
    var drawing = false,
        initialized = false,
        ignore_change_event = false,
        self = this;

    function init() {
        self.color = "#ff0000";
        toolButton(".brush", self.brush);
        toolButton(".bucket", self.bucket);
        toolButton(".erase", self.eraser);
        toolButton(".dropper", self.eyedropper);
        $(".swatch").each(function () {
            color =
                $(this).find(".color").val();
            $(this).data("brightness", 0).data("original_color", color).data("color", color)
        });
        $(".color").minicolors({
            change: function () {
                if ($(this).hasClass("clone")) return;
                var color = this.value;
                var swatch = $(this).parents(".swatch");
                swatch.data("color", color);
                if (!ignore_change_event) swatch.data("original_color", color).data("brightness", 0);
                ignore_change_event = false;
                self.color = color
            },
            show: function () {
                if (!$(this).parents(".swatch").hasClass("active")) {
                    $(".swatch.active").removeClass("active");
                    $(this).parents(".swatch").addClass("active")
                }
                var original_input = this;
                var panel = $(this).siblings(".minicolors-panel");
                if (panel.is(":visible") && panel.children("input").length === 0) {
                    var input = $(document.createElement("INPUT"));
                    input.addClass("form-control minicolors-input clone").val(this.value).appendTo(panel).keyup(function () {
                        if (this.value.match(/^#?[0-9a-f]{3}([0-9a-f]{3})?$/i)) $(original_input).minicolors("value", this.value)
                    })
                }
                self.color = this.value
            }
        });
        updateSize();
        $(window).resize(updateSize);
        self.color =
            $(".swatch.active .color").val();
        $(".brightness-down").click(function () {
            modifyBrightness(-1);
            return false
        });
        $(".brightness-up").click(function () {
            modifyBrightness(1);
            return false
        })
    }
    var mobile = false;

    function updateSize() {
        if (mobile != editor.mobileVersion()) {
            mobile = !mobile;
            $(".color.right").minicolors("settings", { position: mobile ? "bottom right" : "bottom left" })
        }
    }

    function modifyBrightness(modifer) {
        var color = $(".swatch.active");
        color.data("brightness", Math.min(COLOR_STEPS, Math.max(-COLOR_STEPS, color.data("brightness") +
            modifer)));
        var hex = color.data("original_color");
        var brightness = color.data("brightness");
        newhex = "#";
        for (var i = 0; i < 3; i++) {
            var c = parseInt(hex.substr(1 + 2 * i, 2), 16);
            c = c + (brightness > 0 ? 255 - c : c) * brightness / COLOR_STEPS;
            newhex += (Math.round(c) < 16 ? "0" : "") + Math.round(c).toString(16)
        }
        ignore_change_event = true;
        console.log(newhex);
        $(".swatch.active .color").minicolors("value", newhex)
    }

    function toolButton(id, tool) {
        $(id).click(function () {
            $(".tool").removeClass("active");
            $(this).addClass("active");
            self.tool = tool;
            return false
        })
    }
    this.setContext = function (context) {
        self.context = context;
        initialized = true
    };
    this.startDrawing = function (e) {
        if (draw(e)) {
            drawing = true;
            return true
        } else return false
    };
    this.move = function (e) {
        if (drawing && (!e.originalEvent.touches || e.originalEvent.touches.length == 1)) draw(e)
    };
    this.stopDrawing = function (e) { drawing = false };
    this.dblclick = function (e) {
        if (self.tool.dblclick) {
            self.history.undo();
            var l = self.history.length();
            var swap = self.tool;
            self.tool = self.tool.dblclick;
            draw(e);
            self.tool = swap;
            if (l == self.history.length()) self.history.redo()
        }
        e.preventDefault()
    };

    function draw(e) {
        if (e.originalEvent.touches) e = e.originalEvent.touches[0];
        var object = editor.cast_ray(e.pageX, e.pageY, self.tool.require_color);
        if (!object) return false;
        var texture_position = object.object.object.textureCoordinate(object.faceIndex);
        object.face.index = object.faceIndex;
        var data = self.tool.draw(self.context, texture_position.x, texture_position.y, object.object, object.face, self.color);
        if (!data) return true;
        if (data.update) object.object.object.update();
        else object.object.geometry.colorsNeedUpdate =
            true;
        self.history.push(self.context, texture_position.x, texture_position.y, object.object, object.face, self.color, self.tool, data);
        editor.render();
        return true
    }
    init()
}
$(function () {
    if (!$(".skineditor").length) return;
    var editor = new SkinEditor;
    if (typeof skin_data !== "undefined") editor.loadSkin("data:image/png;base64," + skin_data);
    else if (window.location.hash.length > 1) {
        var skin = window.location.hash.substr(1);
        var alex = false;
        var base = "/static/skin/";
        if (skin.substr(0, 1) == "@") {
            base = "/private/skin/";
            skin = skin.substr(1)
        }
        if (skin.indexOf("/") != -1) {
            var parts = skin.split("/");
            skin = parts[0];
            if (parts[1] == "3px") alex = true
        }
        editor.loadSkin(base + skin + ".png", alex)
    } else editor.loadSkin()
});
