import * as THREE from 'three';
import { STLLoader } from './node_modules/three/examples/jsm/loaders/STLLoader';
import { TextGeometry } from './node_modules/three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from './node_modules/three/examples/jsm/loaders/FontLoader';
import { saveAs } from 'file-saver';
import { STLExporter } from './node_modules/three/examples/jsm/exporters/STLExporter';
import CSG from "./THREE-CSGMesh/three-csg.js";



// Setup scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth / 2, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Creating a placeholder cube
const cubeGeometry = new THREE.BoxGeometry();
const cubeMaterial = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube)

camera.position.z = 2;

// Rendering loop for the cube animation
const animateCube = () => {
    requestAnimationFrame(animateCube);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.005;
    renderer.render(scene, camera);
};
animateCube();

var stlFile = '';
var extrudedText = '';
var extrudedMesh = '';

// Function handling the form submission
const handleFormSubmit = (event) => {
    event.preventDefault();

    // Getting the uploaded STL file (ASCII format only!)
    stlFile = stlFileInput.files[0];
    extrudedText = stlStringInput.value;

    if (stlFile && extrudedText) {
        scene.clear()
        const loader = new STLLoader();
        loader.load(URL.createObjectURL(stlFile), function (geometry) {
            let material = new THREE.MeshNormalMaterial();
            let mesh = new THREE.Mesh(geometry, material);

            var loadedFont; //font
            var extrudedGeometry; //textGeometry var
            var extrudedMaterial; // material type

            var fLoader = new FontLoader();
            fLoader.load('./app_files/Arial_Regular.json', function (font) {
                loadedFont = font;

                extrudedGeometry = new TextGeometry(extrudedText, {
                    font: loadedFont,
                    size: textSizeValue, // Adjusting font SIZE
                    height: 4, // Adjust extrusion DEPTH
                });

                extrudedMaterial = new THREE.MeshBasicMaterial({ color: 0xffff });
                extrudedMesh = new THREE.Mesh(extrudedGeometry, extrudedMaterial);

                // Performing the CSG subtraction
                // NOTE: positioning settings sadly depend on the axis center point of the input card,
                //       this positioning is for made_for_card.stl !
                extrudedMesh.position.set(0, 0, 0); //former scene positioning: 5,23,-6,, -3,5-,12
                mesh.position.set(0, 0, 0);
                mesh.rotation.x = -Math.PI;
                console.log('original rotation' + mesh.rotation.x);
                mesh.rotation.y = Math.PI / 2;

                //horizontal length of the card is roughly 60 units
                //adjusting text relative text position:
                extrudedMesh.translateX(xAxisValue); //adjusting on the x axis
                extrudedMesh.translateY(yAxisValue);
                extrudedMesh.translateZ(-1);
                console.log(extrudedMesh.position.x + "updated position")

                //updating matrix world of both meshes
                mesh.updateMatrixWorld();
                extrudedMesh.updateMatrixWorld();

                //converting to subtractable csg geo format
                let bspMesh = CSG.fromMesh(mesh)
                let bspTxt = CSG.fromMesh(extrudedMesh)

                //subtracting
                let bspResult = bspMesh.subtract(bspTxt)
                let meshResult = CSG.toMesh(bspResult, mesh.matrix, mesh.material)

                scene.add(meshResult);

                camera.lookAt(scene.position);

                camera.aspect = (window.innerWidth / 2) / window.innerHeight;
                camera.updateProjectionMatrix();

                const animate = () => {
                    requestAnimationFrame(animate);
                    meshResult.rotation.y += 0.02
                    renderer.render(scene, camera);
                };

                //adjusting camera position

                camera.position.z = 150;
                camera.position.y = -40;
                camera.position.x = 10;
                animate();

                document.querySelector('#exportButton').disabled = false;
            });
        });
    } else alert('You forgot to pick TEXT, FILE, or BOTH!');
};

// download / export function
const handleExport = () => {
    var exporter = new STLExporter();
    var strExport = exporter.parse(scene);
    var blob = new Blob([strExport], { type: 'text/plain' });
    saveAs(blob, `${extrudedText}_STL_CARD.stl`);
}

function readNumberInputs() {
    xAxisValue = parseFloat(xAxisInput.value)
    yAxisValue = parseFloat(yAxisInput.value)
    textSizeValue = parseFloat(textSizeInput.value)
}

var xAxisValue = 22;
var yAxisValue = -7;
var textSizeValue = 3.5;

const xAxisInput = document.getElementById('xAxisInput');
const yAxisInput = document.getElementById('yAxisInput');
const textSizeInput = document.getElementById('textSizeInput');

const exportButton = document.getElementById('exportButton');
exportButton.addEventListener('click', handleExport);

const stlUploadForm = document.getElementById('stlUploadForm');
const stlFileInput = document.getElementById('stlFileInput');
const stlStringInput = document.getElementById('extrudedTextInput');
const adjustButton = document.getElementById('adjustButton');

adjustButton.addEventListener('click', readNumberInputs);
stlUploadForm.addEventListener('submit', handleFormSubmit);
