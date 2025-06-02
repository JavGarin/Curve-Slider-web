// Polyfill para ctx.roundRect
CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    this.beginPath();
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();
    return this;
};

let lenis;
const images = [];
let loadedImageCount = 0;

window.addEventListener("load", () => {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    loadImages();
});

function loadImages() {
    for (let i = 1; i <= 7; i++) {
        const img = new Image();
        img.onload = function () {
            images.push(img);
            loadedImageCount++;
            
            if (loadedImageCount === 7) {
                initializeScene();
            }
        };
        img.onerror = function () {
            console.error(`Error loading image: assets/img/img${i}.jpg`);
            loadedImageCount++;
            if (loadedImageCount === 7) {
                initializeScene();
            }
        };
        img.src = `./assets/img/img${i}.jpg`;
    }
}

function initializeScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector("canvas"),
        antialias: true,
        powerPreference: "high-performance",
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const parentWidth = 20;
    const parentHeight = 75;
    const curvature = 35;
    const segmentsX = 200;
    const segmentsY = 200;

    const parentGeometry = new THREE.PlaneGeometry(
        parentWidth,
        parentHeight,
        segmentsX,
        segmentsY
    );

    const positions = parentGeometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        const y = positions[i + 1];
        const distanceFromCenter = Math.abs(y / (parentHeight / 2));
        positions[i + 2] = Math.pow(distanceFromCenter, 2) * curvature;
    }
    parentGeometry.computeVertexNormals();

    const totalSlides = 7;
    const slideHeight = 15;
    const gap = 0.5;
    const cycleHeight = totalSlides * (slideHeight + gap);

    const textureCanvas = document.createElement("canvas");
    const ctx = textureCanvas.getContext("2d", {
        alpha: false,
        willReadFrequently: false,
    });
    textureCanvas.width = 2048;
    textureCanvas.height = 8192;

    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

    const parentMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true
    });

    const parentMesh = new THREE.Mesh(parentGeometry, parentMaterial);
    parentMesh.position.set(0, 0, 0);
    parentMesh.rotation.x = THREE.MathUtils.degToRad(-20);
    parentMesh.rotation.y = THREE.MathUtils.degToRad(20);
    scene.add(parentMesh);

    const distance = 17.5;
    const heightOffset = 5;
    const offsetX = distance * Math.sin(THREE.MathUtils.degToRad(20));
    const offsetZ = distance * Math.cos(THREE.MathUtils.degToRad(30));

    camera.position.set(offsetX, heightOffset, offsetZ);
    camera.lookAt(0, -2, 0);
    camera.rotation.z = THREE.MathUtils.degToRad(-5);

    const slideTitles = [
        "Field Unit",
        "Astral Convergence",
        "Eclipse Core",
        "Luminous",
        "Serenity",
        "Nebula Point",
        "Horizon",
    ];

    let currentScroll = 0;
    let targetScroll = 0;
    
    function updateTexture(offset = 0) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);

        const fontSize = 180;
        ctx.font = `500 ${fontSize}px "Inter", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const extraSlides = 2;
        const slideRadius = 40;

        for (let i = -extraSlides; i < totalSlides + extraSlides; i++) {
            let slideY = -i * (slideHeight + gap);
            slideY += offset * cycleHeight;

            const textureY = (slideY / cycleHeight) * textureCanvas.height;
            let wrappedY = textureY % textureCanvas.height;
            if (wrappedY < 0) wrappedY += textureCanvas.height;

            let slideIndex = ((-i % totalSlides) + totalSlides) % totalSlides;
            let slideNumber = slideIndex + 1;

            const slideRect = {
                x: textureCanvas.width * 0.5,
                y: wrappedY,
                width: textureCanvas.width * 0.9,
                height: (slideHeight / cycleHeight) * textureCanvas.height,
            };

            const img = images[slideNumber - 1];
            if (img) {
                const imgAspect = img.width / img.height;
                const rectAspect = slideRect.width / slideRect.height;

                let drawWidth, drawHeight, drawX, drawY;

                if (imgAspect > rectAspect) {
                    drawHeight = slideRect.height;
                    drawWidth = drawHeight * imgAspect;
                    drawX = slideRect.x - drawWidth / 2;
                    drawY = slideRect.y - slideRect.height / 2;
                } else {
                    drawWidth = slideRect.width;
                    drawHeight = drawWidth / imgAspect;
                    drawX = slideRect.x - slideRect.width / 2;
                    drawY = slideRect.y - slideRect.height / 2 + (slideRect.height - drawHeight) / 2;
                }

                // Dibujar imagen con bordes redondeados
                ctx.save();
                ctx.beginPath();
                ctx.roundRect(
                    slideRect.x - slideRect.width / 2,
                    slideRect.y - slideRect.height / 2,
                    slideRect.width,
                    slideRect.height,
                    slideRadius
                );
                ctx.clip();
                ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                ctx.restore();

                // Dibujar borde redondeado
                ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.roundRect(
                    slideRect.x - slideRect.width / 2,
                    slideRect.y - slideRect.height / 2,
                    slideRect.width,
                    slideRect.height,
                    slideRadius
                );
                ctx.stroke();

                // Dibujar título
                ctx.fillStyle = "white";
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = 10;
                ctx.fillText(
                    slideTitles[slideIndex],
                    slideRect.x,
                    slideRect.y + slideRect.height / 2 + 150
                );
                ctx.shadowBlur = 0;
            }
        }
        texture.needsUpdate = true;
    }

    // Configurar evento scroll de Lenis
    lenis.on("scroll", ({ scroll, limit }) => {
        targetScroll = scroll / limit;
    });

    // Función de animación
    function animate() {
        // Suavizar el desplazamiento
        currentScroll += (targetScroll - currentScroll) * 0.1;
        
        // Actualizar textura con la posición actual
        updateTexture(-currentScroll);
        
        // Renderizar la escena
        renderer.render(scene, camera);
        
        // Continuar la animación
        requestAnimationFrame(animate);
    }
    
    // Iniciar animación
    animate();

    // Manejar redimensionamiento
    let resizeTimeout;
    window.addEventListener("resize", () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            updateTexture(-currentScroll);
        }, 250);
    });
    
    // Renderizar inicialmente
    updateTexture(0);
    renderer.render(scene, camera);
}