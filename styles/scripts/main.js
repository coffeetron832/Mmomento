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
});
