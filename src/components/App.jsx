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
      </div>
    </>
  );
};

export default ModelViewer;
