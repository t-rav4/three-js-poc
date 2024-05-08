let renderRequested = false;

function render() {
  if (renderRequested) {
    // if (resizeRendererToDisplaySize()) {
    // const canvas = renderer.domElement;
    // camera.aspect = canvas.clientWidth / canvas.clientHeight;
    // camera.updateProjectionMatrix();
    // }

    // controls.update();
    // renderer.render(scene, camera);
    renderRequested = false;
  }
}

function requestRenderIfNotRequested() {
  if (!renderRequested) {
    renderRequested = true;
    requestAnimationFrame(render);
  }
}

function resizeRendererToDisplaySize() {
  // const canvas = renderer.domElement;
  // const width = canvas.clientWidth;
  // const height = canvas.clientHeight;
  // const needResize = canvas.width !== width || canvas.height !== height;
  // if (needResize) {
  //   renderer.setSize(width, height, false);
  // }
  // return needResize;
}

// window.addEventListener(
//   "resize",
//   () => {
//     this.camera.aspect = window.innerWidth / window.innerHeight;
//     this.camera.updateProjectionMatrix();
//     this.renderer.setSize(window.innerWidth, window.innerHeight);
//   },
//   false
// );
// this.controls.addEventListener("change", () =>
//   this.requestRenderIfNotRequested()
// );
// window.addEventListener("resize", () => this.requestRenderIfNotRequested());
