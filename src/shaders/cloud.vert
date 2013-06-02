// Taken from www.mrdoob.com/lab/javascript/webgl/clouds/
varying vec2 vUv;

void main() {

  vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}