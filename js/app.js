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

/* =========================
   INIT
========================= */
async function init() {
  try {
    rutas = await (await fetch("./data/rutas.json")).json();
    condiciones = await (await fetch("./data/condiciones.json")).json();
    llenarSelects();
    mostrarFavoritos();
    cargarTema();
  } catch (error) {
    resultadosDiv.textContent = "Error cargando datos 😢";
    console.error(error);
  }
}

/* =========================
   LLENAR SELECTS
========================= */
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

/* =========================
   EVENTOS UI
========================= */
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
    resultadosDiv.textContent = "⚠️ El origen y destino no pueden ser iguales";
    return;
  }

  const filtradas = cargarRutas(rutas, origen, destino);
  mostrarResultados(filtradas);
});

origenSelect.addEventListener("change", () => {
  resultadosDiv.innerHTML = "<p>Selecciona destino y pulsa buscar 🚍</p>";
});

destinoSelect.addEventListener("change", () => {
  resultadosDiv.innerHTML = "<p>Selecciona origen y pulsa buscar 🚍</p>";
});

/* =========================
   LÓGICA DE RUTAS
========================= */
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

    // ✅ ICONO SEGÚN TRANSPORTE
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

  lista.forEach(r => {
    const calc = calcularRuta(r);
    const div = document.createElement("div");
    div.className = "ruta";

    div.innerHTML = `
      🚍 ${r.transporte}<br>
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

/* =========================
   FAVORITOS
========================= */
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

/* =========================
   TEMA OSCURO / CLARO
========================= */
function cargarTema() {
  const temaGuardado = localStorage.getItem("tema");
  if (temaGuardado === "oscuro") {
    document.body.classList.add("dark");
    btnTema.textContent = "🌞 Tema claro";
  }
}

btnTema.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("tema", "oscuro");
    btnTema.textContent = "🌞 Tema claro";
  } else {
    localStorage.setItem("tema", "claro");
    btnTema.textContent = "🌙 Tema oscuro";
  }
});

/* =========================
   START
========================= */
init();
