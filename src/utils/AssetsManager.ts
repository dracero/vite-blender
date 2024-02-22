import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { last } from "./last";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const ExtensionLoaderMapper = {
  "typeface.json": FontLoader,
};

const assetPaths = {
  labelFont: "public/helvetiker.typeface.json",
};

type AssetName = keyof typeof assetPaths;

export namespace AssetsManager {
  export const loaded: { [key in AssetName]?: any } = {};

  export async function load(asset: AssetName) {
    const path = assetPaths[asset];

    return new Promise((resolve) => {
      const ext = last(path.split("."));
      const loader = fileToLoader(path);

      loader.load(path, (obj) => {
        loaded[asset] = obj;
        resolve(obj);
      });
    });
  }

  function fileToLoader(filepath: string): THREE.Loader {
    const loaders = Object.entries(ExtensionLoaderMapper);

    for (let [extension, loader] of loaders) {
      if (filepath.endsWith(extension)) return new loader();
    }

    throw new Error(`AssetsManager: filepath ${filepath} has no mapped extension`);
  }
}
