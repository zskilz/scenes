define(['image!img/cloud.png', 'text!glsl/cloud.vert', 'text!glsl/cloud.frag'], function(cloud, vertexShader, fragmentShader) {

  var geometry, material, mesh;


  var _export = {

    init: function(scene) {

      // Taken from www.mrdoob.com/lab/javascript/webgl/clouds/
      geometry = new THREE.Geometry();

      var texture = new THREE.Texture(cloud);
      texture.magFilter = THREE.LinearMipMapLinearFilter;
      texture.minFilter = THREE.LinearMipMapNearestFilter;
      texture.needsUpdate = true;

      var fog = new THREE.Fog('#48b', - 100, 7000);

      material = new THREE.ShaderMaterial({

        uniforms: {
          "map": {
            type: "t",
            value: texture
          },
          "fogColor": {
            type: "c",
            value: fog.color
          },
          "fogNear": {
            type: "f",
            value: fog.near
          },
          "fogFar": {
            type: "f",
            value: fog.far
          },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        depthWrite: false,
        depthTest: false,
        transparent: true

      });

      var plane = new THREE.Mesh(new THREE.PlaneGeometry(64, 64));

      for (var i = 0; i < 8000; i++) {

        plane.position.x = Math.random() * 8000 - 4000;
        plane.position.y = -Math.random() * Math.random() * 200 - 15;
        plane.position.z = i;
        plane.rotation.z = Math.random() * Math.PI;
        plane.scale.x = plane.scale.y = Math.random() * Math.random() * 2.5 + 0.5;

        THREE.GeometryUtils.merge(geometry, plane);

      }

      mesh = new THREE.Mesh(geometry, material);
      //mesh.castShadow = true;
      mesh.position.y = 500;
      scene.add(mesh);
     // mesh = new THREE.Mesh(geometry, material);
     // mesh.position.z = -8000;
     // scene.add(mesh);

    }
  };
  return _export;
});