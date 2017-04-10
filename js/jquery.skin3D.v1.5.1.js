/**
 * @author Ruo
 * USE IT:
 * 		1.Set skin, initalize:
 * 			$("#abc").mcSkin3D();
 * 			$("#abc").mcSkin3D({skinSrc:"your skin url",cloakSrc:"",canvasWidth:120px.canvasHeight:120px,option:{true,true,true}});
 * 		2.If you want to set the model's action:
 * 			$("#abc").mcSkin3D.setOption({ratate:true,still:false,run:false});
 * 			$("#abc").mcSkin3D().setOption({ratate:true,still:false,run:false});
 * 		3.You can also toggle the action:
 * 			$("#abc").mcSkin3D.rotateToggle();
 * v1.5.0:
 * 		添加角色控制（前进，后退，左转，右转 和 跳跃）。添加 control 参数来设定控制功能是否被开启。
 * 		添加一个方法用于切换人物的可控制状态：controlToggle.
 * v1.4.1:
 *		调整皮肤的加载机制，如下调用将隐藏披风：
 *			$("#abc").mcSkin3D.setCloak(null);
 * v1.4:
 * 		添加三个方法，用于3D人物的动作切换：
 * 			1.	rotateToggle,
 * 			2.	stillToggle,
 * 			3.	runToggle.
 * v1.3:
 * 		1.	将方法修改为任意jquery对象都可调用，而非局限于#skinviewer的dom对象。
 * 		2.	添加默认皮肤。即在没有传入skinSrc时显示默认的皮肤（没有披风）。
 */

