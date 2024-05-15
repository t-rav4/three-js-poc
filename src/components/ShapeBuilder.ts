import * as THREE from "three";
import * as CANNON from "cannon-es";
import { threeVecToCannon } from "../utils/vectorUtils";

type ShapeInstance = {
  mesh: THREE.Mesh;
  body: CANNON.Body;
};

export class ShapeBuilder {
  scene: THREE.Scene;
  world: CANNON.World;

  shapeInstances: ShapeInstance[] = [];

  constructor(scene: THREE.Scene, world: CANNON.World) {
    this.scene = scene;
    this.world = world;
  }

  createBox(
    width: number,
    height: number,
    depth: number,
    startPos: THREE.Vector3
  ) {
    const cubeBody = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.STATIC,
      shape: new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2)),
    });

    cubeBody.position.copy(threeVecToCannon(startPos));

    const cube = new THREE.BoxGeometry(width, height, depth);
    const cubeMat = new THREE.MeshNormalMaterial();
    const cubeMesh = new THREE.Mesh(cube, cubeMat);

    this.world.addBody(cubeBody);

    cubeMesh.position.copy(cubeBody.position);
    cubeMesh.quaternion.copy(cubeBody.quaternion);

    this.scene.add(cubeMesh);

    this.shapeInstances.push({ mesh: cubeMesh, body: cubeBody });
  }

  addModelToInstances(mesh: THREE.Mesh, body: CANNON.Body) {
    this.shapeInstances.push({ mesh, body });
  }

  syncShapes() {
    if (this.shapeInstances.length == 0) {
      return;
    }

    this.shapeInstances.forEach(({ mesh, body }: ShapeInstance, _idx) => {
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    });
  }
}
