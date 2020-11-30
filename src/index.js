import "./style.css";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let object, composer, clock, delta, renderer, camera, scene, cube;
let c = new THREE.Color(0x00ff00);
const params = {
  exposure: 0.2,
  neonStrength: 0.5,
  neonThreshold: 0.2,
  glowRadius: 0.1,
  glowColor: c.getHex(),
};

function init() {
  // setup:
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.y = 5;
  camera.position.z = 40;
  scene.background = new THREE.Color(0x000000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // clock
  clock = new THREE.Clock();

  // light
  const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
  scene.add(ambientLight);

  const light = new THREE.PointLight(0xffffff, 1, 200);
  light.position.set(0, 5, 100);
  light.castShadow = true; // default false
  scene.add(light);

  // floor?
  const mesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2000, 2000),
    new THREE.MeshPhongMaterial({ color: 0x000000, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  scene.add(mesh);
  const grid = new THREE.GridHelper(200, 40, 0x808080, 0x808080);
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);

  // effect composers
  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = params.bloomThreshold;
  bloomPass.strength = params.bloomStrength;
  bloomPass.radius = params.bloomRadius;

  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  composer.setSize(window.innerWidth, window.innerHeight);

  // adding OBJ to the scene
  const loader = new OBJLoader();
  var color_material = new THREE.MeshStandardMaterial({
    color: params.glowColor,
  });
  //   loader.setPath("../src/models/");
  loader.setPath("/assets/");

  loader.load("text2.obj", function (obj) {
    object = obj;
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = color_material;
      }
    });
    object.castShadow = true; //default is false
    scene.add(object);
  });

  // orbit control
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.5;
  controls.minDistance = 1;
  controls.maxDistance = 100;

  // geometry
  const geometry = new THREE.BoxGeometry();
  let material = new THREE.MeshBasicMaterial({
    color: Math.random() * 0xffffff,
  });
  cube = new THREE.Mesh(geometry, material);
  cube.material.color.setHex(Math.random() * 0xffffff);
  geometry.elementsNeedUpdate = true;
  geometry.colorsNeedUpdate = true;
  // cube.castShadow = true; //default is false
  // scene.add(cube);

  // GUI Hexstring helper
  function handleColorChange(color) {
    return function (value) {
      if (typeof value === "string") {
        value = value.replace("#", "0x");
      }

      color.setHex(value);
    };
  }

  // GUI
  const gui = new GUI();

  gui.add(params, "exposure", 0.1, 4).onChange(function (value) {
    renderer.toneMappingExposure = Math.pow(value, 4.0);
  });

  //   gui
  //     .addColor(new ColorGUIHelper(material, "color"), "value")
  //     .name("HELLO color")
  //     .onChange(function () {
  //       //   material.color.setHex(Math.random() * 0xffffff);
  //       console.log(material.color);
  //     });

  gui.add(params, "neonThreshold", 0.0, 1.0).onChange(function (value) {
    bloomPass.threshold = Number(value);
  });

  gui.add(params, "neonStrength", 0.0, 3.0).onChange(function (value) {
    bloomPass.strength = Number(value);
  });

  gui
    .add(params, "glowRadius", 0.0, 1.0)
    .step(0.01)
    .onChange(function (value) {
      bloomPass.radius = Number(value);
    });

  gui.addColor(params, "glowColor").onChange(function (value) {
    color_material.color.setHex(value);
  });
}

// animate things
function animate() {
  requestAnimationFrame(animate);
  //   renderer.render(scene, camera);
  //   delta = clock.getDelta();

  composer.render();
}

init();
animate();
