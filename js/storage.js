export function guardarFavorito(ruta) {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  favoritos.push(ruta);
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

export function obtenerFavoritos() {
  return JSON.parse(localStorage.getItem("favoritos")) || [];
}