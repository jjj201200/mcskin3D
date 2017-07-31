/*
 * @Author: jjj201200@gmail.com 
 * @Date: 2017-07-31 14:26:06 
 * @Last Modified by:   jjj201200@gmail.com 
 * @Last Modified time: 2017-07-31 14:26:06 
 */

define('Part', [
    'THREE',
    'TWEEN',
    'jquery',
    'Cube'
], function (THREE, TWEEN, $, Cube) {
    return class Part {
        constructor(options) {
            this.skin = undefined;
            this.skinLayers = [];
            this.cubes = {};
            this.mesh = new THREE.Mesh();
            this.meshBox = new THREE.Mesh();
            this.data = undefined;
            this.name = undefined;
            this.partName = undefined;
            this.texture = undefined;
            this.typeIndex = undefined;
            this.version = undefined;
            this.position = undefined;
            this.rotation = undefined;
            this.center = undefined;
            this.defaultPosition = undefined;
            this.model = undefined;

            //animation
            this.focusing = false;

            this.init(options);
        }

        init(options) {
            $.extend(this, options);
            this.mesh.name = this.name;
            this.mesh.part = this;
            this.meshBox.name = this.name + ' box';
            this.defaultPosition = new THREE.Vector3(
                this.position.x + this.center.x,
                this.position.y + this.center.y,
                this.position.z + this.center.z
            );
            this.update();

            return this;
        };

        update(original) {
            let data = this.data.map[this.typeIndex] || this.data.map[0];
            let length = Object.keys(this.cubes).length;
            let t = this;
            if (length == 0) {
                for (var name in data) {
                    if (data[name].visible) {
                        var cube = new Cube({
                            name: t.name + ' ' + name,
                            skin: t.skin,
                            data: data[name],
                            version: t.version,
                            center: t.center
                        });

                        cube.mesh.visible = data[name].visible;
                        this.cubes[name] = cube;
                        this.meshBox.add(cube.mesh);
                    }
                }
                this.meshBox.position.set(
                    this.defaultPosition.x,
                    this.defaultPosition.y,
                    this.defaultPosition.z
                );
                if (this.rotation) {
                    this.meshBox.rotation.set(
                        this.rotation.x,
                        this.rotation.y,
                        this.rotation.y,
                    )
                }
                this.mesh.add(this.meshBox);
            } else {
                for (var name in data) {
                    this.cubes[name].setSkinLayers(this.skinLayers);
                    original ? this.cubes[name].reloadOriginalSkin() : this.cubes[name].drawSkin();
                }
            }

            return this;
        };

        setSkinLayers(skinLayers) {
            this.skinLayers = skinLayers;
            return this;
        };

        drawSkin() {
            this.update();
            return this;
        };

        reloadOriginalSkin() {
            this.update(true);
            return this;
        };

        focuse(opacity) {
            let _this = this;
            let data = Object.keys(this.data.map[this.typeIndex] || this.data.map[0]);
            if (_this.focusing == false) {
                let toOpacity = opacity == undefined ? 1 : opacity;
                let opacityObject;

                // console.log(name,_this.cubes[name].opacity != toOpacity)
                // console.log(name,_this.cubes[name].opacity , toOpacity)
                if (_this.cubes[data[0]].opacity != toOpacity) {
                    opacityObject = { opacity: _this.cubes[data[0]].opacity };

                    var tween = new TWEEN.Tween(opacityObject).to({
                        opacity: toOpacity
                    }, 300).easing(
                        TWEEN.Easing.Quadratic.InOut
                        ).onStart(function () {
                            _this.focusing = true;
                            _this.model.animating = true;
                            _this.mesh.visible = true;
                            for (let index in data) {
                                _this.cubes[data[index]].mesh.visible = true;
                            }
                        }).onUpdate(function () {
                            for (let index in data) {
                                _this.cubes[data[index]].setOpacity(this.opacity);
                            }
                        }).onComplete(function () {
                            _this.focusing = false;
                            _this.model.animating = false;
                            if (toOpacity == 0) {
                                _this.mesh.visible = false;
                                for (let index in data) {
                                    _this.cubes[data[index]].mesh.visible = false;
                                }
                            }
                        }).start();
                } else {
                    if (toOpacity == 1) {
                        _this.mesh.visible = true;
                        for (let index in data) {
                            _this.cubes[data[index]].mesh.visible = true;
                        }
                    }
                }
            }
            return this;
        };

        unFocuse() {
            return this.focuse(0.1);
        }

        resetFocuse() {
            return this.focuse(1);
        }
    }
});