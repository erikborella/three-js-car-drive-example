import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(10, 10, 20).normalize();
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 5, 1);
pointLight.position.set(10, 10, 20); // Set the position of the light
scene.add(pointLight);

// Load the GLTF model of the car
const loader = new GLTFLoader();
loader.load('/models/city/scene.gltf', (gltf) => {
    const cityModel = gltf.scene;
    cityModel.scale.set(0.001, 0.001, 0.001);
    cityModel.position.y = -13
    cityModel.rotation.x = Math.PI / 2;
    scene.add(cityModel);
})

let carModel;

loader.load('/models/car/scene.gltf', (gltf) => {
    carModel = gltf.scene;
    carModel.scale.set(0.1, 0.1, 0.1); // Adjust the scale as needed
    carModel.rotation.x = Math.PI / 2;
    carModel.rotation.y = Math.PI / 2;
    scene.add(carModel);
});

// Handle keyboard input
const keyboard = {};
document.addEventListener('keydown', (event) => {
    keyboard[event.key] = true;
});
document.addEventListener('keyup', (event) => {
    keyboard[event.key] = false;
});

// Set initial velocity and turn speed
let velocity = 0;
const turnSpeed = 0.02;
let carRotation = 0;
let test = 0.01;

// Animation loop
const animate = () => {
    requestAnimationFrame(animate);

    // Handle keyboard input
    if (keyboard['ArrowUp']) {
        velocity += 0.005;
    }
    if (keyboard['ArrowDown']) {
        velocity -= 0.005;
    }
    if (keyboard['ArrowLeft']) {
        carRotation += turnSpeed * 2;
        carModel.rotation.y += turnSpeed * 2;
    }
    if (keyboard['ArrowRight']) {
        carRotation -= turnSpeed * 2;
        carModel.rotation.y -= turnSpeed * 2;
    }

    // Apply friction to slow down the car
    velocity *= 0.98;

    // Update car position and rotation
    carModel.position.x += Math.cos(carRotation) * velocity;
    carModel.position.y += Math.sin(carRotation) * velocity;

    // Keep the car on the ground
    carModel.position.z = 0.1;

    camera.position.x = carModel.position.x;
    camera.position.y = carModel.position.y - 2.5;


    renderer.render(scene, camera);
};

// Camera setup
camera.position.z = 4;
camera.rotateX(0.4);

// Start the animation loop
animate();