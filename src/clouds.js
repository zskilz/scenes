define(['image!img/cloud.png'], function(cloud, vertexShader, fragmentShader) {

  var _clouds;

  var settings = {
    scale: 1.0,
    height: 500.0,
    windspeed: 0.1,
    dispersion: 1.0
  }


  var _export = {

    init: function(scene, parentGUI) {

      var amount = 800;

      _clouds = new THREE.Object3D();

      var texture = new THREE.Texture(cloud);
      texture.magFilter = THREE.LinearMipMapLinearFilter;
      texture.minFilter = THREE.LinearMipMapNearestFilter;
      texture.needsUpdate = true;

      var cloudMaterial = new THREE.SpriteMaterial({
        map: texture,
        useScreenCoordinates: false,
        color: 0xffffff,
        // fog: true
      });

      for (var a = 0; a < amount; a++) {

        //var x = Math.random() * 8000 - 4000;
        //var y = -Math.random() * Math.random() * 200 - 15;
        //var z = Math.random() * 8000 - 4000;

        var x = (Math.random() - 0.5);
        var y = (Math.random() - 0.5) * 0.001;
        var z = (Math.random() - 0.5);

        //var material = cloudMaterial.clone();



        var sprite = new THREE.Sprite(cloudMaterial);

        sprite.position.set(x, y, z);
        sprite.rotation.z = Math.random() * Math.PI;

        sprite.__scale = Math.random() * Math.random() * 2.5 + 0.5;
        //sprite.position.normalize();
        sprite.position.multiplyScalar(5000);

        _clouds.add(sprite);

      }

      scene.add(_clouds);


      // setup GUI

      var gui = parentGUI.addFolder('clouds');

      parentGUI.remember(settings);
      gui.add(settings, "scale", 0, 4);
      gui.add(settings, "dispersion", 0, 5);
      gui.add(settings, "windspeed", 0, 300);
      gui.add(settings, "height", 0, 1500);

    
    },
    render: function(dt) {

      for (var c = 0; c < _clouds.children.length; c++) {

        var sprite = _clouds.children[c];
        var material = sprite.material;

        var imageWidth = 1;
        var imageHeight = 1;

        if (material.map && material.map.image && material.map.image.width) {

          imageWidth = material.map.image.width;
          imageHeight = material.map.image.height;

        }

        sprite.rotation += 0.001 * (c / _clouds.children.length);
        sprite.scale.set(sprite.__scale * settings.scale * imageWidth, sprite.__scale * settings.scale * imageHeight, 1.0);

        //material.opacity = Math.sin(time + sprite.position.x * 0.01) * 0.4 + 0.6;

      }

      _clouds.position.y = settings.height;
      _clouds.scale.set(settings.dispersion,settings.dispersion,settings.dispersion);
      _clouds.rotation.y += dt * (settings.windspeed / 1000);


    }
  };
  return _export;
});