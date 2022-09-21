import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import GltfModel from "./gltf";

const ModelViewer = ({ modelPath, scale = 1, position = [10, -5, -5]}) => {
  const [action, setAction] = useState(false)
  const Noaction = () => {
    return <button onClick={()=>setAction(!action)}>
                 Click to RUN
          </button>
  }
  const Play = () => {
    return <button onClick={()=>setAction(!action)}>
                 Click to STOP
          </button>
  }

  return (
  <div className="wrapper"> 
  <div className="scene-wrapper"> 
     {action ? <Play /> : <Noaction />}
   <Canvas>
      <ambientLight intensity={0.3} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <Suspense fallback={null}>
        <GltfModel modelPath={modelPath} scale={scale} position={position} action={action}/>
        <OrbitControls />
      </Suspense>
    </Canvas>
   </div> 
  </div> 
  );
};

export default ModelViewer;