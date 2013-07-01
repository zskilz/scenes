/*
TODO:
tweening,
sand texture,
dynamic clouds,
dynamic water,
DOF,


*/

define(['landscape', 'water', 'clouds', 'fxstuff', 'tweenstuff'], function(landscape, water, clouds, fxstuff, tweenstuff) {

  var camera, scene, mainGUI, secondaryGUI, transitionGUI;

  var mouseX = 0,
    mouseY = 0;
  var start_time = Date.now();

  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2;

  var zV = new THREE.Vector3();

  var keyMap = {};

  function addVector3ToGui(gui, vec) {
    gui.add(vec, 'x').listen().__precision = 5;
    gui.add(vec, 'y').listen().__precision = 5;
    gui.add(vec, 'z').listen().__precision = 5;
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
    lightGUI.add(light, 'intensity', 0, 2);

    //lightGUI.add(light,'color');

    scene.add(light);

    landscape.init(scene, mainGUI);
    water.init(scene, mainGUI);
    clouds.init(scene, mainGUI);
  }

  function setupGUI() {
    // local storage..
    if (typeof(localStorage) === undefined) return console.log('Sorry, localStorage only.');

    // gui JSON
    var mainGUIJSON = (typeof(localStorage['mainGUI']) === 'undefined') ? {
      preset: 'Default',
      remembered: {
        'Default': {}
      }
    } : JSON.parse(localStorage['mainGUI']);

    mainGUI = mg = new dat.GUI({
      name: 'mainGUI',
      load: mainGUIJSON
    });
    secondaryGUI = new dat.GUI({
      name: 'transitionGUI'
    });
    var fns = {
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
        var conf = confirm("Overwrite old save?");

        if (conf == true) {
          //just overwrite for main GUI presets...
          localStorage['mainGUI'] = JSON.stringify(mainGUI.getSaveObject());
          //just overwrite for transitions.
          tweenstuff.save();

          queFns.save();
        }
      }
    }

    secondaryGUI.add(fns, 'reset').name('Reset it all');
    secondaryGUI.add(fns, 'save').name('Save it all');
    transitionGUI = secondaryGUI.addFolder('Transitions');

    var tweenList = [];

    function updateTweenList() {
      tweenList = [];
      $.each(tweenstuff.Tweenz, function(k, v) {
        tweenList.push(v.name);
      });
    }


    var queGUI = secondaryGUI.addFolder('Que');
    var queList = $('<ul id="quequeList">').sortable();
    var queFns = {
      addQueItem: function(tween) {
        var queItem = $('<li>');
        var selectTweenz = $('<select>');

        var playBtn = $('<button>').html('>').addClass('playBtn');
        playBtn.click(function() {
          queList.find('li').removeClass('quequed');
          queItem.addClass('quequed');
          $(tweenstuff.Tweenz).each(function(k, v) {
            if (v.name == selectTweenz.val()) v.start();
          })

        })
        queItem.append(playBtn);

        queItem.append(selectTweenz)
        updateTweenList();
        for (var i in tweenList) {
          selectTweenz.append('<option>' + tweenList[i] + '</option>');
        }
        selectTweenz.val(tween);
        var deleteBtn = $('<button>').html('X');
        deleteBtn.click(function() {
          queItem.remove();
        })
        queItem.append(deleteBtn);

        queList.append(queItem);
      },
      save: function() {
        var Quesave = [];
        queList.find('select').each(function(k, v) {
          Quesave.push(v.value);

        });
        localStorage['Ques'] = JSON.stringify(Quesave);
      }

    }
    queGUI.add(queFns, 'addQueItem').name('Add Que Item');

    $(queGUI.__ul).append(queList);

    //load saved ques
    return function() {
      var Ques = (typeof(localStorage['Ques']) === 'undefined') ? [] : JSON.parse(localStorage['Ques']);
      for (var i in Ques) {
        queFns.addQueItem(Ques[i]);
      }
    }
  }

  function init() {

    var loadQues = setupGUI();
    //something to hold it all...
    var container = $('<div/>')[0];
    $('body').append(container);

    // Bg gradient
    initBG(container);
    // the scene
    initScene();
    // postprocessing
    fxstuff.initEffects(container, scene, camera, mainGUI);
    //tweens
    tweenstuff.initTweenz(transitionGUI, mainGUI);
    loadQues();
    //events
    $(container).on('mousemove', onDocumentMouseMove);

    $(container).on('mousedown', onMouseDown);
    $(container).on('mouseup', onMouseUp);
    $(container).on('contextmenu', function(event) {

      event.preventDefault();
      event.stopPropagation();
    });
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
    event.stopPropagation();
  }

  function onMouseUp(event) {
    mouseDown = false;

    event.preventDefault();
    event.stopPropagation();

  }

  function onKeyDown(event) {
    keyMap[event.keyCode] = true;
    // console.log("pressed: " + event.keyCode);
  }

  function onKeyUp(event) {
    keyMap[event.keyCode] = false;
  }



  function onDocumentMouseMove(event) {

    mouseX = (event.clientX - windowHalfX) / windowHalfX;
    mouseY = -(event.clientY - windowHalfY) / windowHalfY;

  }


  //=====================================================================================
  // keyboard  
  //=====================================================================================
  var actionKeys = {

    left: 68,
    right: 65,
    forward: 83,
    backward: 87,
    up: 81,
    down: 90,
    fine: 16,
    que: 32

  };

  function processInput(dt) {
    //cammera movement.
    var v = new THREE.Vector3;
    var fine = keyMap[actionKeys.fine];
    // translation
    v.x = keyMap[actionKeys.left] ? 1.0 : keyMap[actionKeys.right] ? -1.0 : 0.0;
    v.y = keyMap[actionKeys.up] ? 1.0 : keyMap[actionKeys.down] ? -1.0 : 0.0;
    v.z = keyMap[actionKeys.forward] ? 1.0 : keyMap[actionKeys.backward] ? -1.0 : 0.0;

    v.applyEuler(camera.rotation);

    camera.position.add(v.multiplyScalar((fine ? 100 : 1000) * dt));

    //que goes here...
    if (keyMap[actionKeys.que]) {
      tweenstuff.queNext();
    }

    // mouse rotation
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

    processInput(dt);
    clouds.render(dt);
    water.render(dt, t);

    fxstuff.render();
    //renderer.render(scene, camera);
    timeLord = t;

    TWEEN.update();
  };

  //=====================================================================================
  // export
  //=====================================================================================
  return {
    init: init
  }
});