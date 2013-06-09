define(['landscape', 'water', 'clouds', 'dat.gui'], function(landscape, water, clouds) {

  var camera, scene, renderer;
  var mainGUI = new dat.GUI({
    name: 'mainGUI'
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

  function init() {


    // Bg gradient
    var container = $('<div/>')[0];
    $('body').append(container);

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

    scene = new THREE.Scene();

    var light = new THREE.DirectionalLight({
      color: '#ffae23'
    });
    light.position.set(1000, 1000, 0);
    light.lookAt(new THREE.Vector3(zV));
    light.rotation.z = Math.PI / 2;
    //light.castShadow = true;

    var lightGUI = mainGUI.addFolder('light');

    mainGUI.remember(light);
    lightGUI.add(light, 'intensity', 0, 1);

    //lightGUI.add(light,'color');

    scene.add(light);

    landscape.init(scene, mainGUI);
    clouds.init(scene, mainGUI);
    water.init(scene, mainGUI);

    renderer = new THREE.WebGLRenderer({
      antialias: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    $(window).on('resize', onWindowResize);
    $(document).on('mousemove', onDocumentMouseMove);
    
    $(container).on('mousedown', onMouseDown);
    $(container).on('mouseup', onMouseUp);
    $(document).on('keydown', onKeyDown);
    $(document).on('keyup', onKeyUp);

    animate();

  }
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

  }

  function onDocumentMouseMove(event) {

    mouseX = (event.clientX - windowHalfX) / windowHalfX;
    mouseY = -(event.clientY - windowHalfY) / windowHalfY;

    ($('#status').html(mouseX + ":" + mouseY))

  }

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


  var timeLord = (new Date()).getTime() / 1000;

  function animate() {

    // note: three.js includes requestAnimationFrame shim
    requestAnimationFrame(animate);

    var t = (new Date()).getTime() / 1000;
    var dt = t - timeLord;

    processKeys(dt);



    renderer.render(scene, camera);

    timeLord = t;


  };


  return {
    init: init
  }
});