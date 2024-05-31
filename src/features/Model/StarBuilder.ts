import * as THREE from "three";

export class StarBuilder {
  stars: THREE.Mesh<
    THREE.SphereGeometry,
    THREE.MeshStandardMaterial,
    THREE.Object3DEventMap
  >[];
  scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.stars = [];
    this.scene = scene;

    this.init();
  }

  private init() {
    this.stars = Array.from({ length: 200 }, () => this.createStar());
  }

  private createStar() {
    const geometry = new THREE.SphereGeometry(1, 24, 24);
    const randomColour = new THREE.Color(Math.random() * 0xffffff);
    const material = new THREE.MeshStandardMaterial({ color: randomColour });
    const star = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array.from({ length: 3 }, () =>
      THREE.MathUtils.randFloatSpread(100)
    );
    star.position.set(x, y, z);

    this.scene.add(star);
    return star;
  }

  private animate(
    star: THREE.Mesh<
      THREE.SphereGeometry,
      THREE.MeshStandardMaterial,
      THREE.Object3DEventMap
    >,
    time: number
  ) {
    const hue = (time * 60) % 360;
    const color = new THREE.Color().setHSL(hue / 360, 1, 0.5);
    star.material.color.set(color);
  }

  animateStars() {
    const time = performance.now() * 0.001; // Get time in seconds
    this.stars.forEach((s, index) => {
      this.animate(s, time + index * 0.1);
    });
  }
}
