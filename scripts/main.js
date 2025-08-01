document.addEventListener("DOMContentLoaded", () => {
  const productos = [
    {
      id: 1,
      nombre: "Pulsera cuero trenzado",
      precio: 25000,
      imagen: "images/pulsera1.jpg",
    },
    {
      id: 2,
      nombre: "Collar minimalista",
      precio: 30000,
      imagen: "images/collar1.jpg",
    },
    {
      id: 3,
      nombre: "Aretes geométricos",
      precio: 18000,
      imagen: "images/aretes1.jpg",
    }
  ];

  const contenedor = document.getElementById("productos");

  productos.forEach(prod => {
    const div = document.createElement("div");
    div.className = "tarjeta-producto";
    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}" />
      <div class="info">
        <h3>${prod.nombre}</h3>
        <p>$${prod.precio.toLocaleString()}</p>
      </div>
    `;
    contenedor.appendChild(div);
  });

function getNonOverlappingPosition(existingPositions, imgWidth = 80, imgHeight = 80, maxAttempts = 100) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    const top = Math.random() * (100 - 15); // Evita que se salgan por abajo
    const left = Math.random() * (100 - 10); // Evita que se salgan por la derecha

    const overlap = existingPositions.some(pos => {
      const dx = Math.abs(pos.left - left);
      const dy = Math.abs(pos.top - top);
      return dx < 10 && dy < 10; // Espacio mínimo entre imágenes
    });

    if (!overlap) {
      return { top, left };
    }

    attempts++;
  }

  return null; // Por si no encuentra lugar (muy raro)
}

const placedPositions = [];

document.querySelectorAll('.floating-images img.float').forEach(img => {
  const size = 210 + Math.random() * 30; // entre 120 y 170px
  img.style.width = `${size}px`;
  img.style.height = 'auto';

  const pos = getNonOverlappingPosition(placedPositions);
  if (pos) {
    img.style.top = `${pos.top}%`;
    img.style.left = `${pos.left}%`;
    placedPositions.push(pos);
  }
});



  
});
