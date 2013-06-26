({
  baseUrl: 'src',

  shim: {
    jqueryui: ['jquery'],
    'postprocessing/EffectComposer': ['three'],
    'postprocessing/RenderPass': ['three'],
    'postprocessing/MaskPass': ['three'],
    'postprocessing/ShaderPass': ['three'],
    'postprocessing/SavePass': ['three'],
    scene: {
      deps: ['jquery', 'jqueryui', 'three', 'tween', 'postprocessing/EffectComposer', 'postprocessing/RenderPass', 'postprocessing/MaskPass', 'postprocessing/ShaderPass', 'postprocessing/SavePass', 'dat.gui']
    }
  },

  paths: {
    text: '../requirejs-plugins/lib/text',
    image: '../requirejs-plugins/src/image',
    'dat.gui': '../dat-gui/build/dat.gui.min',
    jquery: 'empty:',
    jqueryui: 'empty:',
    three: '../three.js/build/three.min',
    tween: '../tween.js/build/tween.min',
    postprocessing: '../three.js/examples/js/postprocessing',
    shaders: '../three.js/examples/js/shaders',
  },

  //optimize: 'none',

  name: 'scene',
  out: 'build/scenes.js',

  wrap: {
    start: "(function() {",
    end: " require(['scene'], function(scene) {   $(function() {  scene.init(); }); });  })();"
  },

})