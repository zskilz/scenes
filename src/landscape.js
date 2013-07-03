define(['image!img/sand.jpg'], function(bg) {

  var geometry, material, mesh, twopi = Math.PI * 2;


  var _export = {
    init: function(scene) {


      var geometry, material, mesh;

      var l = 40000,
        d = 40;

      geometry = new THREE.PlaneGeometry(l, l, d - 1, d - 1);


      //build the geometry

      for (var _x, _y, v, i = 0; v = geometry.vertices[i]; i++) {
        _x = ((i % d) / d) * 2.0 - 1;
        _y = ((~~ (i / d)) / d) * 2.0 - 1;
        v.z = (Math.cos(_x * twopi) + Math.cos(_y * twopi)) * (-400);
      }

      var texture = new THREE.Texture(bg);
      texture.magFilter = THREE.LinearMipMapLinearFilter;
      texture.minFilter = THREE.LinearMipMapNearestFilter;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(10,10);
      texture.needsUpdate = true;

      material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: texture
        //wireframe: true
      });

      geometry.computeFaceNormals();
      geometry.computeVertexNormals();
      geometry.computeTangents();

      mesh = new THREE.Mesh(geometry, material);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      mesh.position.y = -500;
      mesh.rotation.x = -Math.PI / 2;
      scene.add(mesh);

    }
  };
  return _export;
});