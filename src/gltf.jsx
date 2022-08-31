import React, { useRef, useState, useEffect } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useAnimations, useGLTF } from "@react-three/drei";

const GltfModel = ({ modelPath, scale = 1, position = [0, 0, 0], action }) => {
  const group = useRef();
  const gltf = useLoader(GLTFLoader, modelPath);
  const {  animations } = useGLTF("/eje.glb");
  const { actions } = useAnimations(animations, group);
  useEffect(() => {
    console.log(actions);
    if (action){
      actions.eje.paused=false
      actions.eje.play();
     } else  {
      actions.eje.paused=true;
     }
  })
   // Subscribe this component to the render-loop, rotate the mesh every frame
  //useFrame((state, delta) => (ref.current.rotation.y += 0.003));
  return (
    <>
     <primitive
        ref={group}
        object={gltf.scene}
        position={position}
      />
    </>
  );
};

export default GltfModel;