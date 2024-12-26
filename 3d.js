import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container3D');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        90,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    window.addEventListener('resize', () => {
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
    });

    const loader = new GLTFLoader();
    loader.load(
        'model/scene.gltf',
        (gltf) => {
            console.log("Model loaded successfully");
            const object = gltf.scene;
            scene.add(object);

            const box = new THREE.Box3().setFromObject(object);
            const size = new THREE.Vector3();
            box.getSize(size);

            const scaleFactor = 0.5;
            object.scale.set(scaleFactor, scaleFactor, scaleFactor);

            const modelRadius = size.length() * scaleFactor / 2;
            camera.position.z = modelRadius * 1.2;

            const center = box.getCenter(new THREE.Vector3());
            camera.position.set(center.x, center.y, camera.position.z);
            camera.lookAt(center);
        },
        (xhr) => {
            console.log(`Loading progress: ${(xhr.loaded / xhr.total) * 100}%`);
        },
        (error) => {
            console.error("Error loading GLTF file:", error);
        }
    );

    // Render loop
    const renderScene = () => {
        requestAnimationFrame(renderScene);
        controls.update();
        renderer.render(scene, camera);
    };
    renderScene();
});
