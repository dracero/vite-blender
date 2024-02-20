import React, { useRef, useState } from "react";
import * as THREE from "three";
import { useGLTF, OrbitControls, PerspectiveCamera, OrthographicCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { PlaneObject } from "../objects/PlaneObject";
import { addDatListener } from "./DatGUI";
import { RulerObject } from "../objects/RulerObject";

export const PlaneCanvas = (props) => {
  const perspectiveCamRef = useRef();
  const orthoCamRef = useRef();
  const [show2d, setShow2d] = useState(false);
  const perspControlsRef = useRef();
  const orthoControlsRef = useRef();

  const { set: setThree, scene } = useThree();

  const plane = (window.plane = new PlaneObject());

  const axes = new THREE.AxesHelper(50);
  axes.material.depthTest = false;
  axes.renderOrder = 1;

  addDatListener("datgui-2D", (ev) => {
    const ortho = ev.value;
    setShow2d(ortho);
    if (ortho) setThree({ camera: orthoCamRef.current });
    else setThree({ camera: perspectiveCamRef.current });
  });

  useFrame(() => {
    plane.update();
  });

  return (
    <>
      {/* Main scene */}
      <primitive object={plane} />

      {/* Light */}
      <ambientLight intensity={0.7} />
      <spotLight position={[50, 30, 10]} angle={0.7} penumbra={1} />
      <pointLight position={[-1, -1, -1]} />

      {/* Some stuff */}
      <gridHelper args={[50, 50]} position={[15, 0, 0]} />
      <primitive object={axes} />

      <PerspectiveCamera ref={perspectiveCamRef} makeDefault position={[15, 15, 30]} enabled={!show2d} />
      <OrthographicCamera ref={orthoCamRef} position={[0, 0, 15]} zoom={40} enableRotate={false} enabled={show2d} />

      <OrbitControls ref={perspControlsRef} camera={perspectiveCamRef.current} enabled={!show2d} />
      <OrbitControls ref={orthoControlsRef} camera={orthoCamRef.current} enableRotate={false} enabled={show2d} />
    </>
  );
};
