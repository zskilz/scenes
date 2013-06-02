define(['landscape', 'water', 'clouds','dat.gui'], function(landscape, water, clouds) {

  var camera, scene, renderer;
  var mainGUI = new dat.GUI({name:'mainGUI'});


  var mouseX = 0,
    mouseY = 0;
  var start_time = Date.now();

  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2;

  //var bird;
  var zV = new THREE.Vector3();

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

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 100000);

    //camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.z = 8000;
    camera.lookAt(zV);

    scene = new THREE.Scene();

    var light = new THREE.DirectionalLight({
      color: '#ffae23'
    });
    light.position.set(1000,1000,0);
    light.lookAt(new THREE.Vector3(zV));
    light.rotation.z = Math.PI / 2;
    //light.castShadow = true;
    
    var lightGUI = mainGUI.addFolder('light');
    lightGUI.add(light,'intensity',0,1);
    //lightGUI.add(light,'color');

    scene.add(light);

    landscape.init(scene,mainGUI);
    clouds.init(scene,mainGUI);
    water.init(scene,mainGUI);

    renderer = new THREE.WebGLRenderer({
      antialias: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    $(window).on('resize', onWindowResize);
    $(document).on('mousemove', onDocumentMouseMove);

    animate();

  }

  function onWindowResize(event) {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    renderer.setSize(window.innerWidth, window.innerHeight);

  }

  function onDocumentMouseMove(event) {

    mouseX = (event.clientX - windowHalfX)/ windowHalfX;
    mouseY = -(event.clientY - windowHalfY)/ windowHalfY;
    
    ($('#status').html(mouseX+":"+mouseY))

  }

  function animate() {

    // note: three.js includes requestAnimationFrame shim
    requestAnimationFrame(animate);

    var t = (new Date()).getTime() / 1000;

    //camera.position.z = Math.sin(Math.PI * 2 * t / 15) * 10000;
    //camera.position.x = Math.cos(Math.PI * 2 * t / 25) * 10000;
    //camera.lookAt(zV);

    camera.position.x =  Math.sin(mouseX  * (Math.PI/4) )*8000;    
    camera.position.y += ( mouseY*windowHalfY - camera.position.y) * 0.05;
    camera.position.z =  Math.cos(mouseX  * (Math.PI/4) )*8000;
    camera.lookAt(zV);
   

    renderer.render(scene, camera);



  }


  return {
    init: init
  }
});