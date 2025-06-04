
# 🌈 Curve Slider - 3D Scroll Gallery ✨

Un slider 3D curvo interactivo con efecto de scroll suave que muestra imágenes en un formato innovador.

<p align="center">
  <img src="https://i.ibb.co/6RkPQm61/Portada.png" alt="Portada del proyecto" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); width: 80%; max-width: 800px;"/>
</p>


## 🚀 Características Principales

- 🎨 **Efecto visual 3D curvado** con Three.js
- 🔄 **Scroll infinito** con transiciones suaves
- ⚡ **Optimizado para rendimiento**
- 📱 **Responsive design**
- 💫 **Efectos de iluminación y profundidad**
- ⏳ **Loader elegante** con tiempo mínimo garantizado

## 🛠 Tecnologías Utilizadas

| Tecnología       | Uso                     |
|------------------|-------------------------|
| ![Three.js](https://img.shields.io/badge/Three.js-r128-black?logo=three.js&logoColor=white) | Renderizado 3D |
| ![Lenis](https://img.shields.io/badge/Lenis-1.0.27-blue) | Scroll suave |
| ![AVIF](https://img.shields.io/badge/AVIF-JPG%20fallback-orange) | Formatos de imagen |
| ![WebGL](https://img.shields.io/badge/WebGL-2.0-red?logo=webgl) | Aceleración gráfica |

## 🎯 Lógica del Proyecto

### 🔄 Flujo Principal

1. **🔄 Precarga de Assets**
   ```javascript
   // Carga imágenes con fallback
   img.src = `./assets/img/img${i}.avif`;
   img.onerror = () => {
     fallbackImg.src = `./assets/img/img${i}.jpg`;
   };
   ```

2. **🎬 Animación 3D**
   - Geometría de plano curvado
   - Canvas dinámico como textura
   - Efectos de iluminación

3. **🖱 Interacción**
   ```javascript
   lenis.on("scroll", ({ scroll }) => {
     targetScroll = scroll / limit;
   });
   ```

4. **🔄 Renderizado Continuo**
   ```javascript
   function animate() {
     updateTexture();
     renderer.render(scene, camera);
     requestAnimationFrame(animate);
   }
   ```

## 📦 Estructura de Archivos

```
📦 curve-slider
├── 📄 index.html
├── 📄 style.css
├── 📄 script.js
└── 📂 assets
    ├── 📂 img
    │   ├── 🖼️ img1.avif
    │   └── 🖼️ img1.jpg (fallback)
    └── 📂 favicon_io
    
```
## 📄 Licencia

MIT © [Javier Garin](https://github.com/JavGarin)

---

<p align="center">
✨ <em>Make it modern</em> ✨
</p>