(function ($) {
    jQuery.fn.mcSkin3D = function (skinSrc, cloakSrc, canvasWidth, canvasHeight, option) {
        /*
         全局变量
         */
        var skinViewer = $(this);
        var defSkinSrc = "./defaultskin.png";
        //默认二进制皮肤数据
        var defBackgroundSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNS8xMS8xM0kr5ukAAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzbovLKMAAADJUlEQVQ4jTXB227bdADA4Z8PieM4ds6HJunSdAvdWoFUoBqCCw5XiCtegHfYDdfsrRBCmsQkEBKt0Aaj7ViPSdO0jRM3sR3Hsf3niu+Tnv34jfig/imvRr/iO0sANEPFtQOyBY2CVSSIfPx5QBIlSIpEu9bh1R9vqD2ykCUk9s9/wUwXsEo5CmULd7Kk2ioRzFcML0eU9QbNShs9r/H00ZdcT/qU2gYiFqiWVuIuGHF5NiCtqyhpGS2rEoQLjJKGoir4KxddNWiaG/x+/ALXXpI2VHY3PkRpfpR7rqRkNCOFWcyBIjAMA/tqhm6luR95+J7HInEJxQLkhHRWpdPq8vfRa+TeThcRC7qNHs7tjJbVpZptoltpmuYGezuf4U1DfCekkKnQKnbxnZDBzQW5Sgbp+5++FQLB8N2Yx9s9zi7OKDZMhBCklQxTe4pR0PFnAdEyZjFfYVYyqJpCSlNRel/UnueLFo16g7E7QsulmI99EiG4H8+RZIkojNju7JK38kS6z1ppnYiQVRgim9UMk/GEIPKJljEiEYRBTKPcRE0r5CsmD9tb/HP+J8enh4hYsIwW2EOHtcID1Hq+javf08h1MNMFZEnBtQ/RUwaVepmasU6wconCBLOq4ztL5imH5oMGb/99i+oEY6Y3M1rWQwaTcxBQXisQJxGjwR2TzATNTJGrZKjn2gxXl3QKjzm9e4OsSsiqnKLRqnHhHFEvNAnmK9atHlfTC/L1LHu9z5lcelSNJqcX75AkOO6/RtMyGEUN2b6dkNfKzCYuiUgo1i3+OjlASckEbsjR+IByJ8f1pE+4iNis7rD0Vtz1p0Rhgrzb+4Rb74oojLmxr5ElGb2QxneWePYSb+4jhCCJBZIsYfvXdLtd4pXAMLPI+4e/UcxUCWYr0lmVm0ubTEonXiV89fRrqqUasizTrnZY69SQkBjeDniyvUXdaCP98OI7kYiYB/ktXh78zO77eywjnxuvjxACZ+hRapkAeM6CTnMTN7zHuZ8yuw2Qr64HeKsZ+ycvyRY1ZoGNvRjxv1wlw5Pqx4z7MzrNTc76J7jBjCQWdN5r8h+OlXn5pQZ/mwAAAABJRU5ErkJggg==';
        /*需要用到的方法 Start*/
        this.toString = function () {
            return 'mcSkin3D';
        };
        var createMaterial = function (canvas, isAlpha) { //通过传入画布对象和[是否透明]来创建材质对象
            /*
             *	canvas —— 传入的画布对象，用其上的图像数据作为材质
             * isAlpha —— 用于判断时候创建一个透明材质
             */
            var material = new THREE.MeshBasicMaterial({
                map: new THREE.Texture(canvas, new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter, (isAlpha ? THREE.RGBAFormat : THREE.RGBFormat)),
                transparent: isAlpha,
                opacity:1,
                // ambient: 0x808080,
                side:THREE.DoubleSide,
                overdraw:true
            });
            material.map.needsUpdate = true;
            material.depthWrite  = true;
            return material;
        };
        var setPlaneVertexInRectangle = function (Geometry, planeIndex, x, y, width, height, index) { //设置给定几何体的一个平面的顶点集合
            var widthwiseScale = 1 / 64;
            var portraitScale = 1 / 64;
            /*
             * widthwiseScale —— 皮肤源文件的横向缩放比
             * portraitScale —— 皮肤源文件的纵向缩放比
             * geometry —— 需要设置平面顶点阵列的几何体
             * planeIndex —— 要为该几何体设定平面顶点阵列的索引，即哪一个平面。
             *	x —— 第一个顶点（左上角）在材质上的横坐标
             * 	y —— 第一个顶点（左上角）在材质上的纵坐标
             * width —— 平面的宽度
             * height —— 平面的高度
             * index —— 当选要旋转阵列时设定该参数
             */
            // if (!index) { //如果阵列不需要旋转，即index为undefined时，初始化为0
            //     index = 0;
            // }

            // console.log(planeIndex);
            //三角1
            var triangle1 = Geometry.geometry.faceVertexUvs[0][2 * planeIndex];
            //左上
            triangle1[0].x = x * widthwiseScale;
            triangle1[0].y = (y + height) * portraitScale;
            // console.log(triangle1[0].x,triangle1[0].y);
            //左下
            triangle1[1].x = x * widthwiseScale;
            triangle1[1].y = y * portraitScale;
            // console.log(triangle1[1].x,triangle1[1].y);
            //右上
            triangle1[2].x = (x + width) * widthwiseScale;
            triangle1[2].y = (y + height) * portraitScale;
            // console.log(triangle1[2].x,triangle1[2].y);

            //三角2
            var triangle2 = Geometry.geometry.faceVertexUvs[0][2 * planeIndex + 1];
            //左下
            triangle2[0].x = x * widthwiseScale;
            triangle2[0].y = y * portraitScale;
            // console.log(triangle2[0].x,triangle2[0].y);
            //右下
            triangle2[1].x = (x + width) * widthwiseScale;
            triangle2[1].y = y * portraitScale;
            // console.log(triangle2[1].x,triangle2[1].y);
            //右上
            triangle2[2].x = (x + width) * widthwiseScale;
            triangle2[2].y = (y + height) * portraitScale;
            // console.log(triangle2[0].x,triangle2[0].y);
        };

        /*需要用到的方法 End*/
        window.requestAnimFrame = (function () { //设置动画计时器
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame ||
                // if all else fails, use setTimeout
                function (callback) {
                    return window.setTimeout(callback, 1000 / 60);
                    // shoot for 60 fps
                };
        })();

        function initRenderer(isCreateWebGLRenderingContext, sceneWidth, sceneHeight) { //初始化渲染器对象
            if (isCreateWebGLRenderingContext) {
                var renderer = new THREE.WebGLRenderer({ //如果渲染对象创建成功，创建WebGL渲染器，设置抗锯齿为TRUE
                    antialias: true, //设置是否抗锯齿
                    alpha:true
                })
            } else {
                var renderer = new THREE.CanvasRenderer({ //如果渲染对象没有创建，创建Canvas渲染器，设置抗锯齿为TRUE
                    antialias: true
                })
            }
            renderer.shadowMapEnabled = true;
            renderer.sortObjects = false;
            return renderer;
        } //创建渲染器对象-End

        function initCamera() { //初始化摄像机
            var camera = new THREE.PerspectiveCamera(35, def.canvasWidth / def.canvasHeight, 1, 1000);
            //创建透视投影摄像机	PerspectiveCamera( fov, aspect, near, far )
            camera.position.set(0, 0, 50);
            camera.lookAt({ //设置摄像机中心点
                x: 0,
                y: 1,
                z: 0
            });
            camera.up.set(0, 1, 0);
            //设置摄像机的3轴朝向
            return camera;
        }

        var initLeftLeg = function (skinMaterial) { //初始化左腿 Start
                var leftLegGeometry = new THREE.CubeGeometry(4, 12, 4);
                //创建左腿的几何体对象
                for (var i = 0; i < 8; ++i) { //将腿立方体的8个顶点向下平移8个单位
                    leftLegGeometry.vertices[i].y -= 6;
                }
                var leftLeg = new THREE.Mesh(leftLegGeometry, skinMaterial);
                //创建左腿的网格渲染对象
                leftLeg.position.z = -2;
                setPlaneVertexInRectangle(leftLeg, 0, 20, 0, 4, 12);
                setPlaneVertexInRectangle(leftLeg, 1, 28, 0, 4, 12);
                setPlaneVertexInRectangle(leftLeg, 2, 20, 12, 4, 4);
                setPlaneVertexInRectangle(leftLeg, 3, 24, 12, 4, 4);
                setPlaneVertexInRectangle(leftLeg, 4, 16, 0, 4, 12);
                setPlaneVertexInRectangle(leftLeg, 5, 24, 0, 4, 12);
                //left left’s front, back, top, foot, right and left
                leftLeg.castShadow = true;
                leftLeg.rotation=Math.PI/2;
                var leftLeg3D = new THREE.Object3D();
                leftLeg3D.add(leftLeg);
                leftLeg3D.position.y = -6;
                return leftLeg3D;
            } //初始化左腿 End
        var initRightLeg = function (skinMaterial) { //初始化右腿 Start
                var rightLegGeometry = new THREE.CubeGeometry(4, 12, 4);
                //创建右腿的几何体对象
                for (var i = 0; i < 8; ++i) { //将腿立方体的8个顶点向下平移8个单位
                    rightLegGeometry.vertices[i].y -= 6;
                }
                var rightLeg = new THREE.Mesh(rightLegGeometry, skinMaterial);
                //创建左右腿的网格渲染对象
                rightLeg.position.z = 2;
                setPlaneVertexInRectangle(rightLeg, 0, 4, 32, 4, 12);
                setPlaneVertexInRectangle(rightLeg, 1, 12, 32, 4, 12);
                setPlaneVertexInRectangle(rightLeg, 2, 4, 44, 4, 4);
                setPlaneVertexInRectangle(rightLeg, 3, 8, 44, 4, 4);
                setPlaneVertexInRectangle(rightLeg, 4, 0, 32, 4, 12);
                setPlaneVertexInRectangle(rightLeg, 5, 8, 32, 4, 12);
                //right left’s front, back, top, foot, right and left
                rightLeg.castShadow = true;
                var rightLeg3D = new THREE.Object3D();
                rightLeg3D.add(rightLeg);
                rightLeg3D.position.y = -6;
                return rightLeg3D;
            } //初始化右腿 End
        var initBody = function (skinMaterial) { //初始化身体 Start
                var bodyGeometry = new THREE.CubeGeometry(4, 12, 8);
                var body = new THREE.Mesh(bodyGeometry, skinMaterial);
                setPlaneVertexInRectangle(body, 0, 20, 32, 8, 12);
                setPlaneVertexInRectangle(body, 1, 32, 32, 8, 12);
                setPlaneVertexInRectangle(body, 2, 20, 44, 8, 4);
                setPlaneVertexInRectangle(body, 3, 28, 44, 8, 4);
                setPlaneVertexInRectangle(body, 4, 16, 32, 4, 12);
                setPlaneVertexInRectangle(body, 5, 28, 32, 4, 12);
                //body's front, back, top, bottom, right and left
                body.castShadow = true;
                return body;
            } //初始化身体 End
        var initBodyOverLayer = function (skinMaterial) { //初始化身体 Start
                var bodyOverLayerGeometry = new THREE.CubeGeometry(5, 13, 9);
                var bodyOverLayer = new THREE.Mesh(bodyOverLayerGeometry, skinMaterial);
                headOverLayer.doubleSided = true;
                setPlaneVertexInRectangle(bodyOverLayer, 0, 20, 16, 8, 12);
                setPlaneVertexInRectangle(bodyOverLayer, 1, 32, 16, 8, 12);
                setPlaneVertexInRectangle(bodyOverLayer, 2, 20, 28, 8, 4);
                setPlaneVertexInRectangle(bodyOverLayer, 3, 28, 28, 8, 4);
                setPlaneVertexInRectangle(bodyOverLayer, 4, 16, 16, 4, 12);
                setPlaneVertexInRectangle(bodyOverLayer, 5, 28, 16, 4, 12);
                //bodyOverLayer's front, back, top, bottom, right and left
                bodyOverLayer.castShadow = true;
                return bodyOverLayer;
            } //初始化身体 End
        var initLeftArm = function (skinMaterial) { //初始化左手臂 Start
                var leftArmGeometry = new THREE.CubeGeometry(4, 12, 4);
                for (var i = 0; i < 8; ++i) { //将手臂立方体的8个顶点向下平移8个单位
                    leftArmGeometry.vertices[i].y -= 4;
                }
                var leftArm = new THREE.Mesh(leftArmGeometry, skinMaterial);
                leftArm.position.z = -6;
                setPlaneVertexInRectangle(leftArm, 0, 36, 0, 4, 12);
                setPlaneVertexInRectangle(leftArm, 1, 44, 20, 4, 12);
                setPlaneVertexInRectangle(leftArm, 2, 36, 12, 4, 4);
                setPlaneVertexInRectangle(leftArm, 3, 40, 12, 4, 4);
                setPlaneVertexInRectangle(leftArm, 4, 40, 0, 4, 12);
                setPlaneVertexInRectangle(leftArm, 5, 32, 0, 4, 12);
                //left arm’s front, back, top, foot, right and left
                leftArm.castShadow = true;
                var leftArm3D = new THREE.Object3D();
                leftArm3D.add(leftArm);
                leftArm3D.position.y = 4;
                return leftArm3D;
            } //初始化左手臂 End
        var initRightArm = function (skinMaterial) { //初始化手右臂 Start
                var rightArmGeometry = new THREE.CubeGeometry(4, 12, 4);
                for (var i = 0; i < 8; ++i) { //将手臂立方体的8个顶点向下平移8个单位
                    rightArmGeometry.vertices[i].y -= 4
                }
                var rightArm = new THREE.Mesh(rightArmGeometry, skinMaterial);
                rightArm.position.z = 6;
                setPlaneVertexInRectangle(rightArm, 0, 44, 20, 4, 12);
                setPlaneVertexInRectangle(rightArm, 1, 52, 20, 4, 12);
                setPlaneVertexInRectangle(rightArm, 2, 44, 16, 4, 4, 1);
                setPlaneVertexInRectangle(rightArm, 3, 48, 16, 4, 4, 3);
                setPlaneVertexInRectangle(rightArm, 4, 40, 20, 4, 12);
                setPlaneVertexInRectangle(rightArm, 5, 48, 20, 4, 12);
                //right arm’s front, back, top, foot, right and left
                rightArm.castShadow = true;
                var rightArm3D = new THREE.Object3D();
                rightArm3D.add(rightArm);
                rightArm3D.position.y = 4;
                return rightArm3D;
            } //初始化右手臂 End
        var initHead = function (skinMaterial) { //初始化头 Start
                var headGeometry = new THREE.CubeGeometry(8, 8, 8);
                var head = new THREE.Mesh(headGeometry, skinMaterial);
                head.position.y = 10;
                setPlaneVertexInRectangle(head, 0, 8, 48, 8, 8);
                setPlaneVertexInRectangle(head, 1, 24, 48, 8, 8);
                setPlaneVertexInRectangle(head, 2, 8, 56, 8, 8, 1);
                setPlaneVertexInRectangle(head, 3, 16, 56, 8, 8, 3);
                setPlaneVertexInRectangle(head, 4, 0, 48, 8, 8);
                setPlaneVertexInRectangle(head, 5, 16, 48, 8, 8);
                //head's front, back, top, bottom, right and left
                head.castShadow = true;
                return head;
            } //初始化头 End
        var initHeadOverLayer = function (headOverLayerMaterial) { //初始化头覆盖层 Start
                var headOverLayerGeometry = new THREE.CubeGeometry(9, 9, 9);
                var headOverLayer = new THREE.Mesh(headOverLayerGeometry, headOverLayerMaterial);
                headOverLayer.doubleSided = true;
                headOverLayer.position.y = 10;
                setPlaneVertexInRectangle(headOverLayer, 0, 40, 48, 8, 8);
                setPlaneVertexInRectangle(headOverLayer, 1, 56, 48, 8, 8);
                setPlaneVertexInRectangle(headOverLayer, 2, 40, 56, 8, 8);
                setPlaneVertexInRectangle(headOverLayer, 3, 48, 56, 8, 8);
                setPlaneVertexInRectangle(headOverLayer, 4, 32, 48, 8, 8);
                setPlaneVertexInRectangle(headOverLayer, 5, 48, 48, 8, 8);
                //head over layer's front, back, top, bottom, right and left
                headOverLayer.castShadow = true;
                return headOverLayer;
            } //初始化头覆盖层 End
        var initCloak = function (cloakMaterial) { //初始化披风 Start
                var cloakGeometry = new THREE.CubeGeometry(1, 16, 10);
                var cloak = new THREE.Mesh(cloakGeometry, cloakMaterial);
                cloak.position.y = -8;
                cloak.visible = false;
                setPlaneVertexInRectangle(cloak, 0, 12, 1, 10, 16);
                setPlaneVertexInRectangle(cloak, 1, 1, 1, 10, 16);
                setPlaneVertexInRectangle(cloak, 2, 1, 0, 10, 1);
                setPlaneVertexInRectangle(cloak, 3, 11, 0, 10, 1, 1);
                setPlaneVertexInRectangle(cloak, 4, 0, 1, 1, 16);
                setPlaneVertexInRectangle(cloak, 5, 11, 1, 1, 16);
                cloak.castShadow = true;
                return cloak;
            } //初始化披风 End
        var initBackground = function (backgroundMaterial) { //初始化地面 Start
                var backgroundGeometry = new THREE.PlaneGeometry(1000, 1000, 40, 40);
                //PlaneGeometry( width, height, widthSegments, heightSegments )
                var background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
                // var background = new THREE.Mesh ( backgroundGeometry , new THREE.MeshBasicMaterial ( {
                // color : 0x33004E ,
                // wireframe : true
                // } ) );
                backgroundMaterial.map.wrapS = backgroundMaterial.map.wrapT = THREE.RepeatWrapping;
                background.position.y = -14.5;
                background.visible = true;
                background.receiveShadow = true;
                return background;
            } //初始化地面 End
            //参数和动画主体
        var def = { //初始化缺省参数
            skinSrc: defSkinSrc, //皮肤文件路径 —— 允许用户覆盖
            cloakSrc: "", //披风文件路径 —— 允许用户覆盖
            canvasWidth: document.body.offsetWidth , //canvas画布宽度 —— 允许用户覆盖
            canvasHeight: window.screen.height , //canvas画布高度 —— 允许用户覆盖
            skinFileWidth: 32, //skin源文件宽度
            skinFileHeight: 64, //skin源文件高度
            cloakFileWidth: 10, //cloak源文件宽度
            cloakFileHeight: 16, //cloak源文件高度
            option: { //设置数组
                rotate: true, //控制旋转状态 —— 允许用户更改
                still: false, //控制静止状态 —— 允许用户更改
                run: false, //控制跑动状态 —— 允许用户更改
                control: false, //控制角色控制状态——允许用户更改
            }
        }
        jQuery.extend(true, def, skinSrc, canvasWidth, canvasHeight, option);
        //skinViewer 为 dom 对象
        var isCreateWebGLRenderingContext = !!window.WebGLRenderingContext && (!!window.document.createElement("canvas").getContext("experimental-webgl") || !!window.document.createElement("canvas").getContext("webgl"));
        //isCreateWebGLRenderingContext —— 储存画布是否创建成功
        var renderer = new initRenderer(isCreateWebGLRenderingContext, scene, camera, def.canvasWidth, def.canvasHeight);
        //初始化渲染器
        renderer.setSize(def.canvasWidth, def.canvasHeight);
        //设置渲染器大小 —— 和 canvas 同大小
        renderer.setClearColor(0xaaccff, 1);
        //设置渲染器的清除色
        var rendererDom = renderer.domElement;
        var rendererDomEnviroment = rendererDom.getContext("2d");
        skinViewer.append(rendererDom);
        //将渲染器加入html中

        var scene = new THREE.Scene();
        var camera = new initCamera();
        scene.add(camera);
        // scene.add ( plane_mesh );
        scene.fog = new THREE.FogExp2(0xaaccff, 0.003);
        // // 创建点光源
        // var pointLight = new THREE.SpotLight(0xffffff, 1, 0, Math.PI, 1);
        // pointLight.castShadow = true;
        // pointLight.shadowCameraNear = 1;
        // pointLight.shadowCameraFar = 1000000;
        // pointLight.shadowCameraFov = 100;
        // // 设置光源位置
        // pointLight.position.x = 30;
        // pointLight.position.y = 100;
        // pointLight.position.z = 10;

        // scene.add(pointLight);
        // light2 = new THREE.AmbientLight(0xFFFFFF);
        // scene.add(light2);
        //从画板获得皮肤绘制环境
        var skinFileMaterialCanvas = window.document.createElement("canvas");
        var skinDrawEnviroment = skinFileMaterialCanvas.getContext("2d");
        //传入皮肤文件的尺寸 == 皮肤材质画板的尺寸
        skinFileMaterialCanvas.width = def.skinFileWidth;
        skinFileMaterialCanvas.height = def.skinFileHeight;
        //从画板获得披风绘制环境
        var cloakFileMaterialCanvas = window.document.createElement("canvas");
        var cloakDrawEnviroment = cloakFileMaterialCanvas.getContext("2d");
        //传入披风文件的尺寸 == 披风材质画板的尺寸
        cloakFileMaterialCanvas.width = def.cloakFileWidth;
        cloakFileMaterialCanvas.height = def.cloakFileHeight;
        //从画板获得地面绘制环境
        var backgroundMaterialCanvas = window.document.createElement("canvas");
        var backgroundDrawEnviroment = backgroundMaterialCanvas.getContext("2d");
        backgroundMaterialCanvas.width = 16;
        backgroundMaterialCanvas.height = 16;
        var skinMaterial = createMaterial(skinFileMaterialCanvas, false);
        var alphaMaterial = createMaterial(skinFileMaterialCanvas, true);
        var cloakMaterial = createMaterial(cloakFileMaterialCanvas, true);
        var backgroundMaterial = createMaterial(backgroundMaterialCanvas, true);
        backgroundMaterial.map.wrapS = backgroundMaterial.map.wrapT = THREE.RepeatWrapping;
        backgroundMaterial.map.repeat.set(40, 40);
        backgroundMaterial.map.side = THREE.DoubleSide;
        backgroundMaterial.map.doubleSided = true
            //用于载入的渲染材质
            //初始化人物 Start
        var human3D = new THREE.Object3D();
        var head = new initHead(skinMaterial);
        var headOverLayer = new initHeadOverLayer(alphaMaterial);
        headOverLayer.doubleSided = true;
        var body = new initBody(skinMaterial);
        var bodyOverLayer = new initBodyOverLayer(alphaMaterial);
        var leftArm = new initLeftArm(skinMaterial);
        leftArm.rotation.z = -armRotateZ;
        var rightArm = new initRightArm(skinMaterial);
        var leftLeg = new initLeftLeg(skinMaterial);
        var rightLeg = new initRightLeg(skinMaterial);
        var cloak = new initCloak(cloakMaterial);
        var cloak3D = new THREE.Object3D();
        cloak3D.add(cloak);
        cloak3D.position.x = -2;
        cloak3D.position.y = 6;
        human3D.add(head);
        human3D.add(headOverLayer);
        // human3D.add(body);
        human3D.add(bodyOverLayer);
        // human3D.add(leftArm);
        // human3D.add(rightArm);
        human3D.add(leftLeg);
        human3D.add(rightLeg);
        // human3D.add(cloak3D);
        human3D.position.y = 3.5;
        human3D.castShadow = true;
        //初始化人物 End
        var background = new initBackground(backgroundMaterial);
        scene.add(human3D);
        // scene.add(background);
        var skinFile = new Image();
        skinFile.src = def.skinSrc;
        var cloakFile = new Image();
        // cloakFile.src = cloakSrc;
        var background = new Image();
        background.src = defBackgroundSrc;
        def.skinFileWidth = skinFile.width;
        def.skinFileHeight = skinFile.height;
        //第一次载入皮肤文件，避免因皮肤容量太大而读不到皮肤尺寸
        def.cloakFileWidth = cloakFile.width;
        def.cloakFileHeight = cloakFile.height;
        //第一次载入披风文件，避免因披风文件容量太大而读不到披风尺寸
        //更新覆盖动画参数
        skinFile.onload = function () {
            def.skinFileWidth = skinFile.width;
            def.skinFileHeight = skinFile.height;
            skinFileMaterialCanvas.width = def.skinFileWidth;
            skinFileMaterialCanvas.height = def.skinFileHeight;
            skinDrawEnviroment.clearRect(0, 0, def.skinFileWidth, def.skinFileHeight);
            skinDrawEnviroment.drawImage(skinFile, 0, 0);
            skinMaterial.map.needsUpdate = true;
            alphaMaterial.map.needsUpdate = true;
            cloakMaterial.map.needsUpdate = true;
        }
        skinFile.onerror = function () {
            skinFile.src = defSkinSrc;
        }
        cloakFile.onload = function () {
            def.cloakFileWidth = cloakFile.width;
            def.cloakFileHeight = cloakFile.height;
            cloakFileMaterialCanvas.width = def.cloakFileWidth;
            cloakFileMaterialCanvas.height = def.cloakFileHeight;
            cloakDrawEnviroment.clearRect(0, 0, def.cloakFileWidth, def.cloakFileHeight);
            cloakDrawEnviroment.drawImage(cloakFile, 0, 0);
            skinMaterial.map.needsUpdate = true;
            alphaMaterial.map.needsUpdate = true;
            cloakMaterial.map.needsUpdate = true;
            cloak.visible = true;
        }
        cloakFile.onerror = function () {
            cloak.visible = false;
        };
        background.onload = function () {
            backgroundMaterialCanvas.width = 16;
            backgroundMaterialCanvas.height = 16;
            backgroundDrawEnviroment.clearRect(0, 0, 16, 16);
            backgroundDrawEnviroment.drawImage(background, 0, 0);
            skinMaterial.map.needsUpdate = true;
            alphaMaterial.map.needsUpdate = true;
            cloakMaterial.map.needsUpdate = true;
            backgroundMaterial.map.needsUpdate = true;
        }
        background.onerror = function () {
            console.log('background error');
        }
        renderer.render(scene, camera);
        var mouseX = 0;
        var mouseY = 0.1;
        //用于限制鼠标拖动时视角的回归幅度
        var originMouseX = 0;
        var originMouseY = 0;
        var rad = 0;
        //摄像机旋转弧度
        var time = 0;
        var jumpTimer = 0;
        var restTime = 0;
        //每次动作结束剩余时间，不为零表示当前动画没有结束
        var isYfreezed = false;
        //表示摄像机Y轴方向是否回归，true->不会归，false->回归
        var frequency = 3.91;
        //人物手脚摆动频率
        var isRotate = def.option.rotate;
        var isStill = def.option.still;
        var isRun = def.option.run;
        var isContril = def.option.control;
        var isRunToWalk = false;
        var isWalkToRun = false;
        var isOnload = false;
        var armRotateZ;
        //手臂旋转弧度
        var legRotateZ;
        //退部旋转弧度
        //鼠标控制变量
        var mousedown = false;
        //记录鼠标按下的状态
        //键盘控制变量
        var keyWdown = false;
        var keySdown = false;
        var keyAdown = false;
        var keyDdown = false;
        var keySpacedown = false;
        var jumpIsEnd = true;
        //标记跳跃动作是否结束\
        var pos_max = def.canvasWidth;
        var pos_min = -def.canvasWidth;
        var animate = function () {
            requestAnimFrame(animate, renderer.domElement);

            if (!mousedown) {
                if (!isYfreezed) {
                    // mouseY *= 0.97;
                    //越接近1回归速度越慢
                }
                if (isRotate) {
                    rad += 2;
                    //帧旋转速率
                }
            } else {
                rad = mouseX;
            }
            // if (mouseY > 500) {
            //     mouseY = 500;
            // } else {
            //     if (mouseY < -500) {
            //         mouseY = -500;
            //     }
            // }
            camera.position.x = -Math.cos(rad / (def.canvasWidth / 2) + (Math.PI / 0.9));
            camera.position.z = -Math.sin(rad / (def.canvasWidth / 2) + (Math.PI / 0.9));
            camera.position.y = (mouseY / (def.canvasHeight)) * 1.5;
            camera.position.setLength(100);
            camera.lookAt(new THREE.Vector3(0, 1.5, 0));
            var i = isContril ? time / 20 : time / 80;
            //default:20
            if (!isStill) { //still
                var armRotateZ = (Math.PI / 2) * Math.cos(i * frequency + Math.PI / 2);
                var legRotateZ = Math.cos(i * frequency + Math.PI / 2);
                if (isContril) {
                    if (keyWdown || keySdown || keyAdown || keyDdown) //当有方向键被按下，开始动画
                        ++time;
                    else if (time != 0 && time % (2 * Math.PI) != 0) { //当动画未结束
                        var rest = (time % (Math.PI / 2));
                        if (restTime == 0) //判断上一个动画是否结束
                            restTime = time + Math.floor((Math.PI / 2 - rest));
                        if (Math.abs(armRotateZ) < Math.PI / 18) {
                            time = 0;
                            restTime = 0;
                        } else
                            ++time;
                    }
                } else
                    ++time;
                head.rotation.y = Math.sin(i * 1.5) / 5;
                headOverLayer.rotation.y = Math.sin(i * 1.5) / 5;
                head.rotation.z = Math.sin(i) / 6;
                headOverLayer.rotation.z = Math.sin(i) / 6;
                if (isRun) {
                    var armRotateZ = 0.6662 * i * 10;
                    var armRotateX = Math.cos(0.2812 * i * 10);
                    rightArm.rotation.z = 2 * Math.cos(armRotateZ + Math.PI);
                    rightArm.rotation.x = 1 * (armRotateX - 1);
                    leftArm.rotation.z = 2 * Math.cos(armRotateZ);
                    leftArm.rotation.x = 1 * (armRotateX + 1);
                    rightLeg.rotation.z = 1.4 * Math.cos(0.6662 * i * 10);
                    leftLeg.rotation.z = 1.4 * Math.cos(0.6662 * i * 10 + Math.PI);
                    human3D.position.y = 3.5 + 1 * Math.cos(0.6662 * i * 10 * 2);
                    human3D.position.z = 0.15 * Math.cos(0.6662 * i * 10);
                    human3D.rotation.x = 0.01 * Math.cos(0.6662 * i * 10 + Math.PI);
                    cloak3D.rotation.z = -(0.1 * Math.sin(0.6662 * i * 10 * 2) + Math.PI / 2.5);
                    //披风
                } else {
                    // var armRotateZ = Math.cos ( i * frequency + Math.PI / 2 );
                    // leftArm.rotation.z = -armRotateZ;
                    // rightArm.rotation.z = armRotateZ;
                    // leftLeg.rotation.z = legRotateZ;
                    // rightLeg.rotation.z = -legRotateZ;
                    // cloak3D.rotation.z = -(Math.sin(i) / 15 + Math.PI / 15);
                    // if (isContril) {
                    //     if (keyWdown ^ keySdown) { //W 和 S沒有同时按下
                    //         if (keyWdown) {
                    //             if (human3D.position.x >= 100 && human3D.position.z >= 100) {
                    //                 human3D.position.x = 100 * Math.cos(-human3D.rotation.y);
                    //                 human3D.position.z = 100 * Math.sin(-human3D.rotation.y);
                    //             } else {
                    //                 human3D.position.x += 1.5 * Math.cos(-human3D.rotation.y);
                    //                 human3D.position.z += 1.5 * Math.sin(-human3D.rotation.y);
                    //             }
                    //         } else if (keySdown)
                    //             if (human3D.position.x <= -100 && human3D.position.z <= -100) {
                    //                 human3D.position.x = -100 * Math.cos(-human3D.rotation.y);
                    //                 human3D.position.z = -100 * Math.sin(-human3D.rotation.y);
                    //             } else {
                    //                 human3D.position.x -= 1.5 * Math.cos(-human3D.rotation.y);
                    //                 human3D.position.z -= 1.5 * Math.sin(-human3D.rotation.y);
                    //             }
                    //     }
                    //     if (keyAdown ^ keyDdown) { //A 和 D没有同时按下
                    //         if (keyAdown) {
                    //             human3D.rotation.y += Math.PI / 90;
                    //             leftArm.rotation.y = rightArm.rotation.y = leftLeg.rotation.y = rightLeg.rotation.y = body.rotation.y = (body.rotation.y >= Math.PI / 9) ? (Math.PI / 9) : (body.rotation.y + Math.cos(1 * Math.PI / 40));
                    //         } else if (keyDdown) {
                    //             human3D.rotation.y -= Math.PI / 90;
                    //             leftArm.rotation.y = rightArm.rotation.y = leftLeg.rotation.y = rightLeg.rotation.y = body.rotation.y = (body.rotation.y <= -Math.PI / 9) ? (-Math.PI / 9) : (body.rotation.y - Math.cos(1 * Math.PI / 40));
                    //         }
                    //     } else {
                    //         rightArm.rotation.y = leftArm.rotation.y = leftLeg.rotation.y = rightLeg.rotation.y = body.rotation.y = body.rotation.y / (i / 4 + 1);
                    //     }
                    //     if (keySpacedown || !jumpIsEnd) {
                    //         ++jumpTimer;
                    //         if (jumpTimer == 0) {
                    //             jumpIsEnd = true;
                    //         } else if (jumpIsEnd == false && human3D.position.y <= 4.5) {
                    //             jumpIsEnd = true;
                    //             jumpTimer = 0;
                    //             human3D.position.y = 3.5;
                    //         } else {
                    //             jumpIsEnd = false;
                    //             human3D.position.y = human3D.position.y - Math.pow(jumpTimer, 2) / 150 + 2;
                    //             //跳跃动画
                    //         }
                    //     }
                    // }
                }
            }
            renderer.render(scene, camera);
        };

        var getMousePosition = function (i) {
            if (mousedown) {
                mouseX = (i.pageX - rendererDom.offsetLeft - originMouseX);
                mouseY = (i.pageY - rendererDom.offsetTop - originMouseY);
            }
        }
        rendererDom.addEventListener("mousedown", function (i) {
            i.preventDefault();
            originMouseX = (i.pageX - rendererDom.offsetLeft) - rad;
            originMouseY = (i.pageY - rendererDom.offsetTop) - mouseY;
            mousedown = true;
            getMousePosition(i);
        }, false);
        rendererDom.addEventListener("mouseout", function (i) {
            // mousedown = false;
        }, false);
        window.addEventListener("mouseup", function (i) {
            mousedown = false;
        }, false);
        window.addEventListener("mousemove", getMousePosition, false);
        /*
         拖拽事件
         */
        rendererDom.addEventListener("dragenter", function (i) {
            i.stopPropagation();
            i.preventDefault();
            l.className = "dragenter";
        }, false);
        rendererDom.addEventListener("dragleave", function (i) {
            i.stopPropagation();
            i.preventDefault();
            l.className = "";
        }, false);
        rendererDom.addEventListener("dragover", function (i) {
            i.stopPropagation();
            i.preventDefault();
        }, false);
        /*
         键盘事件
         */
        document.onkeydown = function (e) {
            var keycode = e.which ? e.which : e.keyCode;
            if (keycode == 87 || keycode == 38)
                keyWdown = true;
            else if (keycode == 83 || keycode == 40)
                keySdown = true;
            else if (keycode == 65 || keycode == 37)
                keyAdown = true;
            else if (keycode == 68 || keycode == 39)
                keyDdown = true;
            else if (keycode == 32)
                keySpacedown = true;
        };
        document.onkeyup = function (e) {
            var keycode = e.which ? e.which : e.keyCode;
            if (keycode == 87 || keycode == 38)
                keyWdown = false;
            else if (keycode == 83 || keycode == 40)
                keySdown = false;
            else if (keycode == 65 || keycode == 37)
                keyAdown = false;
            else if (keycode == 68 || keycode == 39)
                keyDdown = false;
            else if (keycode == 32)
                keySpacedown = false;
        };
        animate();
        window.addEventListener('resize', onWindowResize, false);

        function onWindowResize() {
            camera.aspect = skinViewer.width() / skinViewer.height();
            camera.updateProjectionMatrix();
            renderer.setSize(skinViewer.width(), skinViewer.height());
        }

        //对外接口 Start
        this.mcSkin3D.setSkin = this.setSkin = function (reSrc) { //载入皮肤
            var skinImg = new Image();
            skinImg.src = reSrc;
            skinImg.onload = function () {
                skinFile.src = skinImg.src;
                def.skinFileWidth = (skinFile.width == 1024) ? 1025 : skinFile.width;
                def.skinFileHeight = skinFile.height;
                skinFileMaterialCanvas.width = def.skinFileWidth;
                skinFileMaterialCanvas.height = def.skinFileHeight;
                skinDrawEnviroment.clearRect(0, 0, def.skinFileWidth, def.skinFileWidth);
                skinDrawEnviroment.drawImage(skinFile, 0, 0, def.skinFileWidth, def.skinFileWidth);
                skinMaterial.map.needsUpdate = true;
                headOverLayerMaterial.map.needsUpdate = true;
                cloakMaterial.map.needsUpdate = true;
            }
            return this;
        }
        this.mcSkin3D.setCloak = this.setCloak = function (reSrc) { //载入披风
            if (reSrc == undefined) {
                cloak.visible = false;
                return this;
            }
            var cloakImg = new Image();
            cloakFile.src = reSrc;
            cloakImg.onload = function () {
                cloakFile.src = cloakImg.src;
                cloakFile.onload();
            }
            cloakImg.onerror = function () {
                cloak.visible = false;
            };
            return this;
        }
        this.mcSkin3D.setOption = this.setOption = function (rotate, still, run) { //设置模型运动状态
            jQuery.extend(true, def.option, rotate, still, run);
            isRotate = def.option.rotate;
            isStill = def.option.still;
            isRun = def.option.run;
            return this;
        }
        this.mcSkin3D.setSize = this.setSize = function (canvasWidth, canvasHeight) { //设置canvas尺寸
            jQuery.extend(true, def, canvasWidth, canvasHeight);
            camera.aspect = (canvasWidth / canvasHeight);
            camera.updateProjectionMatrix();
            renderer.setSize(canvasWidth, canvasHeight);
            return this;
        }
        this.mcSkin3D.rotateToggle = this.rotateToggle = function () {
            isRotate = def.option.rotate = (isRotate) ? false : true;
            return this;
        }
        this.mcSkin3D.stillToggle = this.stillToggle = function () {
            isStill = def.option.still = (isStill) ? false : true;
            return this;
        }
        this.mcSkin3D.runToggle = this.runToggle = function () {
            isRun = def.option.run = (isRun) ? false : true;
            return this;
        }
        this.mcSkin3D.controlToggle = this.controlToggle = function () {
                isContril = def.option.control = (isContril) ? false : true;
                return this;
            }
            //对外接口 End
        return this;
    }
})(jQuery);
