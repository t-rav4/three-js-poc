import * as THREE from "three";
import * as CANNON from "cannon-es";

export class Ball {
  ballBody!: CANNON.Body;
  ball!: THREE.Mesh;
  radius = 2;
  velocity: CANNON.Vec3 = CANNON.Vec3.ZERO;
  acceleration = 6;
  deceleration = 0.2;

  keys = { W: false, A: false, S: false, D: false };

  maxSpeed = 12;

  constructor() {
    this.init();
  }

  init() {
    // cannon (physics) world
    this.ballBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(this.radius),
    });
    this.ballBody.material = new CANNON.Material({
      friction: 1.0,
      restitution: 0.3,
    });
    this.ballBody.position.x -= 20;
    this.ballBody.position.y += 2.4;
    this.ballBody.position.x += 6;

    // this.ballBody.linearDamping = 0;
    this.ballBody.angularDamping = 0.5;

    // three.js
    const sphereGeo = new THREE.SphereGeometry(this.radius);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/poly_texture.jpg");
    const sphereMat = new THREE.MeshBasicMaterial({ map: texture });

    this.ball = new THREE.Mesh(sphereGeo, sphereMat);

    this.bindKeyInputs();
  }

  // Send a raycast from the sphere's centre in a downwards direction
  // If collide with a body that is part of the 'ground' colliison filter group,
  // we're grounded
  isGrounded() {
    if (!this.ballBody.world) {
      return false;
    }

    const target = this.ballBody.position.clone();
    target.y = target.y - this.radius - 0.1;
    let grounded = false;
    this.ballBody.world.raycastAll(
      this.ballBody.position,
      target,
      undefined,
      (event: CANNON.RaycastResult) => {
        if (event.body?.collisionFilterGroup == 3) {
          grounded = true;
        }
      }
    );
    return grounded;
  }

  updateVelocity() {
    if (this.keys["W"]) {
      this.velocity.z = Math.max(
        this.velocity.z - this.acceleration,
        -this.maxSpeed
      );
    }
    if (this.keys["S"]) {
      this.velocity.z = Math.min(
        this.velocity.z + this.acceleration,
        this.maxSpeed
      );
    }
    if (this.keys["A"]) {
      this.velocity.x = Math.max(
        this.velocity.x - this.acceleration,
        -this.maxSpeed
      );
    }
    if (this.keys["D"]) {
      this.velocity.x = Math.min(
        this.velocity.x + this.acceleration,
        this.maxSpeed
      );
    }
    // Caps maximum speed + handling of diagonal velocities summing together
    if (this.velocity.length() > this.maxSpeed) {
      this.velocity.normalize();
      this.velocity.scale(this.maxSpeed, this.velocity);
    }
  }

  decelerateVelocity() {
    if (!this.keys["W"] && this.velocity.z < 0) {
      this.velocity.z = Math.min(this.velocity.z + this.deceleration, 0);
    }
    if (!this.keys["S"] && this.velocity.z > 0) {
      this.velocity.z = Math.max(this.velocity.z - this.deceleration, 0);
    }
    if (!this.keys["A"] && this.velocity.x < 0) {
      this.velocity.x = Math.min(this.velocity.x + this.deceleration, 0);
    }
    if (!this.keys["D"] && this.velocity.x > 0) {
      this.velocity.x = Math.max(this.velocity.x - this.deceleration, 0);
    }
  }

  update() {
    this.updateVelocity();
    this.decelerateVelocity();

    this.ballBody.velocity.set(
      this.velocity.x,
      this.ballBody.velocity.y,
      this.velocity.z
    );

    // Sync threejs mesh to sphere body in physics world
    this.ball.position.copy(this.ballBody.position);
    this.ball.quaternion.copy(this.ballBody.quaternion);
  }

  jump() {
    if (this.isGrounded()) {
      this.ballBody.applyImpulse(CANNON.Vec3.UNIT_Y.scale(16));
    }
  }

  getMesh() {
    return this.ball;
  }
  getPhysicsBody() {
    return this.ballBody;
  }

  getMeshPosition() {
    return this.ball.position;
  }

  bindKeyInputs() {
    window.addEventListener("keydown", (event) => {
      switch (event.code) {
        case "KeyW":
          this.keys["W"] = true;
          break;
        case "KeyS":
          this.keys["S"] = true;
          break;
        case "KeyA":
          this.keys["A"] = true;
          break;
        case "KeyD":
          this.keys["D"] = true;
          break;
      }
    });

    window.addEventListener("keyup", (event) => {
      switch (event.code) {
        case "KeyW":
          this.keys["W"] = false;
          break;
        case "KeyS":
          this.keys["S"] = false;
          break;
        case "KeyA":
          this.keys["A"] = false;
          break;
        case "KeyD":
          this.keys["D"] = false;
          break;
      }
    });
  }
}
