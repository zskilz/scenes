require.config({
  //By default load any module IDs from js/lib
  baseUrl: 'src',

  shim: {
    'postprocessing/EffectComposer': ['three'],
    'postprocessing/RenderPass': ['three'],
    'postprocessing/MaskPass': ['three'],
    'postprocessing/ShaderPass': ['three'],
    'postprocessing/SavePass': ['three'],
    scene: {
      deps: ['three', 'tween', 'postprocessing/EffectComposer', 'postprocessing/RenderPass', 'postprocessing/MaskPass', 'postprocessing/ShaderPass', 'postprocessing/SavePass', 'dat.gui']
    }
  },

  paths: {
    text: '../requirejs-plugins/lib/text',
    image: '../requirejs-plugins/src/image',
    'dat.gui': '../dat-gui/build/dat.gui.min',
    jquery: '//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min',
    three: '../three.js/build/three.min', //.min'
    tween: '../tween.js/build/tween.min',
    postprocessing: '../three.js/examples/js/postprocessing',
    shaders: ['../three.js/examples/js/shaders'],
  },

});

// Start the main app logic.
require(['scene', 'jquery'], function(scene) {

  $(function() {
    scene.init();
  });

});