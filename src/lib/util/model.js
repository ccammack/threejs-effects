// @ts-nocheck
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { Box3 } from "three";

const merge = (object) => {
  // merge object geometry and recalculate the verts to put the origin at the bottom-center
  object.updateMatrixWorld(true);
  const geometry = [];
  object.traverse((c) => {
    if (c.isMesh) {
      let g = c.geometry;
      g.applyMatrix4(c.matrixWorld);
      for (const key in g.attributes) {
        if (key !== "position" && key !== "normal") {
          g.deleteAttribute(key);
        }
      }
      geometry.push(g.toNonIndexed());
    }
  });
  const mergedGeometries = BufferGeometryUtils.mergeBufferGeometries(
    geometry,
    false
  );
  const mergedGeometry = BufferGeometryUtils.mergeVertices(mergedGeometries);
  mergedGeometry.center();
  mergedGeometry.computeBoundingBox();
  const height =
    mergedGeometry.boundingBox.max.y - mergedGeometry.boundingBox.min.y;
  const m = new THREE.Matrix4().makeTranslation(0, height / 2, 0);
  mergedGeometry.applyMatrix4(m);
  mergedGeometry.normalizeNormals();
  const mesh = new THREE.Mesh(
    mergedGeometry,
    new THREE.MeshBasicMaterial({ color: 0xff10f0 })
  );
  const group = new THREE.Group();
  group.add(mesh);
  return group;
};

export default function LoadModel(uri) {
  return new Promise((res, rej) => {
    if (!uri) {
      rej("Invalid URL");
      return;
    }

    const loader = new GLTFLoader();
    loader.load(
      uri,
      function (gltf) {
        // prepare the new object
        let loaded = gltf.scene;
        let merged = merge(loaded.clone());

        // test model
        // const geometry = new THREE.IcosahedronGeometry();
        // const material = new THREE.MeshNormalMaterial();
        // loaded = new THREE.Mesh(geometry, material);
        // merged = merge(loaded.clone());
        // test model

        // generate bounding box
        const box = new Box3().setFromObject(merged);

        res({ merged, box });
      },
      (xhr) => {
        // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        rej(error);
      }
    );
  });
}

// export default function LoadModel(uri) {
//   return new Promise((res, rej) => {
//     const geometry = new THREE.IcosahedronGeometry();
//     const material = new THREE.MeshNormalMaterial();
//     const loaded = new THREE.Mesh(geometry, material);
//     res(loaded);
//   });
// }
