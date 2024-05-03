import React from "react";
import { DatGUI } from "./DatGUI";
import { ThreeCanvas } from "./ThreeCanvas";
import { PlaneCanvas } from "./PlaneCanvas";

export const ModelViewer = () => {
  return (
    <>
      <div>
        <ThreeCanvas>
          <PlaneCanvas />
        </ThreeCanvas>

        <DatGUI />

        <div className="slider-container">
          <input id="time-slider" type="range" min="0" max="1" step="0.000001" />
        </div>
      </div>
    </>
  );
};

export default ModelViewer;
