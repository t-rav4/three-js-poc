import * as THREE from "three";
import * as CANNON from "cannon-es";

export class Player {
  health = 10;
  coins = 0;
  movementEnabled = true;

  ballBody!: CANNON.Body;
  ball!: THREE.Mesh;
  radius = 2;
  velocity: CANNON.Vec3 = CANNON.Vec3.ZERO;
  acceleration = 8;
  deceleration = 0.2;

  mousePos: THREE.Vector3 = new THREE.Vector3();
  keys = { W: false, A: false, S: false, D: false };

  maxSpeed = 18;

  constructor() {
    this.init();
  }

  init() {
    // cannon (physics) world
    this.ballBody = new CANNON.Body({
      mass: 1,
      type: CANNON.Body.DYNAMIC,
      shape: new CANNON.Sphere(this.radius),
      collisionFilterGroup: 1,
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

    // add collistion listener
    this.ballBody.addEventListener("collide", (event: any) => {
      console.log(event);
      if (event.body.collisionFilterGroup == 5) {
        this.takeDamage(5);
        // TODO: add some sort of knockback
        return;
      }
      if (event.body.collisionFilterGroup == 2) {
        const coin = event.body?.pickup;
        if (coin) {
          this.coins++;
          coin.destroy();
        }
      }
    });

    // three.js
    const sphereGeo = new THREE.SphereGeometry(this.radius);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/assets/poly_texture.jpg");
    const sphereMat = new THREE.MeshBasicMaterial({ map: texture });

    this.ball = new THREE.Mesh(sphereGeo, sphereMat);

    this.bindKeyInputs();
  }

  getHealth() {
    return this.health;
  }
  getCoins() {
    return this.coins;
  }
  takeDamage(damage: number) {
    this.health -= damage;
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
    if (!this.movementEnabled) {
      return;
    }
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

  die() {
    this.movementEnabled = false;
    this.velocity = CANNON.Vec3.ZERO;
  }

  update() {
    if (this.health <= 0) {
      this.die();
    }

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
      this.ballBody.applyImpulse(CANNON.Vec3.UNIT_Y.scale(20));
    }
  }

  // TODO: use something like this when shooting/throwables are added?
  // drawAimIndicator() {
  // const mousePosition = new THREE.Vector3();
  // mousePosition.set(
  //   (mouseX / window.innerWidth) * 2 - 1,
  //   -(event.clientY / window.innerHeight) * 2 + 1,
  //   0.5
  // );
  // }

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
    window.addEventListener("keypress", (event) => {
      if (event.code == "Space") {
        this.jump();
      }
    });
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
