import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ShapeBuilder } from "./components/ShapeBuilder";
import {
  BufferGeometryUtils,
  TransformControls,
} from "three/examples/jsm/Addons.js";
import { threeVecToCannon } from "./utils/vectorUtils";

export class ModelService {
  modelLoader: GLTFLoader;

  scene: THREE.Scene;
  world: CANNON.World;
  shapeBuilder: ShapeBuilder;

  transformControls: TransformControls;

  constructor(
    scene: THREE.Scene,
    world: CANNON.World,
    shapeBuilder: ShapeBuilder,
    transformControls: TransformControls
  ) {
    this.modelLoader = new GLTFLoader();

    this.scene = scene;
    this.world = world;
    this.shapeBuilder = shapeBuilder;

    this.transformControls = transformControls;
    this.bindKeyBinds();
  }

  createSingleMeshFromMany(meshes: THREE.Mesh[]) {
    // Extract geometries from mesh children
    const geometries = meshes.map((mesh) => mesh.geometry);
    const materials = meshes.map((mesh) =>
      Array.isArray(mesh.material)
        ? mesh.material.map((mat) => mat.clone())
        : mesh.material.clone()
    );

    // Merge geometries into a single buffer geometry
    const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);
    const singleMesh = new THREE.Mesh(mergedGeometry);

    // Fixes up mesh + texture
    let offset = 0;
    meshes.forEach((_mesh, index) => {
      singleMesh.geometry.groups.push({
        start: offset,
        count: geometries[index].index
          ? geometries[index].index.count
          : geometries[index].attributes.position.count,
        materialIndex: index,
      });
      offset += geometries[index].index
        ? geometries[index].index.count
        : geometries[index].attributes.position.count;
    });

    singleMesh.material = materials as THREE.Material[]; // Seems to be working doing it this way
    return singleMesh;
  }

  addModelToScene(
    pathToModel: string,
    startPos: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    scaleFactor: number = 1,
    withTransformControls: boolean = false
  ) {
    this.modelLoader.load(pathToModel, (gltf) => {
      const root = gltf.scene;

      // Create a single mesh object from the model
      let meshChildren: THREE.Mesh[] = [];
      root.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshChildren.push(child);
        }
      });

      const singleMesh = this.createSingleMeshFromMany(meshChildren);
      // Set position + scale + add to scene
      singleMesh.position.set(startPos.x, startPos.y, startPos.z);
      singleMesh.scale.multiplyScalar(scaleFactor);

      this.scene.add(singleMesh);

      // Create the physics body for the mesh
      if (singleMesh.geometry.index) {
        const positionAttributes = singleMesh.geometry.attributes
          .position as THREE.BufferAttribute;

        const vertices = [];

        // Apply scale factor
        const scaleMatrix = new CANNON.Mat3();
        scaleMatrix.elements = [
          scaleFactor,
          0,
          0,
          0,
          scaleFactor,
          0,
          0,
          0,
          scaleFactor,
        ];
        for (let i = 0; i < positionAttributes.count; i++) {
          const x = positionAttributes.getX(i);
          const y = positionAttributes.getY(i);
          const z = positionAttributes.getZ(i);
          const vertex = new CANNON.Vec3(x, y, z);
          scaleMatrix.vmult(vertex, vertex);
          vertices.push(vertex);
        }

        const indices = [];
        for (let i = 0; i < singleMesh.geometry.index.count; i += 3) {
          const a = singleMesh.geometry.index.getX(i);
          const b = singleMesh.geometry.index.getX(i + 1);
          const c = singleMesh.geometry.index.getX(i + 2);
          indices.push([a, b, c]);
        }

        const convexPolyhedronShape = new CANNON.ConvexPolyhedron({
          vertices: vertices,
          faces: indices,
        });
        convexPolyhedronShape.computeNormals(); // TODO: determine whether we want this

        const customMeshBody = new CANNON.Body({
          mass: 0,
          type: CANNON.Body.STATIC,
        });
        customMeshBody.addShape(convexPolyhedronShape);
        customMeshBody.position.copy(threeVecToCannon(singleMesh.position));

        this.world.addBody(customMeshBody);

        if (withTransformControls) {
          this.transformControls.attach(singleMesh);
          this.bindKeyBinds();
        }

        this.shapeBuilder.addModelToInstances(singleMesh, customMeshBody);
      } else {
        throw new Error("Could not find index on geometry object");
      }
    });
  }

  bindKeyBinds() {
    window.addEventListener("keydown", (event) => {
      if (event.key == "t") {
        this.transformControls.setMode("translate");
      }
      if (event.key == "r") {
        console.log("Rotate now");
        this.transformControls.setMode("rotate");
      }
      // TODO: Scaling requires the phsyics body to be scaled/re-calcualted
      // if (event.key == "q") {
      //   this.transformControls.setMode("scale");
      // }
    });
  }
}
