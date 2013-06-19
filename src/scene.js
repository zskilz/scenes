/*
TODO:
tweening,
sand texture,
dynamic clouds,
dynamic water,
DOF,


*/

define(['landscape', 'water', 'clouds', 'shaders/CopyShader', 'shaders/BlendShader', 'shaders/EdgeShader', 'shaders/VignetteShader', 'shaders/SepiaShader'], function(landscape, water, clouds) {

  var camera, scene, renderer, composer;

  //setup local storage...
  if (typeof(localStorage) === undefined) return console.log('Sorry, localStorage only.');

  // first up the gui JSON

  var mainGUIJSON = (typeof(localStorage['mainGUI']) === 'undefined') ? {
    preset: 'Default',
    remembered: {
      'Default': {}
    }
  } : JSON.parse(localStorage['mainGUI']);

  var Tweenz = [], loadedTweenz = (typeof(localStorage['Tweenz']) === 'undefined') ? [] : JSON.parse(localStorage['Tweenz']);

  var mainGUI = mg = new dat.GUI({
    name: 'mainGUI',
    load: mainGUIJSON
  });

  var transitionGUI = new dat.GUI({
    name: 'transitionGUI',
  });

  //build TWEEN selects
  var easings = {};
  Object.keys(TWEEN.Easing).forEach(function(family) {
    Object.keys(TWEEN.Easing[family]).forEach(function(direction) {
      var name = family + '.' + direction;
      easings[name] = name;
    });
  });



  var mouseX = 0,
    mouseY = 0;
  var start_time = Date.now();

  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2;

  //var bird;
  var zV = new THREE.Vector3();

  var keyMap = {};



  function addVector3ToGui(gui, vec) {
    gui.add(vec, 'x').listen().__precision = 5;
    gui.add(vec, 'y').listen().__precision = 5;
    gui.add(vec, 'z').listen().__precision = 5;
  }

  function initEffectsGui(FX) {
    var EffectsGUI = mainGUI.addFolder('Effects');

    var EdgeGUI = EffectsGUI.addFolder('Edge');

    var edgeObj = {
      enabled: true,
      savePass: FX.savePass,
      edgeEffect: FX.edgeEffect,
      blend: FX.blend
    }
    mainGUI.remember(edgeObj);

    mainGUI.remember(edgeObj.blend.uniforms.mixRatio);
    mainGUI.remember(edgeObj.blend.uniforms.opacity);

    EdgeGUI.add(edgeObj, 'enabled').onFinishChange(function(value) {
      edgeObj.savePass.enabled = value;
      edgeObj.edgeEffect.enabled = value;
      edgeObj.blend.enabled = value;
    });;

    EdgeGUI.add(edgeObj.blend.uniforms.mixRatio, 'value', - 1, 1).name('mixratio');
    EdgeGUI.add(edgeObj.blend.uniforms.opacity, 'value', 0, 1).name('opacity');

    mainGUI.remember(FX.vignette);
    mainGUI.remember(FX.vignette.uniforms.offset);
    mainGUI.remember(FX.vignette.uniforms.darkness);

    var vignetteGUI = EffectsGUI.addFolder('Vignette');

    vignetteGUI.add(FX.vignette, 'enabled');
    vignetteGUI.add(FX.vignette.uniforms.offset, 'value', 0, 100).step(0.25).name('offset');
    vignetteGUI.add(FX.vignette.uniforms.darkness, 'value', 0, 1).name('darkness');

    mainGUI.remember(FX.sepia);
    mainGUI.remember(FX.sepia.uniforms.amount);

    var sepiaGUI = EffectsGUI.addFolder('Sepia');
    sepiaGUI.add(FX.sepia, 'enabled').name('Sepia');
    sepiaGUI.add(FX.sepia.uniforms.amount, 'value', - 1, 1).name('amount');

  }

  function initEffects() {
    renderer = new THREE.WebGLRenderer({
      antialias: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.setClearColor("#48b", 0);
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
    initEffectsGui(FX);
  }

  function initBG(container) {
    var canvas = $('<canvas/>')[0];
    canvas.width = 32;
    canvas.height = window.innerHeight;

    var context = canvas.getContext('2d');

    var gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#126");
    gradient.addColorStop(0.9, "#48b");

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    container.style.background = 'url(' + canvas.toDataURL('image/png') + ')';
    container.style.backgroundSize = '32px 100%';
  }


  function initScene() {
    // The camera
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 100000);

    //camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.z = 8000;
    camera.lookAt(zV);

    mainGUI.remember(camera.position);
    mainGUI.remember(camera.rotation);
    var cameraGUI = mainGUI.addFolder('camera');
    addVector3ToGui(cameraGUI, camera.position);
    addVector3ToGui(cameraGUI, camera.rotation);

    // the scene
    scene = new THREE.Scene();

    var light = new THREE.DirectionalLight({
      color: '#ffae23'
    });
    light.position.set(1000, 1000, 0);
    light.lookAt(zV);
    light.rotation.z = Math.PI / 2;
    //light.castShadow = true;

    var lightGUI = mainGUI.addFolder('light');

    mainGUI.remember(light);
    lightGUI.add(light, 'intensity', 0, 1);

    //lightGUI.add(light,'color');

    scene.add(light);

    landscape.init(scene, mainGUI);
    water.init(scene, mainGUI);
    clouds.init(scene, mainGUI);
  }




  function setupTween(current, target, obj, params, easing, doneTween) {

    var update = function() {
      $.each(current, function(k, v) {
        if (typeof(obj[k]) !== 'boolean') obj[k] = v;
      });
    };
    var tween = new TWEEN.Tween(current).to(target, params.duration * 1000.0).easing(easing).onUpdate(update).onComplete(doneTween);
    // start
    tween.start();
  }

  function setupTweenz(params) {
    // 
    var presets = (mainGUI.load).remembered;
    var currentSet = $.extend(true, {}, presets[params.from]);
    var targetSet = $.extend(true, {}, presets[params.to]);

    $(mainGUI.__preset_select).val(params.from);
    mainGUI.preset = params.from;

    // remove previous Tweenz if needed
    TWEEN.removeAll();

    // convert the string from dat-gui into tween.js functions 
    var easing = TWEEN.Easing[params.easing.split('.')[0]][params.easing.split('.')[1]];
    easing = (typeof(easing) === 'undefined') ? TWEEN.Easing.Linear.None : easing;
    // stuff to do when done..
    var done = false;

    function doneTween() {
      if (!done) {

        done = true;
        $(mainGUI.__preset_select).val(params.to);
        mainGUI.preset = params.to;
      }

    }
    // build the tween 
    for (var i in currentSet) {
      var current = currentSet[i];
      var target = targetSet[i];
      if (target) {
        var obj = mainGUI.__rememberedObjects[i];
        setupTween(current, target, obj, params, easing, doneTween);
      }
    }
  }


  function addTweenGUI(params) {
    var newTweenGUI = transitionGUI.addFolder(params.name);
    newTweenGUI.add(params, 'name').onFinishChange(function(value) {
      var oldName = params.name;
      params.name = value;
      addTweenGUI(params);

      delete transitionGUI.__folders[params.name];
      $(newTweenGUI.domElement).remove();
      delete newTweenGUI;

    });
    newTweenGUI.add(params, 'from', Object.keys((mainGUI.load).remembered));
    newTweenGUI.add(params, 'to', Object.keys((mainGUI.load).remembered));
    newTweenGUI.add(params, 'easing', easings);
    newTweenGUI.add(params, 'duration', 0, 120).step(0.01);
    newTweenGUI.add({
      start: function() {
        setupTweenz(params);
      }
    }, 'start');
    newTweenGUI.add({
      delete: function() {
        var conf = confirm("Are you sure you want to delete this transition?");
        if (conf == true) {
          Tweenz.splice(Tweenz.indexOf(params), 1);
          delete transitionGUI.__folders[params.name];
          $(newTweenGUI.domElement).remove();
          delete newTweenGUI;
        }
      }
    }, 'delete');
  }

  function addNewTween(params) {
    var newTweenParams = {
      name: 'new transition',
      from: 'Default',
      to: 'Default',
      easing: 'Linear',
      duration: 2.0
    };
    $.extend(newTweenParams, params);
    addTweenGUI(newTweenParams);
    Tweenz.push(newTweenParams);
  }


  function initTweenz() {
    //thing to snoop on transitions...?

    var fns = {
      add: addNewTween,
      reset: function() {
        var conf = confirm("Are you sure? <b>RESET</b> Everything?");

        if (conf == true) {
          var conf = confirm("... Everything? ...\n ... Really?");

          if (conf == true) {
            //bye bye EVERYTHING!
            localStorage.clear();
          }
        }
      },
      save: function() {
        //just overwrite for main GUI presets...
        localStorage['mainGUI'] = JSON.stringify(mainGUI.getSaveObject());
        //just overwrite for transitions.
        localStorage['Tweenz'] = JSON.stringify(Tweenz);
      }
    }

    transitionGUI.add(fns, 'add').name('Add a transition');

    transitionGUI.add(fns, 'reset').name('Reset it all');

    transitionGUI.add(fns, 'save').name('Save it all');


    //setup 'saved' transitions
    for (var i in loadedTweenz) addNewTween(loadedTweenz[i]);


  }

  function init() {

    var container = $('<div/>')[0];
    $('body').append(container);



    // Bg gradient
    initBG(container);
    // the scene
    initScene();

    // postprocessing
    initEffects();


    //tweens

    initTweenz();



    $(container).append(renderer.domElement);
    //events
    $(window).on('resize', onWindowResize);
    $(container).on('mousemove', onDocumentMouseMove);

    $(container).on('mousedown', onMouseDown);
    $(container).on('mouseup', onMouseUp);
    $(document).on('keydown', onKeyDown);
    $(document).on('keyup', onKeyUp);


    animate();

  }


  //=====================================================================================
  // Handlers  
  //=====================================================================================
  var mouseDown = false;

  function onMouseDown(event) {
    mouseDown = true;
    event.preventDefault();
  }

  function onMouseUp(event) {
    mouseDown = false;

    event.preventDefault();
  }

  function onKeyDown(event) {
    keyMap[event.keyCode] = true;
    // console.log("pressed: " + event.keyCode);
  }

  function onKeyUp(event) {
    keyMap[event.keyCode] = false;
  }

  function onWindowResize(event) {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    renderer.setSize(window.innerWidth, window.innerHeight);

    composer.setSize(window.innerWidth, window.innerHeight);

  }

  function onDocumentMouseMove(event) {

    mouseX = (event.clientX - windowHalfX) / windowHalfX;
    mouseY = -(event.clientY - windowHalfY) / windowHalfY;

    ($('#status ').html(mouseX + ":" + mouseY))

  }


  //=====================================================================================
  // keyboard  
  //=====================================================================================
  var cameraActions = {

    left: 68,
    right: 65,
    forward: 83,
    backward: 87,
    up: 81,
    down: 90,
    fine: 16

  };

  function processKeys(dt) {
    //cammera movement.
    var v = new THREE.Vector3;
    var fine = keyMap[cameraActions.fine];
    // translation
    v.x = keyMap[cameraActions.left] ? 1.0 : keyMap[cameraActions.right] ? -1.0 : 0.0;
    v.y = keyMap[cameraActions.up] ? 1.0 : keyMap[cameraActions.down] ? -1.0 : 0.0;
    v.z = keyMap[cameraActions.forward] ? 1.0 : keyMap[cameraActions.backward] ? -1.0 : 0.0;

    v.applyEuler(camera.rotation);

    camera.position.add(v.multiplyScalar((fine ? 100 : 1000) * dt));

    // rotation
    var lookAtPos = new THREE.Vector3(0, 0, - 1);
    lookAtPos.y = mouseDown ? mouseY / (fine ? 1000.0 : 100.0) : 0.0;
    lookAtPos.x = mouseDown ? mouseX / (fine ? 1000.0 : 100.0) : 0.0;

    lookAtPos.applyEuler(camera.rotation);
    lookAtPos.add(camera.position);

    camera.lookAt(lookAtPos);

  };


  //=====================================================================================
  // animation  
  //=====================================================================================
  var timeLord = (new Date()).getTime() / 1000;

  function animate() {

    // note: three.js includes requestAnimationFrame shim
    requestAnimationFrame(animate);

    var t = (new Date()).getTime() / 1000;
    var dt = t - timeLord;

    processKeys(dt);

    composer.render();
    //renderer.render(scene, camera);
    timeLord = t;

    TWEEN.update();
  };

  //=====================================================================================
  // exported AMD
  //=====================================================================================
  return {
    init: init
  }
});