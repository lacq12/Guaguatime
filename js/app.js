import { guardarFavorito, obtenerFavoritos } from "./storage.js";
import { cargarRutas } from "./routes.js";

const form = document.getElementById("form-busqueda");
const origenSelect = document.getElementById("origen");
const destinoSelect = document.getElementById("destino");
const resultadosDiv = document.getElementById("resultados");
const favoritosDiv = document.getElementById("favoritos");
const btnTema = document.getElementById("toggle-tema");

let rutas = [];
let condiciones = [];

async function init() {
  try {
    rutas = await (await fetch("./data/rutas.json")).json();
    condiciones = await (await fetch("./data/condiciones.json")).json();
    llenarSelects();
    mostrarFavoritos();
    cargarTema();
  } catch (error) {
    console.error(error);
    resultadosDiv.textContent = "Error cargando datos 😢";
  }
}

function llenarSelects() {
  const origenes = [...new Set(rutas.map(r => r.origen))];
  const destinos = [...new Set(rutas.map(r => r.destino))];

  origenSelect.innerHTML = '<option value="">Seleccione origen</option>';
  destinoSelect.innerHTML = '<option value="">Seleccione destino</option>';

  origenes.forEach(o => {
    origenSelect.innerHTML += `<option value="${o}">${o}</option>`;
  });

  destinos.forEach(d => {
    destinoSelect.innerHTML += `<option value="${d}">${d}</option>`;
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();
  resultadosDiv.innerHTML = "";

  const origen = origenSelect.value;
  const destino = destinoSelect.value;

  if (!origen || !destino) {
    resultadosDiv.textContent = "⚠️ Selecciona origen y destino";
    return;
  }

  if (origen === destino) {
    resultadosDiv.textContent = "⚠️ No pueden ser iguales";
    return;
  }

  const filtradas = cargarRutas(rutas, origen, destino);
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
    resultadosDiv.textContent = "❌ No hay rutas disponibles";
    return;
  }

  lista.forEach(r => {
    const calc = calcularRuta(r);
    const div = document.createElement("div");
    div.className = "ruta";

    let icono = "🚍";
    if (r.transporte === "motoconcho") icono = "🏍️";
    if (r.transporte === "carro publico") icono = "🚖";

    div.innerHTML = `
      ${icono} <strong>${r.transporte}</strong><br>
      ⏱️ ${calc.tiempo} min<br>
      💰 RD$${calc.costo}
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
    favoritosDiv.textContent = "No hay favoritos ⭐";
    return;
  }

  favs.forEach(f => {
    const div = document.createElement("div");
    div.textContent = `📍 ${f.origen} → ${f.destino}`;
    favoritosDiv.appendChild(div);
  });
}

function cargarTema() {
  const tema = localStorage.getItem("tema");
  if (tema === "oscuro") {
    document.body.classList.add("dark");
    btnTema.textContent = "🌞 Tema claro";
  }
}

btnTema.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "tema",
    document.body.classList.contains("dark") ? "oscuro" : "claro"
  );
});

init();
