require.config({
    baseUrl: './js',
    paths: {
        'domReady': './libs/domReady',
        'jquery': './libs/jquery-1.9.0',
        'THREE': './libs/three',
        'TWEEN': './libs/tween.min',
        'CSG': './libs/csg',
        'ThreeBSP': './libs/ThreeBSP',
        'dat': './libs/dat.gui',
        'stats': './libs/stats',
        'i18n': './libs/i18n',
        'THREE.OrbitControls': './libs/OrbitControls',
        'THREE.SimplifyModifier': './libs/SimplifyModifier',
        'THREE.SubdivisionModifier': './libs/SubdivisionModifier',
        'materials': './materials',
        'SkinCraft': './skinCraft',
        'SceneRenderer': './SceneRenderer',
        'GuiController': './GuiController',
        'Model': './model',
        'Pose': './pose',
        'Animation': './animation',
        'Face': './face',
        'model.Steve': './models/steve',
        'Queue': './queue',
        'Part': './part',
        'Common': './common',
        'Item': './item',
        'item.Skin': './items/skin',
        'item.Component': './items/component',
    },
    shim: {
        'THREE': {
            deps:[],
            exports: 'THREE'
        },
        'ThreeBSP': {
            deps:['THREE'],
            exports: 'ThreeBSP'
        },
        'CSG': {
            deps:[],
            exports: 'CSG'
        },
        'TWEEN':{
            deps:['THREE'],
            exports:'TWEEN'
        },
        'THREE.OrbitControls': {
            deps: ['THREE'],
            exports:'THREE.OrbitControls'
        },
        'THREE.SimplifyModifier': {
            deps: ['THREE'],
            exports:'THREE.SimplifyModifier'
        },
        'THREE.SubdivisionModifier': {
            deps: ['THREE'],
            exports:'THREE.SubdivisionModifier'
        },
        'SkinCraft': {
            deps: ['require', 'THREE', 'jquery', 'TWEEN', 'stats', 'THREE.OrbitControls', 'Model','dat','ThreeBSP']
        },
        'Pose':{
            deps:['THREE','TWEEN','jquery']
        },
        'Animation':{
            deps:['Pose']
        },
        'dat':{
            deps:[],
            exports:'dat'
        }
    }
});
require(['domReady', 'jquery', 'THREE', 'SkinCraft'], function (domReady, $, THREE, SkinCraft) {
    domReady(function (document) {
        let skinCraft = new SkinCraft({
            domElement: $('#skin3D'),
            canvasWidth:$(document).width(),
            canvasHeight:$(document).height()
        });
        skinCraft.addSkin('./第一层头发.png');
        // skinCraft.addSkin('./第二层头发.png');
    });
});
