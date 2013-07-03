define(['json!models/SHACK.js', 'json!models/castle.js'], function(shack, castle) {
  return {
    init: function(scene, gui) {
      var loader = new THREE.JSONLoader();
      var shackResult = loader.parse(shack);
      var castleResult = loader.parse(castle);
      var mesh;
      var shackMaterial = new THREE.MeshPhongMaterial({
        color: 0x555555,
        //map: texture
        //wireframe: true
      });


      mesh = new THREE.Mesh(shackResult.geometry, shackResult.materials[0]);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      mesh.scale.set(70, 70, 70);

      mesh.position.set(4700, - 1050, 50);

      mesh.rotation.set(0, - 0.3, 0);
      scene.add(mesh);

      var castleMaterial = new THREE.MeshPhongMaterial({
        color: 0x555555,
        //map: texture
        //wireframe: true
      });


      mesh = new THREE.Mesh(castleResult.geometry, castleResult.materials[0]);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      mesh.scale.set(170, 170, 170);

      mesh.position.set(-5500, - 900, 50);

      mesh.rotation.set(0, - 0.3, 0);
      scene.add(mesh);
    }
  }
})