// script.js

// Polyfill para ctx.roundRect (si no está ya definido globalmente)
if (CanvasRenderingContext2D.prototype.roundRect === undefined) {
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
}

let lenis;
const images = [];
let loadedImageCount = 0;
const totalImagesToLoad = 7;

// Variable para registrar el tiempo de inicio del loader
let loaderStartTime = Date.now(); // Registra el tiempo cuando el script comienza a ejecutarse

window.addEventListener("load", () => {
    // loaderStartTime = Date.now(); // Alternativamente, puedes iniciarlo aquí si prefieres
                                     // que los 3s cuenten desde que la estructura HTML básica está lista.
                                     // Ponerlo arriba asegura que cuenta desde el primer momento posible.
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
    for (let i = 1; i <= totalImagesToLoad; i++) {
        const img = new Image();

        img.onload = function () {
            images.push(img);
            loadedImageCount++;

            if (loadedImageCount === totalImagesToLoad) {
                initializeScene();
            }
        };

        img.onerror = function () {
            console.warn(`AVIF not supported or failed for: assets/img/img${i}.avif. Trying JPG fallback.`);

            // Intentar cargar la versión .jpg si falla .avif
            const fallbackImg = new Image();
            fallbackImg.onload = function () {
                images.push(fallbackImg);
                loadedImageCount++;
                if (loadedImageCount === totalImagesToLoad) {
                    initializeScene();
                }
            };
            fallbackImg.onerror = function () {
                console.error(`Error loading fallback image: assets/img/img${i}.jpg`);
                loadedImageCount++;
                if (loadedImageCount === totalImagesToLoad) {
                    initializeScene();
                }
            };
            fallbackImg.src = `./assets/img/img${i}.jpg`;
        };

        img.src = `./assets/img/img${i}.avif`;
    }
}

function initializeScene() {
    const loaderWrapper = document.querySelector('.loader-wrapper');
    
    if (loaderWrapper) {
        const currentTime = Date.now();
        const elapsedTime = currentTime - loaderStartTime;
        const minimumDisplayTime = 3000; // 3000 milisegundos = 3 segundos
        
        // Calcula el retraso necesario para cumplir los 3 segundos mínimos
        const delay = Math.max(0, minimumDisplayTime - elapsedTime);

        setTimeout(() => {
            loaderWrapper.classList.add('hidden');
            // Opcional: Eliminar el loader del DOM después de la transición
            // La transición CSS dura 0.75s (750ms)
            // setTimeout(() => {
            //     if (loaderWrapper.parentNode) {
            //         loaderWrapper.parentNode.removeChild(loaderWrapper);
            //     }
            // }, 750); 
        }, delay);
    }

    // El resto de la inicialización de la escena Three.js comienza aquí,
    // independientemente del setTimeout para ocultar el loader.
    // Esto significa que tu escena puede empezar a renderizar mientras el loader
    // todavía está visible si se está esperando a que se cumplan los 3 segundos.
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
        "Pluto",
        "Jupiter",
        "Saturn",
        "Mars",
        "Mercury",
        "Helios",
        "Horizon",
    ];

    let currentScroll = 0;
    let targetScroll = 0;
    
    function updateTexture(offset = 0) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);

        const fontSize = 125;
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
            
            const slideRect = {
                x: textureCanvas.width * 0.5,
                y: wrappedY,
                width: textureCanvas.width * 0.9,
                height: (slideHeight / cycleHeight) * textureCanvas.height,
            };

            const img = images[slideIndex]; 
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

    lenis.on("scroll", ({ scroll, limit }) => {
        targetScroll = scroll / limit;
    });

    function animate() {
        currentScroll += (targetScroll - currentScroll) * 0.1;
        updateTexture(-currentScroll);
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    
    animate();

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
    
    updateTexture(0);
    renderer.render(scene, camera);
}