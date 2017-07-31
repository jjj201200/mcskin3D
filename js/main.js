/*
 * @Author: jjj201200@gmail.com 
 * @Date: 2017-07-31 14:26:19 
 * @Last Modified by: jjj201200@gmail.com
 * @Last Modified time: 2017-07-31 17:28:41
 */

require.config({
    baseUrl: './js',
    paths: {
        '@lib/domReady': './libs/domReady',
        '@lib/jQuery': './libs/jquery-1.9.0',
        '@lib/THREE': './libs/three',
        '@lib/TWEEN': './libs/tween.min',
        '@lib/CSG': './libs/csg',
        '@lib/ThreeBSP': './libs/ThreeBSP',
        '@lib/dat': './libs/dat.gui',
        '@lib/stats': './libs/stats',
        '@lib/i18n': './libs/i18n',
        '@lib/OrbitControls': './libs/OrbitControls',
        '@lib/SimplifyModifier': './libs/SimplifyModifier',
        '@lib/SubdivisionModifier': './libs/SubdivisionModifier',

        '@core/Common': './core/common',
        '@core/SkinCraft': './core/skinCraft',
        '@core/Renderer': './core/renderer',
        '@core/Material': './core/model/material',
        '@core/Model': './core/model/model',
        '@core/ModelManager': './core/model/modelManager',
        '@core/Part': './core/model/part',
        '@core/PartManager': './core/model/partManager',
        '@core/Pose': './core/model/pose',
        '@core/Animation': './core/model/animation',
        '@core/Material': './core/model/material',
        '@core/MaterialManager': './core/model/materialManager',
        '@core/layer': './core/model/layer',
        '@core/Face': './core/model/face',
        '@core/Cube': './core/model/units/cube',

        '@model/': './models/steve',
        '@model/Chicken': './models/chicken',
        // 'GuiController': './GuiController',
    },
    shim: {
        '@lib/jQuery':{
            exports:'$'
        },
        '@lib/THREE': {
            exports: 'THREE'
        },
        '@lib/ThreeBSP': {
            deps: ['@lib/THREE'],
            exports: 'ThreeBSP'
        },
        '@lib/CSG': {
            exports: 'CSG'
        },
        '@lib/TWEEN': {
            deps: ['@lib/THREE'],
            exports: 'TWEEN'
        },
        '@lib/OrbitControls': {
            deps: ['@lib/THREE'],
            exports: 'OrbitControls'
        },
        '@lib/SimplifyModifier': {
            deps: ['@lib/THREE'],
            exports: 'SimplifyModifier'
        },
        '@lib/SubdivisionModifier': {
            deps: ['@lib/THREE'],
            exports: 'SubdivisionModifier'
        },
        '@lib/dat': {
            exports: 'dat'
        },
        '@lib/SkinCraft': {
            deps: [
                'require',
                '@lib/THREE',
                '@lib/jQuery',
                '@lib/TWEEN',
                '@lib/stats',
                '@lib/OrbitControls',
                '@lib/dat',
                '@lib/ThreeBSP',
                '@core/ModelManager'
            ]
        },
        '@core/Pose': {
            deps: [
                '@lib/THREE',
                '@lib/TWEEN',
                '@lib/jQuery'
            ]
        },
        '@model/Animation': {
            deps: ['@model/Pose']
        },
    }
});
require([
    '@lib/domReady',
    '@lib/jQuery',
    '@lib/THREE',
    '@core/SkinCraft'
], function (domReady, $, THREE, SkinCraft) {
    domReady(function (document) {
        let DOM = $(document);
        let skinCraft = new SkinCraft({
            domElement: $('#skin3D'),
            canvasWidth: DOM.width(),
            canvasHeight: DOM.height()
        });
        // skinCraft.addSkin('./chicken.png');
        // skinCraft.addSkin('./第二层头发.png');
    });
});

