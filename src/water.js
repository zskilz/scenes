define(function() {

  var geometry, material, mesh;


  var _export = {
    init: function(scene, parentGUI) {

      var l = 20000;

      geometry = new THREE.PlaneGeometry(l, l);

      material = new THREE.MeshPhongMaterial({
        color: 0x0000ff,
        transparent: true,
        //wireframe: true
      });

      geometry.computeFaceNormals();
      geometry.computeVertexNormals();
      geometry.computeTangents();

      mesh = new THREE.Mesh(geometry, material);
      //mesh.receiveShadow = true;
      mesh.position.y = -1000;
      mesh.rotation.x = -Math.PI / 2;
      scene.add(mesh);

      // setup GUI
      
      var gui = parentGUI.addFolder('water');
      
      parentGUI.remember(mesh.position);
      gui.add(mesh.position, "y", - 1300, 100);
    }
  };
  return _export;
});