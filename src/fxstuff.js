define(['shaders/CopyShader', 'shaders/BlendShader', 'shaders/EdgeShader', 'shaders/VignetteShader', 'shaders/SepiaShader'], function() {

  var renderer, composer, camera;
  
  function onWindowResize(event) {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    renderer.setSize(window.innerWidth, window.innerHeight);

    composer.setSize(window.innerWidth, window.innerHeight);

  }


  function initEffectsGui(FX, gui) {
    var EffectsGUI = gui.addFolder('Effects');

    var EdgeGUI = EffectsGUI.addFolder('Edge');

    var edgeObj = {
      enabled: true,
      savePass: FX.savePass,
      edgeEffect: FX.edgeEffect,
      blend: FX.blend
    }
    gui.remember(edgeObj);

    gui.remember(edgeObj.blend.uniforms.mixRatio);
    gui.remember(edgeObj.blend.uniforms.opacity);

    EdgeGUI.add(edgeObj, 'enabled').onFinishChange(function(value) {
      edgeObj.savePass.enabled = value;
      edgeObj.edgeEffect.enabled = value;
      edgeObj.blend.enabled = value;
    });;

    EdgeGUI.add(edgeObj.blend.uniforms.mixRatio, 'value', - 1, 1).step(0.1).name('mixratio');
    EdgeGUI.add(edgeObj.blend.uniforms.opacity, 'value', 0, 1).step(0.1).name('opacity');

    gui.remember(FX.vignette);
    gui.remember(FX.vignette.uniforms.offset);
    gui.remember(FX.vignette.uniforms.darkness);

    var vignetteGUI = EffectsGUI.addFolder('Vignette');

    vignetteGUI.add(FX.vignette, 'enabled');
    vignetteGUI.add(FX.vignette.uniforms.offset, 'value', 0, 100).step(0.25).name('offset');
    vignetteGUI.add(FX.vignette.uniforms.darkness, 'value', 0, 1).step(0.1).name('darkness');

    gui.remember(FX.sepia);
    gui.remember(FX.sepia.uniforms.amount);

    var sepiaGUI = EffectsGUI.addFolder('Sepia');
    sepiaGUI.add(FX.sepia, 'enabled').name('Sepia');
    sepiaGUI.add(FX.sepia.uniforms.amount, 'value', - 1, 1).step(0.1).name('amount');

  }

  function initEffects(container, scene, _camera, gui) {
    camera = _camera;
    renderer = new THREE.WebGLRenderer({
      antialias: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.setClearColor("#48b", 1);

    // the FX
    var FX = {};

    FX.savePass = new THREE.SavePass();

    FX.edgeEffect = new THREE.ShaderPass(THREE.EdgeShader);
    FX.edgeEffect.uniforms['aspect'].value.x = window.innerWidth;
    FX.edgeEffect.uniforms['aspect'].value.y = window.innerHeight;

    FX.blend = new THREE.ShaderPass(THREE.BlendShader, "tDiffuse1");
    FX.blend.uniforms['tDiffuse2'].value = FX.savePass.renderTarget;
    FX.blend.uniforms['mixRatio'].value = 0.85;

    FX.vignette = new THREE.ShaderPass(THREE.VignetteShader);
    FX.vignette.uniforms['offset'].value.x = 1;
    FX.vignette.uniforms['darkness'].value.x = 1;

    FX.sepia = new THREE.ShaderPass(THREE.SepiaShader);
    FX.sepia.uniforms['amount'].value.x = 1;

    FX.final = new THREE.ShaderPass(THREE.CopyShader);
    FX.final.renderToScreen = true;

    //post-processing chain...

    composer = new THREE.EffectComposer(renderer);
    //render
    composer.addPass(new THREE.RenderPass(scene, camera));
    //save
    composer.addPass(FX.savePass);
    //edge effect
    composer.addPass(FX.edgeEffect);
    //blend edge to savepass
    composer.addPass(FX.blend);
    //sepia
    composer.addPass(FX.sepia);
    //vignette
    composer.addPass(FX.vignette);
    //copy to screen
    composer.addPass(FX.final);

    //GUI bindings for effects
    initEffectsGui(FX, gui);

    $(container).append(renderer.domElement);

    //events
    $(window).on('resize', onWindowResize);

  }



  var _export = {
    render: function() {
      composer.render();
    },
    initEffects: initEffects
  }


  return _export;



})