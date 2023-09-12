import * as THREE from 'three';
import { STLLoader } from './node_modules/three/examples/jsm/loaders/STLLoader';
import { TextGeometry } from './node_modules/three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from './node_modules/three/examples/jsm/loaders/FontLoader';
import { saveAs } from 'file-saver';
import { STLExporter } from './node_modules/three/examples/jsm/exporters/STLExporter';
// import { CSG } from 'three-csg-ts';
// import { CSG } from 'https://cdn.jsdelivr.net/gh/Sean-Bradley/THREE-CSGMesh@master/dist/client/CSGMesh.js'
// import * as CSGMesh from '../CSG/THREE-CSGMesh/dist/client/CSGMesh';
import CSG from "./THREE-CSGMesh/three-csg.js";



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
        loader.load(URL.createObjectURL(stlFile), function (geometry) { //stlFile is the 3D object
            let material = new THREE.MeshNormalMaterial();
            let mesh = new THREE.Mesh(geometry, material);

            var loadedFont; //font
            var extrudedGeometry; //textGeometry var
            var extrudedMaterial; // material type

            var fLoader = new FontLoader();
            fLoader.load('./app_files/Arial_Regular.json', function (font) {
                loadedFont = font;

                extrudedGeometry = new TextGeometry(extrudedText, { //extrudedText holds string to extrude
                    font: loadedFont, // loading font
                    size: 4, // Adjusting size
                    height: 4, // Adjust extrusion depth.
                    //params I've found that also made no difference
                });

                //Former textGeometry creation
                extrudedMaterial = new THREE.MeshBasicMaterial({ color: 0xffff });
                let extrudedMesh = new THREE.Mesh(extrudedGeometry, extrudedMaterial);
                
                // extrudedMesh.rotation.x = -Math.PI / 2;
                // console.log('original rotation' + mesh.rotation.x);
                // extrudedMesh.rotation.z = -Math.PI / 2;

                //offset one of the boxes by half its width..

                //Make sure the .matrix of each mesh is current

                mesh.updateMatrix()
                extrudedMesh.updateMatrix()

                //Create a bsp tree from each of the meshes

                // let bspA = CSG.fromMesh(meshA)
                // let bspB = CSG.fromMesh(extrudedMesh)

                // // Subtract one bsp from the other via .subtract... other supported modes are .union and .intersect

                // let bspResult = bspA.subtract(bspB)

                // //Get the resulting mesh from the result bsp, and assign meshA.material to the resulting mesh

                // let meshResult = CSG.toMesh(bspResult, meshA.matrix, meshA.material)
                // scene.clear()
                // scene.add(meshResult);


                let mySphere = new THREE.SphereGeometry(2);
                let mySphereMesh = new THREE.Mesh(mySphere, material);
                mySphereMesh.translateX(25); //horizontal length of the card is roughly 60 units


                // const textCSG = CSGMesh.CSG.fromMesh(extrudedMesh);
                // const cardCSG = CSGMesh.CSG.fromMesh(mesh);
                // const cutCardCSG = cardCSG.subtract(textCSG);
                // mesh.geometry.dispose()
                // mesh = CSGMesh.CSG.toMesh(
                //     cutCardCSG,
                //     new THREE.Matrix4()
                // );

                // Perform the CSG subtraction operation

                extrudedMesh.position.set(0, 0, 0); //positioning within my scene 5,23,-6,, -3,5-,12
                mesh.position.set(0, 0, 0);
                mesh.rotation.x = -Math.PI / 2;
                console.log('original rotation' + mesh.rotation.x);
                mesh.rotation.z = -Math.PI / 2;
                extrudedMesh.translateX(25); //horizontal length of the card is roughly 60 units
                extrudedMesh.translateY(-5);
                extrudedMesh.translateZ(-0.5);

                let bspMesh = CSG.fromMesh(mesh)
                let bspTxt = CSG.fromMesh(extrudedMesh)

                let bspResult = bspMesh.subtract(bspTxt)
                let meshResult = CSG.toMesh(bspResult, mesh.matrix, mesh.material)
                
                scene.clear()
                scene.add(meshResult)
                // Replace the card mesh with the edited mesh
                // mesh.geometry.dispose();
                // mesh.applyMatrix4();

                // Reset position and rotation
                // mesh.position.copy(originalPosition);
                // mesh.rotation.copy(originalRotation);

                // Add the edited mesh to the scene


                // // var cardCsgMesh = CSGMesh.CSG.fromMesh(mesh);
                // var cubeMesh = CSGMesh.CSG.fromMesh(cube)
                // // console.log(cardCsgMesh);
                // console.log('method executed succ')
                // var textCsgMesh = CSGMesh.CSG.fromMesh(extrudedMesh);

                // console.log(textCsgMesh);
                // console.log("got csg from geo");

                // var resultCsg = cubeMesh.subtract(textCsgMesh);
                // console.log(resultCsg);
                // console.log("subtracted")
                // var resultMesh = CSGMesh.CSG.toMesh(resultCsg, mesh.matrix);
                // console.log(resultMesh);

                // scene.add(resultMesh);


                // scene.add(mesh);
                // scene.add(extrudedMesh);

                // console.log("both meshes in the scene")
                // console.log(cubeShit)
                // const finalMesh = CSG.subtract(mesh, extrudedMesh);
                // console.log(finalMesh);
                // console.log("clearing scene")

                // scene.clear()
                // console.log('adding finalMesh');

                // scene.add(finalMesh);

                // var csgMesh = CSG.toGeometry(mesh);
                // console.log(csgMesh);
                // console.log(finalMesh)

                // scene.add(finalMesh)


                // combining meshes
                // combinedGroup.add(extrudedMesh);

                // extrudedMesh.rotation.y = -Math.PI / 2;

                // // var meshGmtry = CSG.toGeometry(mesh)
                // console.log(meshGmtry)
                // // var extrudedGmtry = CSG.toGeometry(extrudedMesh)
                // console.log(extrudedGeometry)

                // const finalMesh = CSG.subtract(mesh, extrudedMesh);
                // console.log(combinedGroup)

                // scene.add(combinedGroup)

                camera.lookAt(scene.position);

                camera.aspect = (window.innerWidth / 2) / window.innerHeight;
                camera.updateProjectionMatrix();
                console.log('we got here')

                const animate = () => {
                    requestAnimationFrame(animate);
                    // meshA.rotation.y += 0.015;
                    // extrudedMesh.rotation.y += 0.015;
                    meshResult.rotation.y += 0.015

                    renderer.render(scene, camera);
                };

                camera.position.z = 150; //150
                camera.position.y = -55; //-55
                camera.position.x = 0; //0
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
