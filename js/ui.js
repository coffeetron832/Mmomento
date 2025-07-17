export function inicializarUI() {
  const toggleBtn = document.getElementById("toggleUIBtn");
  const formulario = document.querySelector(".formulario");
  const misAportes = document.getElementById("misAportes");

  let visible = false;

  toggleBtn.addEventListener("click", () => {
    visible = !visible;
    formulario.style.display = visible ? "block" : "none";
    misAportes.style.display = visible ? "block" : "none";
    toggleBtn.textContent = visible ? "👁️ Ocultar" : "👁️ Mostrar";
  });

  const handleResize = () => {
    if (window.innerWidth > 768) {
      formulario.style.display = "block";
      misAportes.style.display = "block";
      toggleBtn.style.display = "none";
    } else {
      formulario.style.display = visible ? "block" : "none";
      misAportes.style.display = visible ? "block" : "none";
      toggleBtn.style.display = "block";
    }
  };

  window.addEventListener("resize", handleResize);
  window.addEventListener("DOMContentLoaded", handleResize);
}
