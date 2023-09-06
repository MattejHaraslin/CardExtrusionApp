import * as THREE from 'three';
import { STLLoader } from './node_modules/three/examples/jsm/loaders/STLLoader';
import { TextGeometry } from './node_modules/three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from './node_modules/three/examples/jsm/loaders/FontLoader';
import { saveAs } from 'file-saver';
import { STLExporter } from './node_modules/three/examples/jsm/exporters/STLExporter';


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

var stlFile = '';
var extrudedText = '';

// Function to handle the form submission
const handleFormSubmit = (event) => {
    event.preventDefault();

    // Get the uploaded STL file
    stlFile = stlFileInput.files[0];
    extrudedText = stlStringInput.value;

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
                    height: -10, // Adjust extrusion depth.
                    material: 0,
                    extrudeMaterial: 1,
                });

                console.log(extrudedGeometry);

                extrudedMaterial = new THREE.MeshBasicMaterial({ color: 0xffff });

                // Now, you can create the extrudedMesh and add it to the scene
                const extrudedMesh = new THREE.Mesh(extrudedGeometry, extrudedMaterial);
                extrudedMesh.rotation.x = Math.PI / 2
                extrudedMesh.rotation.y = Math.PI / 2

                extrudedMesh.position.set(5, 23, -6); // !!! ACTUALLY relative to the scene, the coordinates are: Z, X, Y

                scene.clear();

                const combinedGroup = new THREE.Group();
                combinedGroup.add(mesh);
                combinedGroup.add(extrudedMesh);
                scene.add(combinedGroup);

                combinedGroup.rotation.x = -Math.PI / 2;
                camera.lookAt(scene.position);

                camera.aspect = (window.innerWidth / 2) / window.innerHeight;
                camera.updateProjectionMatrix();

                const animate = () => {
                    requestAnimationFrame(animate);
                    combinedGroup.rotation.z += 0.015;

                    renderer.render(scene, camera);
                };

                camera.position.z = 150;
                camera.position.y = -55;
                camera.position.x = 0;
                animate();

                document.querySelector('#exportButton').disabled = false;
            });
        });
    } else alert('You forgot to pick TEXT, FILE, or BOTH!');
};


const handleExport = () => {
    var exporter = new STLExporter();
    var strExport = exporter.parse(scene);
    var blob = new Blob([strExport], { type: 'text/plain' });
    saveAs(blob, `${extrudedText}_STL_CARD.stl`);
}

const exportButton = document.getElementById('exportButton');
exportButton.addEventListener('click', handleExport);


// Get references to form and file input
const stlUploadForm = document.getElementById('stlUploadForm');
const stlFileInput = document.getElementById('stlFileInput');
const stlStringInput = document.getElementById('extrudedTextInput');

// Attach form submission handler
stlUploadForm.addEventListener('submit', handleFormSubmit);
