import { Vector3 } from "three";
import { ShapeBuilder, ShapeInstance } from "./components/ShapeBuilder";
import * as CANNON from "cannon-es";

export class Obstacles {
  shapeBuilder: ShapeBuilder;

  movementEnabled = false;

  obstacles: ShapeInstance[] = [];

  constructor(shapeBuilder: ShapeBuilder) {
    this.shapeBuilder = shapeBuilder;

    this.init();
  }

  init() {}

  moveObstacles(targetPos: CANNON.Vec3) {
    if (!this.movementEnabled) {
      return;
    }

    this.obstacles.forEach((obs) => {
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
      this.obstacles.push(box);
    });
  }

  generateSpawnPositions(numOfSpawns: number) {
    let spawns: Vector3[] = [];
    const minDistanceFromOrigin = 50;

    for (let i = 0; i < numOfSpawns; i++) {
      let x = generateRandomCoordinate(minDistanceFromOrigin, 100);
      let z = generateRandomCoordinate(minDistanceFromOrigin, 100);
      spawns.push(new Vector3(x, 3, z));
    }
    return spawns;
  }
}

function generateRandomCoordinate(min: number, max: number): number {
  const coordinate = Math.random() * (max - min) + min;
  return Math.random() < 0.5 ? -coordinate : coordinate;
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
