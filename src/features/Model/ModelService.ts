import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import {
  BufferGeometryUtils,
  TransformControls,
} from "three/examples/jsm/Addons.js";

import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { ShapeBuilder } from "./ShapeBuilder";
import { threeVecToCannon } from "../../utils/vectorUtils";

export class ModelService {
  modelLoader: GLTFLoader;

  createdMeshes: THREE.Mesh[] = [];
  selectedMesh: THREE.Mesh | null = null;
  gui = new GUI();

  camera: THREE.Camera;
  scene: THREE.Scene;
  world: CANNON.World;
  shapeBuilder: ShapeBuilder;

  transformControls: TransformControls;
  transforming: boolean = false;

  constructor(
    camera: THREE.Camera,
    scene: THREE.Scene,
    world: CANNON.World,
    shapeBuilder: ShapeBuilder,
    transformControls: TransformControls
  ) {
    this.modelLoader = new GLTFLoader();
    this.camera = camera;
    this.scene = scene;
    this.world = world;
    this.shapeBuilder = shapeBuilder;

    this.transformControls = transformControls;

    this.bindKeyBinds();

    this.gui.domElement.style.position = "absolute";
    this.gui.domElement.style.top = "10px";
    this.gui.domElement.style.left = "10px";
    this.gui.show(false);
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
      const count = geometries[index].index;
      if (count) {
        singleMesh.geometry.groups.push({
          start: offset,
          count: count.count,
          materialIndex: index,
        });
        offset += count.count;
      } else {
        singleMesh.geometry.groups.push({
          start: offset,
          count: geometries[index].attributes.position.count,
          materialIndex: index,
        });
        offset += geometries[index].attributes.position.count;
      }
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

      singleMesh.name = pathToModel;
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

        if (withTransformControls && !this.selectedMesh) {
          this.selectModel(singleMesh);
          this.transformControls.attach(singleMesh);
        }

        this.shapeBuilder.addModelToInstances(singleMesh, customMeshBody);

        this.createdMeshes.push(singleMesh);
      } else {
        throw new Error("Could not find index on geometry object");
      }
    });
  }

  selectModel(mesh: THREE.Mesh) {
    if (this.selectedMesh == mesh) {
      return;
    }
    this.selectedMesh = mesh;

    this.setDetailsInGUIPanel(this.selectedMesh);
    this.gui.show(true);
  }

  setDetailsInGUIPanel(mesh: THREE.Mesh) {
    this.gui.title(mesh.name);
    if (this.selectedMesh) {
      const position = this.gui.addFolder("Position");
      position.add(this.selectedMesh.position, "x").name("x:");
      position.add(this.selectedMesh.position, "y").name("y:");
      position.add(this.selectedMesh.position, "z").name("z:");
    }
  }

  getSelectedModel() {
    return this.selectedMesh;
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

    this.transformControls.addEventListener("mouseDown", () => {
      this.transforming = true;
    });
    this.transformControls.addEventListener("mouseUp", () => {
      this.transforming = false;
    });

    window.addEventListener("mousedown", (event) => {
      if (this.transforming) {
        return;
      }
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      // Calculate mouse position in normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, this.camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(this.createdMeshes, true);

      if (intersects.length > 0) {
        // Detach transformcontrols from existing selection.
        this.transformControls.detach();

        // The first intersected object is the selected one
        const mesh = intersects[0].object;
        if (mesh instanceof THREE.Mesh) {
          this.selectModel(mesh);
          this.transformControls.attach(mesh);
        }
      } else if (!this.transforming) {
        this.transformControls.detach();
      }
    });
  }
}
