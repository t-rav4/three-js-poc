import * as THREE from "three";
import * as CANNON from "cannon-es";
import { ShapeBuilder } from "./components/ShapeBuilder";
import { threeVecToCannon } from "./utils/vectorUtils";

export class Pickup {
  mesh!: THREE.Mesh;
  body!: CANNON.Body;

  shapeBuilder: ShapeBuilder;

  constructor(shapeBuilder: ShapeBuilder) {
    this.shapeBuilder = shapeBuilder;
    this.instantiatePickup();
  }

  instantiatePickup() {
    const { mesh, body } = this.shapeBuilder.createCoin();
    (body as any).pickup = this; // bind this instance to the body so we can retrieve during collisions

    this.mesh = mesh;
    this.body = body;
  }

  setPosition(pos: THREE.Vector3) {
    this.body.position.copy(threeVecToCannon(pos));
  }

  destroy() {
    this.shapeBuilder.removeInstance({
      mesh: this.mesh,
      body: this.body,
    });
  }
}
