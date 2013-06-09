define(function() {

  var geometry, material, mesh, twopi = Math.PI*2;


  var _export = {
    init: function(scene) {


      var geometry, material, mesh;

      var l = 20000,
        d = 20;

      geometry = new THREE.PlaneGeometry(l, l, d - 1, d - 1);


      //build the geometry

      for (var _x, _y, v, i = 0; v = geometry.vertices[i]; i++) {
        _x = (i % d)/d;
        _y = (~~(i / d))/d;
        v.z = (Math.cos(_x * twopi) + Math.cos(_y * twopi)) * 400;
      }

      material = new THREE.MeshPhongMaterial({
        color: 0xffaa44,
        //wireframe: true
      });

      geometry.computeFaceNormals();
      geometry.computeVertexNormals();
      geometry.computeTangents();

      mesh = new THREE.Mesh(geometry, material);
      //mesh.receiveShadow = true;
      mesh.position.y = -500;
      mesh.rotation.x = -Math.PI / 2;
      scene.add(mesh);

    }
  };
  return _export;
});