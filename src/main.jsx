import React from 'react'
import ReactDOM from 'react-dom/client'
import  ModelViewer from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ModelViewer modelPath={"/eje.glb"} />
  </React.StrictMode>
)
