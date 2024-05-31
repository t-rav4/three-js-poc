import { Vector3 } from "three";
import * as CANNON from "cannon-es";
import { getRandomVector3 } from "../../utils/vectorUtils";
import { ShapeBuilder, ShapeInstance } from "../Model/ShapeBuilder";

export class EnemyManager {
  shapeBuilder: ShapeBuilder;
  movementEnabled = false;

  enemies: ShapeInstance[] = [];

  constructor(shapeBuilder: ShapeBuilder) {
    this.shapeBuilder = shapeBuilder;

    this.init();
  }

  init() {}

  moveEnemies(targetPos: CANNON.Vec3) {
    if (!this.movementEnabled) {
      return;
    }

    this.enemies.forEach((obs) => {
      const direction = new CANNON.Vec3();
      targetPos.vsub(obs.body.position, direction);
      direction.normalize();

      const maxSpeed = 10;
      const desiredVelocity = direction.scale(maxSpeed);

      const currentVelocity = obs.body.velocity;
      const velocityChange = desiredVelocity.vsub(currentVelocity);

      obs.body.velocity.vadd(velocityChange, obs.body.velocity);

      if (obs.mesh.position.distanceTo(targetPos) < 0.1) {
        console.log("Reached target pos");
      }
    });
  }

  toggle() {
    this.movementEnabled = !this.movementEnabled;
  }

  spawnEnemies(roundNumber: number) {
    const toSpawn = roundNumber * 3;
    const spawnPositions = this.generateSpawnPositions(toSpawn);

    spawnPositions.forEach((pos) => {
      const box = this.shapeBuilder.createBox(6, 6, 6, pos);
      this.enemies.push(box);
    });
  }

  generateSpawnPositions(numOfSpawns: number) {
    let spawns: Vector3[] = [];
    const minDistanceFromOrigin = 50;

    for (let i = 0; i < numOfSpawns; i++) {
      spawns.push(getRandomVector3(minDistanceFromOrigin));
    }
    return spawns;
  }

  destroyAll() {
    this.movementEnabled = false;
    this.enemies.forEach((enemy) => {
      this.shapeBuilder.removeInstance({ mesh: enemy.mesh, body: enemy.body });
    });
  }

  stopMovement() {
    this.movementEnabled = false;
  }
}

// alternative force movement:
// const direction = targetPos.clone().vsub(obs.body.position);
// // direction.normalize(); // Normalize the direction vector
// const speed = 1; // Adjust the speed as needed

// // Apply a force in the direction of the target
// obs.body.applyForce(
//   direction.scale(speed * obs.body.mass),
//   obs.body.position
// );

// // Optionally, you can check if the body has reached the target position
// if (obs.mesh.position.distanceTo(targetPos) < 0.1) {
//   console.log("Reached target pos");
// }
