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
  indexedInstancesToRemove: number[] = [];

  constructor(scene: THREE.Scene, world: CANNON.World) {
    this.scene = scene;
    this.world = world;
  }

  removeQueuedInstances() {
    this.indexedInstancesToRemove.forEach((index) => {
      const [removedInstance] = this.shapeInstances.splice(index, 1);

      this.scene.remove(removedInstance.mesh);
      this.world.removeBody(removedInstance.body);
      removedInstance.mesh.geometry.dispose();
      (removedInstance.mesh.material as THREE.Material).dispose();
    });
    this.indexedInstancesToRemove = [];
  }

  removeInstance(instance: ShapeInstance) {
    const removalIndex = this.shapeInstances.findIndex(
      (i) => i.mesh.id == instance.mesh.id
    );
    if (removalIndex >= 0) {
      this.indexedInstancesToRemove.push(removalIndex);
    }
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
    this.shapeInstances.forEach(({ mesh, body }: ShapeInstance, _idx) => {
      if ((body as any).pickup) {
        body.angularVelocity.set(0, 1.5, 0);
      }

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

  createCoin() {
    const radius = 2;
    const height = 1;
    const coinBody = new CANNON.Body({
      mass: 0,
      collisionFilterGroup: 2,
      type: CANNON.Body.DYNAMIC,
      shape: new CANNON.Cylinder(radius, radius, height),
    });

    coinBody.position.set(0, 6, 0);
    // coinBody.quaternion.setFromAxisAngle(CANNON.Vec3.UNIT_X, Math.PI / 2);
    // Set initial rotation around the X-axis to make it upright
    const uprightQuaternion = new CANNON.Quaternion();
    uprightQuaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);

    // Set random rotation around the Y-axis
    const randomYQuaternion = new CANNON.Quaternion();
    const randYAngle = Math.random() * 2 * Math.PI;
    randomYQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), randYAngle);

    // Combine the two quaternions
    coinBody.quaternion.copy(uprightQuaternion.mult(randomYQuaternion));

    const cylinder = new THREE.CylinderGeometry(radius, radius, height);
    const cylinderMat = new THREE.MeshNormalMaterial();
    const cylidnerMesh = new THREE.Mesh(cylinder, cylinderMat);

    this.world.addBody(coinBody);

    cylidnerMesh.position.copy(coinBody.position);
    cylidnerMesh.quaternion.copy(coinBody.quaternion);

    this.scene.add(cylidnerMesh);

    const shapeInstance = { mesh: cylidnerMesh, body: coinBody };
    this.shapeInstances.push(shapeInstance);

    return shapeInstance;
  }
}
