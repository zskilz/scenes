define(['image!img/water.jpg'], function(waterImg) {

  var mesh, texture, geometry, material;

  var worldWidth = 128,
    worldDepth = 128,
    worldHalfWidth = worldWidth / 2,
    worldHalfDepth = worldDepth / 2;

  var settings = {
    roughness: 35.0,
    height: -1000.0
  }


  var _export = {
    init: function(scene, parentGUI) {

      geometry = new THREE.PlaneGeometry(20000, 20000, worldWidth - 1, worldDepth - 1);
      geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
      geometry.dynamic = true;

      var i, j, il, jl;

      for (i = 0, il = geometry.vertices.length; i < il; i++) {

        geometry.vertices[i].y = settings.roughness * Math.sin(i / 2);

      }


      //console.log( "triangles: " + geometry.faces.length * 2 + " faces: " + geometry.faces.length + " vertices: " + geometry.vertices.length );

      geometry.computeFaceNormals();
      geometry.computeVertexNormals();

      texture = new THREE.Texture(waterImg);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(5, 5);
      texture.needsUpdate = true;

      material = new THREE.MeshBasicMaterial({
        color: 0x0044ff,
        map: texture
      });

      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // setup GUI

      var gui = parentGUI.addFolder('water');

      parentGUI.remember(settings);
      gui.add(settings, "roughness", 0, 60);
      gui.add(settings, "height", - 1400, 100);

    },
    render: function(delta, time) {


      for (var i = 0, l = geometry.vertices.length; i < l; i++) {

        geometry.vertices[i].y = settings.roughness * Math.sin(i / 5 + ((time * 10.0) + i) / 7);

      }

      //geometry.computeFaceNormals();
      //geometry.computeVertexNormals();

      mesh.geometry.verticesNeedUpdate = true;
      //mesh.geometry.normalsNeedUpdate = true;
      mesh.position.y = settings.height;

    }
  };
  return _export;
});