import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Clock } from "../utils/Clock";
import { XRControllersManager } from "../xr/XRControllersManager";
import { XRManager } from "../xr/XRManager";

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
    const { scene, gl: renderer } = useThree();
    XRManager.init(renderer);

    w.scene = scene;
    w.THREE = THREE;
    w.renderer = renderer;
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
