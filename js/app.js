import { guardarFavorito, obtenerFavoritos } from './storage.js';
import { cargarRutas } from './routes.js';

const form = document.getElementById('form-busqueda');
const origenSelect = document.getElementById('origen');
const destinoSelect = document.getElementById('destino');
const resultadosDiv = document.getElementById('resultados');
const favoritosDiv = document.getElementById('favoritos');

let rutas = [];
let condiciones = [];

async function init() {
  try {
    rutas = await (await fetch('./data/rutas.json')).json();
    condiciones = await (await fetch('./data/condiciones.json')).json();
    llenarSelects();
    mostrarFavoritos();
  } catch (error) {
    resultadosDiv.textContent = 'Error cargando datos 😢';
    console.error(error);
  }
}

function llenarSelects() {
  const origenes = [...new Set(rutas.map(r => r.origen))];
  const destinos = [...new Set(rutas.map(r => r.destino))];

  origenSelect.innerHTML = '<option value="">Seleccione origen</option>';
  destinoSelect.innerHTML = '<option value="">Seleccione destino</option>';

  origenes.forEach(o => origenSelect.innerHTML += `<option value="${o}">${o}</option>`);
  destinos.forEach(d => destinoSelect.innerHTML += `<option value="${d}">${d}</option>`);
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const origen = origenSelect.value;
  const destino = destinoSelect.value;

  if (!origen || !destino) {
    resultadosDiv.textContent = '⚠️ Selecciona origen y destino';
    return;
  }
  if (origen === destino) {
    resultadosDiv.textContent = '⚠️ No pueden ser iguales';
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

  return { ...ruta, tiempo: Math.round(tiempo), costo };
}

function mostrarResultados(lista) {
  resultadosDiv.innerHTML = '';

  if (lista.length === 0) {
    resultadosDiv.textContent = '❌ No hay rutas disponibles';
    return;
  }

  lista.forEach(r => {
    const calc = calcularRuta(r);
    const div = document.createElement('div');
    div.className = 'ruta';
    div.innerHTML = `🚍 ${r.transporte} | ⏱️ ${calc.tiempo} min | 💰 RD$${calc.costo} | 🔄 ${r.transbordos}`;

    const btn = document.createElement('button');
    btn.textContent = 'Guardar';
    btn.onclick = () => {
      guardarFavorito(r);
      mostrarFavoritos();
    };

    div.appendChild(btn);
    resultadosDiv.appendChild(div);
  });
}

function mostrarFavoritos() {
  const favs = obtenerFavoritos();
  favoritosDiv.innerHTML = '';

  if (favs.length === 0) {
    favoritosDiv.textContent = 'No hay favoritos ⭐';
    return;
  }

  favs.forEach(f => {
    const div = document.createElement('div');
    div.textContent = `📍 ${f.origen} → ${f.destino}`;
    favoritosDiv.appendChild(div);
  });
}

init();
