import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Clock } from "../utils/Clock";

export const ThreeCanvas = (props) => {
  Clock.start();

  function FrameLoop() {
    useFrame(() => {
      Clock.update();
    });
    return null;
  }

  function ThreeHook() {
    const w = window;
    const { scene } = useThree();
    w.scene = scene;
    w.THREE = THREE;
    return null;
  }

  return (
    <div className="wrapper">
      <div className="scene-wrapper" style={{ width: "100vw", height: "100vh" }}>
        <Canvas>
          <ThreeHook />
          <FrameLoop />

          {props.children}
        </Canvas>
      </div>
    </div>
  );
};
