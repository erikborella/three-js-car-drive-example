import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { degToRad } from 'three/src/math/MathUtils';

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
    carModel.scale.set(0.1, 0.1, 0.1);
    carModel.rotation.x = Math.PI / 2;
    carModel.rotation.y = Math.PI / 2;
    carModel.position.z = 0.5;
    scene.add(carModel);

    carModel.add(camera);
});

const keyboard = {};
document.addEventListener('keydown', (event) => {
    keyboard[event.key] = true;
});
document.addEventListener('keyup', (event) => {
    keyboard[event.key] = false;
});

const pathPoints = [];
const pathMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2, });
const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
const pathLine = new THREE.Line(pathGeometry, pathMaterial);
pathLine.frustumCulled = false;
scene.add(pathLine);

const projectedPathPoints = [];
const projectedPathMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const projectedPathGeometry = new THREE.BufferGeometry().setFromPoints(projectedPathPoints);
const projectedPathLine = new THREE.Line(projectedPathGeometry, projectedPathMaterial);
projectedPathLine.frustumCulled = false;
scene.add(projectedPathLine);

const projectionSteps = 50;

let velocity = 0;
const turnSpeed = 0.02;
let carRotation = 0;
let targetRotation = 0;

const animate = () => {
    requestAnimationFrame(animate);

    if (keyboard['t']) {
        camera.position.y += 0.5;
    }
    if (keyboard['g']) {
        camera.position.y -= 0.5;
    }
    if (keyboard['w']) {
        camera.position.z += 0.5;
    }
    if (keyboard['s']) {
        camera.position.z -= 0.5;
    }
    if (keyboard['a']) {
        camera.position.x += 0.5;
    }
    if (keyboard['d']) {
        camera.position.x -= 0.5;
    }
    if (keyboard['ArrowUp']) {
        velocity += 0.005;
    }
    if (keyboard['ArrowDown']) {
        velocity -= 0.005;
    }

    velocity *= 0.98;

    if (Math.abs(velocity) > 0.01) {
        if (keyboard['ArrowLeft']) {
            targetRotation += turnSpeed * 2;
        }
        if (keyboard['ArrowRight']) {
            targetRotation -= turnSpeed * 2;
        }
    }

    carRotation += (targetRotation - carRotation) * 0.1;
    
    projectedPathPoints.length = 0;
    
    let simulatedCarRotation = carRotation;
    for (let i = 0; i < projectionSteps; i++) {
        simulatedCarRotation += (targetRotation - simulatedCarRotation) * 0.1;
        const projectedX = carModel.position.x + Math.cos(simulatedCarRotation) * velocity * i;
        const projectedY = carModel.position.y + Math.sin(simulatedCarRotation) * velocity * i;
    
        projectedPathPoints.push(new THREE.Vector3(projectedX, projectedY, 0.1));
    }

    projectedPathLine.geometry.setFromPoints(projectedPathPoints);

    carModel.position.x += Math.cos(carRotation) * velocity;
    carModel.position.y += Math.sin(carRotation) * velocity;

    carModel.position.z = 0.1;

    carModel.rotation.y = carRotation + degToRad(90);

    pathPoints.push(carModel.position.clone());

    if (pathPoints.length > 500) {
        pathPoints.shift();
    }

    pathLine.geometry.setFromPoints(pathPoints);

    renderer.render(scene, camera);
};

camera.position.set(0, 40, -50);
camera.rotateY(degToRad(180));
camera.lookAt(0, 0, 0);

animate();