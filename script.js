 // --- Configuración Básica de la Escena 3D ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f172a);

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.set(2.2, 1.8, 2.8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0.5, 0);

// --- Iluminación ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight1.position.set(3, 5, 4);
scene.add(dirLight1);

const dirLight2 = new THREE.DirectionalLight(0x6366f1, 0.4);
dirLight2.position.set(-3, -2, -4);
scene.add(dirLight2);

// --- Ejes de Coordenadas ---
const gridHelper = new THREE.GridHelper(3, 20, 0x334155, 0x1e293b);
gridHelper.position.y = 0;
scene.add(gridHelper);

// Eje Y (Eje de rotación)
const yAxisGeometry = new THREE.CylinderGeometry(0.008, 0.008, 2, 16);
const yAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
const yAxis = new THREE.Mesh(yAxisGeometry, yAxisMaterial);
yAxis.position.y = 0.8;
scene.add(yAxis);

// --- Objetos 3D Dinámicos ---
let solidMesh = null;
let shellGroup = new THREE.Group();
let regionMesh = null;
scene.add(shellGroup);

// Funciones Matemáticas
const f = (x) => x;        // Superior
const g = (x) => x * x;    // Inferior

// Variables de Estado
let currentTheta = 0.01;
let shellX = 0.60;
let isAnimating = false;
let animInterval = null;

// --- Generación del Sólido de Revolución ---
function updateSolid(maxTheta) {
    if (solidMesh) scene.remove(solidMesh);
    if (regionMesh) scene.remove(regionMesh);

    const radialSegments = 30;
    const thetaSegments = Math.max(8, Math.floor(maxTheta * 12));
      
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];

    // Generar Vértices para el sólido
     for (let i = 0; i <= radialSegments; i++) {
    const r = i / radialSegments;
    const yTop = f(r);
    const yBot = g(r);

    for (let j = 0; j <= thetaSegments; j++) {
        const th = (j / thetaSegments) * maxTheta;
        const cos = Math.cos(th);
        const sin = Math.sin(th);

        // Vértice Superior
        vertices.push(r * cos, yTop, r * sin);
        // Vértice Inferior
        vertices.push(r * cos, yBot, r * sin);
    }
    }

    const stride = thetaSegments + 1;

    // Crear Caras (Triángulos)
    for (let i = 0; i < radialSegments; i++) {
    for (let j = 0; j < thetaSegments; j++) {
         const top1 = (i * stride + j) * 2;
        const bot1 = top1 + 1;
        const top2 = ((i + 1) * stride + j) * 2;
        const bot2 = top2 + 1;

        const top1Next = top1 + 2;
        const bot1Next = bot1 + 2;
        const top2Next = top2 + 2;
        const bot2Next = bot2 + 2;

        // Superficie Superior (f(x) = x)
        indices.push(top1, top2Next, top1Next);
        indices.push(top1, top2, top2Next);

        // Superficie Inferior (g(x) = x^2)
        indices.push(bot1, bot1Next, bot2Next);
        indices.push(bot1, bot2Next, bot2);
    }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
    color: 0x6366f1,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
    shininess: 80
    });

    solidMesh = new THREE.Mesh(geometry, material);
    scene.add(solidMesh);

    // --- Dibujar la Región Generatriz 2D al borde del corte ---
    const regionShape = new THREE.Shape();
    const pts = 20;
      
    regionShape.moveTo(0, 0);
    for (let k = 0; k <= pts; k++) {
    const r = k / pts;
    regionShape.lineTo(r, f(r));
    }
    for (let k = pts; k >= 0; k--) {
    const r = k / pts;
    regionShape.lineTo(r, g(r));
    }

    const regionGeo = new THREE.ShapeGeometry(regionShape);
    const regionMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
    });
      
    regionMesh = new THREE.Mesh(regionGeo, regionMat);
    regionMesh.rotation.y = maxTheta;
    scene.add(regionMesh);
}

// --- Generación de la Capa Cilíndrica Típica ---
function updateCylindricalShell(xVal, maxTheta) {
    // Limpiar grupo anterior
    while (shellGroup.children.length > 0) {
    shellGroup.remove(shellGroup.children[0]);
    }

    const r = xVal;
    const yBottom = g(r);
    const height = f(r) - g(r);
    const thickness = 0.015;

    if (height <= 0) return;

    // Geometría del Cilindro Representativo
    const shellGeo = new THREE.CylinderGeometry(r, r, height, 48, 1, true, 0, maxTheta);
    const shellMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    roughness: 0.3
    });

    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    shellMesh.position.y = yBottom + height / 2;
    shellGroup.add(shellMesh);

    // Bordes superior e inferior de la capa
    const edgeGeoTop = new THREE.RingGeometry(r - thickness, r + thickness, 48, 1, 0, maxTheta);
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0x059669, side: THREE.DoubleSide });
      
    const topRing = new THREE.Mesh(edgeGeoTop, edgeMat);
    topRing.rotation.x = Math.PI / 2;
    topRing.position.y = yBottom + height;
    shellGroup.add(topRing);

    const botRing = new THREE.Mesh(edgeGeoTop, edgeMat);
    botRing.rotation.x = Math.PI / 2;
    botRing.position.y = yBottom;
    shellGroup.add(botRing);
}

// --- Actualización de la Escena ---
function renderScene() {
    updateSolid(currentTheta);
    updateCylindricalShell(shellX, currentTheta);
      
    document.getElementById('thetaVal').innerText = currentTheta.toFixed(2) + ' rad';
    document.getElementById('thetaSlider').value = currentTheta;
    document.getElementById('shellXVal').innerText = shellX.toFixed(2);
}

// --- Controles de Interacción ---
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const playText = document.getElementById('playText');
const resetBtn = document.getElementById('resetBtn');
const thetaSlider = document.getElementById('thetaSlider');
const shellXSlider = document.getElementById('shellXSlider');

function togglePlay() {
    if (isAnimating) {
    clearInterval(animInterval);
    isAnimating = false;
    playIcon.innerText = '▶';
    playText.innerText = 'Reanudar';
    playBtn.classList.replace('bg-amber-600', 'bg-indigo-600');
    } else {
    if (currentTheta >= Math.PI * 2) currentTheta = 0.01;
    isAnimating = true;
    playIcon.innerText = '⏸';
    playText.innerText = 'Pausar';
    playBtn.classList.replace('bg-indigo-600', 'bg-amber-600');

    animInterval = setInterval(() => {
        currentTheta += 0.08;
        if (currentTheta >= Math.PI * 2) {
        currentTheta = Math.PI * 2;
        togglePlay();
        }
        renderScene();
    }, 30);
    }
}

playBtn.addEventListener('click', togglePlay);

resetBtn.addEventListener('click', () => {
    if (isAnimating) togglePlay();
    currentTheta = 0.01;
    renderScene();
});

thetaSlider.addEventListener('input', (e) => {
    if (isAnimating) togglePlay();
    currentTheta = parseFloat(e.target.value);
    renderScene();
});

shellXSlider.addEventListener('input', (e) => {
    shellX = parseFloat(e.target.value);
    renderScene();
});

// Redimensionamiento Responsivo
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
});

// Bucle de Renderizado Principal
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Inicializar Primera Vista
renderScene();
animate();