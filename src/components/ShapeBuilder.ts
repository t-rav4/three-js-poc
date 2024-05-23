import * as THREE from "three";
import * as CANNON from "cannon-es";
import { threeVecToCannon } from "../utils/vectorUtils";

export type ShapeInstance = {
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
      mass: 100,
      collisionFilterGroup: 5,
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

    const shapeInstance = { mesh: cubeMesh, body: cubeBody };
    this.shapeInstances.push(shapeInstance);

    return shapeInstance;
  }

  addModelToInstances(mesh: THREE.Mesh, body: CANNON.Body) {
    this.shapeInstances.push({ mesh, body });
  }

  syncPhysics() {
    if (this.shapeInstances.length == 0) {
      return;
    }

    this.shapeInstances.forEach(({ mesh, body }: ShapeInstance, _idx) => {
      // For static physic bodies, sync the physics body to the mesh instead
      if (body.type === CANNON.Body.STATIC) {
        body.position.copy(threeVecToCannon(mesh.position));
        const quat = new CANNON.Quaternion(
          mesh.quaternion.x,
          mesh.quaternion.y,
          mesh.quaternion.z,
          mesh.quaternion.w
        );
        body.quaternion.copy(quat);
        return;
      }

      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    });
  }
}
