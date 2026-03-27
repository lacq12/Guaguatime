export function cargarRutas(rutas, origen, destino) {
  return rutas.filter(r => r.origen === origen && r.destino === destino);
}