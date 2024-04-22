import * as THREE from "three";

export function vec3(v: THREE.Vec2): THREE.Vector3 {
  return new THREE.Vector3(v.x, v.y, 0);
}
