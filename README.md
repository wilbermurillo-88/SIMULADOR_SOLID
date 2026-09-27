# Sólido de Revolución - Método de Capas Cilíndricas

![Cálculo Integral](https://img.shields.io/badge/Curso-C%C3%A1lculo%20Integral-blue)
![Tecnología](https://img.shields.io/badge/Tecnolog%C3%ADa-Desarrollo%20de%20Software-indigo)
![Licencia](https://img.shields.io/badge/Licencia-MIT-green)

Aplicación web interactiva en 3D para la visualización y cálculo del volumen de un sólido de revolución generado por rotación alrededor del **eje Y**, desarrollada como parte de la actividad final del curso de Cálculo Integral.

---

 Propósito de la Actividad

Calcular mediante el **método de capas cilíndricas** el volumen del sólido obtenido al rotar una región acotada entre dos funciones alrededor del eje Y.

Funciones Utilizadas
Función Superior:** f(x) = x
Función Inferior:** g(x) = x^2
Límites de Integración:** x \in [0, 1] (obtenidos en las intersecciones (0,0) y (1,1))

---

# Elementos de la Capa Cilíndrica

Con base en la geometría de la región acotada:

| Elemento | Expresión Matemática | Descripción |
| Radio (r)| r(x) = x | Distancia de la capa al eje de rotación (Y) |
| Altura (h) | h(x) = x - x^2 | Diferencia entre la función superior e inferior (f(x) - g(x))[cite: 1] |
| Espesor| dx | Ancho infinitesimal de la capa |

# Planteamiento de la Integral

V = \int_{a}^{b} 2\pi \cdot (\text{Radio}) \cdot (\text{Altura}) \, dx

V = 2\pi \int_{0}^{1} x (x - x^2) \, dx = 2\pi \int_{0}^{1} (x^2 - x^3) \, dx

V = 2\pi \left[ \frac{x^3}{3} - \frac{x^4}{4} \right]_{0}^{1} = 2\pi \left( \frac{1}{3} - \frac{1}{4} \right) = 2\pi \left( \frac{1}{12} \right) = \frac{\pi}{6} \approx 0.5236 \, \text{u}^3
[cite: 1]

---

# Características de la Simulación 3D

Visualización Dinámica:** Control manual o automático de la rotación (\theta \in [0, 2\pi]).
Capa Cilíndrica Interactivas:** Ajuste dinámico de la posición x para resaltar una capa cilíndrica específica dentro del sólido.
Sección Transversal 2D:** Muestra la región plana generatriz resaltada en el borde del sólido.
Interfaz Responsiva:** Construida con HTML5, Tailwind CSS y Three.js.

---

# Estructura del Proyecto

```text
├── index.html        # Estructura principal, estilos y lógica 3D (Three.js)
├── README.md         # Documentación del proyecto
