import * as THREE from 'three';
import { STLLoader } from './node_modules/three/examples/jsm/loaders/STLLoader';
import { TextGeometry } from './node_modules/three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from './node_modules/three/examples/jsm/loaders/FontLoader';
// import fontImport from './node_modules/three/examples/fonts/helvetiker_regular.typeface.json';


// Setup scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth / 2, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a rotating cube
const cubeGeometry = new THREE.BoxGeometry();
const cubeMaterial = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube)

console.log(TextGeometry);
// Position the camera
camera.position.z = 2;

// Render loop for the cube animation
const animateCube = () => {
    requestAnimationFrame(animateCube);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.005;
    renderer.render(scene, camera);
};

animateCube();

// Function to handle the form submission
const handleFormSubmit = (event) => {
    event.preventDefault();

    // Get the uploaded STL file
    const stlFile = stlFileInput.files[0];
    const extrudedText = stlStringInput.value;

    if (stlFile && extrudedText) {

        const loader = new STLLoader();
        loader.load(URL.createObjectURL(stlFile), function (geometry) {
            const material = new THREE.MeshNormalMaterial();
            const mesh = new THREE.Mesh(geometry, material);

            var loadedFont;
            var extrudedGeometry;
            var extrudedMaterial;

            var fLoader = new FontLoader();
            fLoader.load('./app_files/Arial_Regular.json', function (font) {
                loadedFont = font;

                extrudedGeometry = new TextGeometry(extrudedText, {
                    font: loadedFont, // Use the loaded font
                    size: 5, // Adjust size as needed
                    height: 2, // Adjust extrusion depth
                });

                extrudedMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

                // Now, you can create the extrudedMesh and add it to the scene
                const extrudedMesh = new THREE.Mesh(extrudedGeometry, extrudedMaterial);

                extrudedMesh.position.set(30, 0, 0); // Adjust x, y, z coordinates

                // Clear the scene
                scene.clear();
                scene.add(mesh);
                scene.add(extrudedMesh); // Add the extruded text to the scene

                console.log("my variables: ", extrudedGeometry, extrudedMaterial);
                console.log(mesh);
                console.log(extrudedMesh);
            });


            mesh.rotation.x = -Math.PI / 2;
            camera.lookAt(scene.position);

            camera.aspect = (window.innerWidth / 2) / window.innerHeight;
            camera.updateProjectionMatrix();

            const animate = () => {
                requestAnimationFrame(animate);
                mesh.rotation.z += 0.015;

                renderer.render(scene, camera);
            };

            camera.position.z = 150;
            camera.position.y = -55;
            camera.position.x = 0;

            animate();
        });
    } else alert('All fields must be filled!');
};

// Get references to form and file input
const stlUploadForm = document.getElementById('stlUploadForm');
const stlFileInput = document.getElementById('stlFileInput');
const stlStringInput = document.getElementById('extrudedTextInput');

// Attach form submission handler
stlUploadForm.addEventListener('submit', handleFormSubmit);
