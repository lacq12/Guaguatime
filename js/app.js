import { guardarFavorito, obtenerFavoritos } from "./storage.js";

const origenSelect = document.getElementById("origen");
const destinoSelect = document.getElementById("destino");
const btnBuscar = document.getElementById("buscar");
const resultadosDiv = document.getElementById("resultados");
const favoritosDiv = document.getElementById("favoritos");

let rutas = [];
let condiciones = [];

async function init() {
  try {
    const resRutas = await fetch("./data/rutas.json");
    rutas = await resRutas.json();

    const resCond = await fetch("./data/condiciones.json");
    condiciones = await resCond.json();

    llenarSelects();
    mostrarFavoritos();
  } catch (error) {
    console.error("Error:", error);
    resultadosDiv.innerHTML = "<p>Error cargando datos 😢</p>";
  }
}

function llenarSelects() {
  origenSelect.innerHTML = "<option value=''>Seleccione origen</option>";
  destinoSelect.innerHTML = "<option value=''>Seleccione destino</option>";

  
  const origenes = [...new Set(rutas.map(r => r.origen))];

  
  const destinos = [...new Set(rutas.map(r => r.destino))];

  origenes.forEach(o => {
    origenSelect.innerHTML += `<option value="${o}">${o}</option>`;
  });

  destinos.forEach(d => {
    destinoSelect.innerHTML += `<option value="${d}">${d}</option>`;
  });
}

btnBuscar.addEventListener("click", () => {
  const origen = origenSelect.value;
  const destino = destinoSelect.value;

  if (!origen || !destino) {
    resultadosDiv.innerHTML = "<p>⚠️ Selecciona origen y destino</p>";
    return;
  }

  if (origen === destino) {
    resultadosDiv.innerHTML = "<p>⚠️ No pueden ser iguales</p>";
    return;
  }

  const filtradas = rutas.filter(r =>
    r.origen === origen && r.destino === destino
  );

  mostrarResultados(filtradas);
});

function calcularRuta(ruta) {
  let tiempo = ruta.tiempo_min;
  let costo = ruta.costo;

  condiciones.forEach(c => {
    tiempo *= (1 + c.tiempo_pct / 100);
    costo += c.costo_extra;
  });

  return {
    ...ruta,
    tiempo: Math.round(tiempo),
    costo
  };
}

function mostrarResultados(lista) {
  resultadosDiv.innerHTML = "";

  if (lista.length === 0) {
    resultadosDiv.innerHTML = "<p>❌ No hay rutas disponibles</p>";
    return;
  }

  lista.forEach(r => {
    const calc = calcularRuta(r);

    const div = document.createElement("div");
    div.classList.add("ruta");

    div.innerHTML = `
      <p>🚍 ${r.transporte}</p>
      <p>⏱️ ${calc.tiempo} min</p>
      <p>💰 RD$${calc.costo}</p>
      <p>🔄 ${r.transbordos}</p>
    `;

    const btn = document.createElement("button");
    btn.textContent = "Guardar";
    btn.addEventListener("click", () => {
      guardarFavorito(r);
      mostrarFavoritos();
    });

    div.appendChild(btn);
    resultadosDiv.appendChild(div);
  });
}

function mostrarFavoritos() {
  const favs = obtenerFavoritos();
  favoritosDiv.innerHTML = "";

  if (favs.length === 0) {
    favoritosDiv.innerHTML = "<p>No hay favoritos ⭐</p>";
    return;
  }

  favs.forEach(f => {
    favoritosDiv.innerHTML += `
      <div class="ruta">
        <p>📍 ${f.origen} → ${f.destino}</p>
      </div>
    `;
  });
}

init();