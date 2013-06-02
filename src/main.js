require.config({
  //By default load any module IDs from js/lib
  baseUrl: 'src',

  shim: {
    scene: {
      deps: ['three']
    }
  },

  paths: {
    jquery: '//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min',
    three: '../three.js/build/three.min',//.min'
  },

});

// Start the main app logic.
require(['scene', 'jquery'], function(scene) {

  $(function() {
    scene.init();
  });

});