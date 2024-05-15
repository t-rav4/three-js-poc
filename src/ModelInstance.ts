import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import { Geometry } from "three/examples/jsm/deprecated/Geometry.js";
import { ShapeBuilder } from "./components/ShapeBuilder";
import { BufferGeometryUtils } from "three/examples/jsm/Addons.js";

export class ModelInstance {
  modelLoader: GLTFLoader;
  model!: GLTF;

  scene: THREE.Scene;
  world: CANNON.World;
  shapeBuilder: ShapeBuilder;

  constructor(
    scene: THREE.Scene,
    world: CANNON.World,
    shapeBuilder: ShapeBuilder
  ) {
    this.modelLoader = new GLTFLoader();

    this.scene = scene;
    this.world = world;
    this.shapeBuilder = shapeBuilder;
  }

  async importModel(pathToModel: string) {
    this.model = await this.modelLoader.loadAsync(pathToModel);
    // this.model = this.scaleUpGLTF(this.model);
    this.model.scene.scale.set(5, 5, 5);
    this.model.scene.updateWorldMatrix(true, true);

    const physicsBody = this.generatePhysicsBodyFromGLTFModel(this.model);
    if (!physicsBody) {
      console.log("Failed to create physics body for model");
      return;
    }

    physicsBody.position.set(0, 0, 0);
    this.world.addBody(physicsBody);

    this.model.scene.position.copy(physicsBody.position);
    this.model.scene.quaternion.copy(physicsBody.quaternion);

    let mesh: THREE.Mesh | undefined;
    this.model.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        mesh = child;
      }
    });
    if (mesh) {
      console.log(
        "Final step, mesh exists, adding to scene, and shapeinstances"
      );
      this.scene.add(this.model.scene);
      this.shapeBuilder.addModelToInstances(mesh, physicsBody);
      return;
    }
    console.log("no mesh was found..");
  }

  getMeshChildrenFromGLTFModel(model: GLTF) {
    const scene = model.scene;
    let meshChildren: THREE.Mesh[] = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        meshChildren.push(object);
      }
    });
    return meshChildren;
  }

  generatePhysicsBodyFromGLTFModel(model: GLTF): CANNON.Body | undefined {
    const meshes: THREE.Mesh[] = this.getMeshChildrenFromGLTFModel(model);

    let meshPolys: CANNON.ConvexPolyhedron[] = [];

    meshes.forEach((mesh) => {
      let buffGeometry = mesh.geometry.clone();
      buffGeometry.scale(5, 5, 5);
      buffGeometry = BufferGeometryUtils.mergeVertices(buffGeometry);

      const vertices = this.getVerticesFromBufferGeometry(buffGeometry);
      const faces = this.getFacesFromBufferGeometry(buffGeometry);

      const meshShape = new CANNON.ConvexPolyhedron({ vertices, faces });
      meshPolys.push(meshShape);
    });

    // Merge all convex polyhedrons
    let mergedVertices: CANNON.Vec3[] = [];
    let mergedFaces: number[][] = [];
    meshPolys.forEach((poly) => {
      mergedVertices = mergedVertices.concat(poly.vertices);
      const numVertices = poly.vertices.length;
      poly.faces.forEach((face) => {
        const indices = face.map(
          (index) => index + mergedVertices.length - numVertices
        );
        mergedFaces.push(indices);
      });
    });

    // create the singular shape instance
    const singleConvexPolyhedron = new CANNON.ConvexPolyhedron({
      vertices: mergedVertices,
      faces: mergedFaces,
    });
    singleConvexPolyhedron.computeNormals(); // Test this line
    const shapeBody = new CANNON.Body({
      mass: 0,
      collisionFilterGroup: 3,
    });

    shapeBody.addShape(singleConvexPolyhedron);
    return shapeBody;
  }

  getVerticesFromBufferGeometry(bufferGeometry: THREE.BufferGeometry) {
    const vertices: CANNON.Vec3[] = [];
    // geometry.vertices.forEach((vertex) => {
    //   vertices.push(new CANNON.Vec3(vertex.x, vertex.y, vertex.z));
    // });
    const positionAttribute = bufferGeometry.getAttribute("position");
    if (positionAttribute) {
      const array = positionAttribute.array; // The array containing vertex positions
      const itemSize = positionAttribute.itemSize; // Number of values per vertex (usually 3 for x, y, z)
      const count = positionAttribute.count; // Total number of vertices

      // Iterate over each vertex
      for (let i = 0; i < count; i++) {
        // Calculate the index in the array for the current vertex
        const index = i * itemSize;

        // Get the x, y, z coordinates of the vertex
        const x = array[index];
        const y = array[index + 1];
        const z = array[index + 2];

        // Now you can use x, y, z or create a THREE.Vector3 object
        const vertex = new CANNON.Vec3(x, y, z);
        vertices.push(vertex);
      }
    } else {
      console.log("No position attribute.");
    }
    return vertices;
  }

  getFacesFromBufferGeometry(bufferGeometry: THREE.BufferGeometry) {
    const faces: number[][] = [];
    // geometry.faces.forEach((face) => {
    //   faces.push([face.a, face.b, face.c]);
    // });
    const indexAttribute = bufferGeometry.index;
    if (indexAttribute) {
      const indices = indexAttribute.array; // Array containing indices
      const itemSize = indexAttribute.itemSize; // Number of indices per face (usually 3 for triangles)
      const numTriangles = indices.length / itemSize; // Total number of triangles

      // Iterate over each face (triangle)
      for (let i = 0; i < numTriangles; i++) {
        // Calculate the starting index for the current face
        const index = i * itemSize;

        // Get the indices for the vertices of the current face
        const vertexIndex1 = indices[index] ?? 0;
        const vertexIndex2 = indices[index + 1] ?? 0;
        const vertexIndex3 = indices[index + 2] ?? 0;

        // Now you have the indices of the vertices of the current face
        // You can access the vertices using these indices from the position attribute
        // For example:
        // const vertex1 = new THREE.Vector3().fromBufferAttribute(
        //   bufferGeometry.attributes.position,
        //   vertexIndex1
        // );
        // const vertex2 = new THREE.Vector3().fromBufferAttribute(
        //   bufferGeometry.attributes.position,
        //   vertexIndex2
        // );
        // const vertex3 = new THREE.Vector3().fromBufferAttribute(
        //   bufferGeometry.attributes.position,
        //   vertexIndex3
        // );

        faces.push([vertexIndex1, vertexIndex2, vertexIndex3]);
      }
    } else {
      console.log("No index attribute.");
    }
    return faces;
  }

  scaleUpGLTF(mesh: GLTF) {
    const scaleFactor = 4;

    const scene = mesh.scene;

    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.scale.set(scaleFactor, scaleFactor, scaleFactor);
      }
    });

    mesh.scene = scene;
    return mesh;

    // mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // if (body.shapes.length > 0) {
    //   const shape = body.shapes[0];
    //   if (shape instanceof CANNON.Box) {
    //     const halfExtents = shape.halfExtents;
    //     halfExtents.scale(scaleFactor, halfExtents);
    //     shape.updateConvexPolyhedronRepresentation(); // Update convex representation
    //   }
    // }
    // return mesh;
  }
}
