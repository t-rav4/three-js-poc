import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { Font, FontLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

export class TextBuilder {
  fontLoader: FontLoader;
  scene: THREE.Scene;

  createdText: THREE.Mesh | null = null;

  font!: Font;

  constructor(scene: THREE.Scene) {
    this.fontLoader = new FontLoader();
    this.scene = scene;
  }

  createText(
    text: string,
    position: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
  ) {
    this.fontLoader.load(
      "/fonts/Montserrat SemiBold_Regular.json",
      (fnt) => {
        const geometry = new TextGeometry(text, {
          font: fnt,
          size: 4,
          depth: 1,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.5,
          bevelSize: 0.2,
          bevelSegments: 5,
        });
        // Adjust position to centre
        geometry.computeBoundingBox();
        if (geometry.boundingBox) {
          const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
          geometry.translate(-width / 2, 1, 0);
        }

        const material = new THREE.MeshNormalMaterial({ transparent: true });
        const textMesh = new THREE.Mesh(geometry, material);
        textMesh.position.copy(position);
        this.scene.add(textMesh);

        this.createdText = textMesh;
      },
      undefined,
      (error) => {
        console.log("Failed to load font. Error: " + error);
      }
    );
  }

  fadeOut(durationMs: number) {
    if (!this.createdText) {
      return;
    }
    const interval = 10;
    const step = interval / durationMs;

    let opacity = 1;
    const effect = setInterval(() => {
      opacity -= step;
      if (opacity <= 0) {
        opacity = 0;
        clearInterval(effect);
        this.removeText();
      }
      if (this.createdText) {
        (this.createdText.material as THREE.Material).opacity = opacity;
      }
    });
  }

  removeText() {
    if (this.createdText) {
      this.scene.remove(this.createdText);
      this.createdText = null;
    }
  }
}
