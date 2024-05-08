import * as THREE from "three";

// Set 3d panorama image as Skybox
const loader = new THREE.TextureLoader();
const texture = loader.load("/ridleystreet.png", () => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  // scene.background = texture;
});
