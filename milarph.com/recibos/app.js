// ============================================================
// MILAR — Generador de recibos
// ============================================================

// ---------- Número a letras (pesos, español) ----------
function numeroALetras(num) {
  num = Math.round(Math.abs(num));
  if (num === 0) return 'cero';

  const UNIDADES = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const ESPECIALES = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
    'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
  const DECENAS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const CENTENAS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  function apocope(palabra) {
    if (palabra.endsWith('uno')) return palabra.slice(0, -3) + 'ún';
    return palabra;
  }

  function convertirDecenasYUnidades(n) {
    if (n < 10) return UNIDADES[n];
    if (n < 30) return ESPECIALES[n - 10];
    const d = Math.floor(n / 10);
    const u = n % 10;
    if (u === 0) return DECENAS[d];
    return DECENAS[d] + ' y ' + UNIDADES[u];
  }

  function convertirCentena(n) {
    if (n === 0) return '';
    if (n === 100) return 'cien';
    const c = Math.floor(n / 100);
    const resto = n % 100;
    let s = '';
    if (c > 0) s += CENTENAS[c];
    if (resto > 0) s += (s ? ' ' : '') + convertirDecenasYUnidades(resto);
    return s;
  }

  function convertirMiles(n) {
    if (n < 1000) return convertirCentena(n);
    const miles = Math.floor(n / 1000);
    const resto = n % 1000;
    let s = '';
    if (miles === 1) {
      s = 'mil';
    } else {
      s = apocope(convertirCentena(miles)) + ' mil';
    }
    if (resto > 0) s += ' ' + convertirCentena(resto);
    return s;
  }

  function convertirMillones(n) {
    if (n < 1000000) return convertirMiles(n);
    const millones = Math.floor(n / 1000000);
    const resto = n % 1000000;
    let s = '';
    if (millones === 1) {
      s = 'un millón';
    } else {
      s = apocope(convertirMiles(millones)) + ' millones';
    }
    if (resto > 0) s += ' ' + convertirMiles(resto);
    return s;
  }

  return convertirMillones(num).replace(/\s+/g, ' ').trim();
}

function formatARS(n) {
  return '$' + Math.round(n).toLocaleString('es-AR');
}

function fechaLarga(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${d} de ${meses[m - 1]} de ${y}`;
}

// ---------- Chips de concepto rápido ----------
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.getElementById('concepto').value = chip.dataset.val;
  });
});

// ---------- Número de recibo autoincremental (guardado en este dispositivo) ----------
const LS_KEY = 'milar_ultimo_recibo';

function sugerirNumeroRecibo() {
  const ultimo = parseInt(localStorage.getItem(LS_KEY) || '0', 10);
  const siguiente = ultimo + 1;
  return String(siguiente).padStart(4, '0');
}

function guardarNumeroRecibo(numero) {
  const n = parseInt(numero, 10);
  if (!isNaN(n)) localStorage.setItem(LS_KEY, String(n));
}

// ---------- Resumen en vivo ----------
function actualizarResumen() {
  const monto = parseFloat(document.getElementById('monto').value) || 0;
  const saldo = parseFloat(document.getElementById('saldoPendiente').value) || 0;
  const letras = monto > 0 ? numeroALetras(monto) : '—';
  let html = `<strong>Monto:</strong> ${monto > 0 ? formatARS(monto) : '—'} (pesos ${letras})`;
  if (saldo > 0) {
    html += `<br><strong>Saldo pendiente:</strong> ${formatARS(saldo)} (pesos ${numeroALetras(saldo)})`;
  } else {
    html += `<br><strong>Saldo pendiente:</strong> sin saldo (pago saldado)`;
  }
  document.getElementById('resumenRecibo').innerHTML = html;
}

['monto', 'saldoPendiente'].forEach(id => {
  document.getElementById(id).addEventListener('input', actualizarResumen);
});

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('fechaRecibo').value = new Date().toISOString().slice(0, 10);
  document.getElementById('numeroRecibo').value = sugerirNumeroRecibo();
  actualizarResumen();
});

// ============================================================
// Generación del PDF
// ============================================================

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BORDO = [139, 58, 82];
const BORDO_OSCURO = [94, 37, 57];
const NEGRO = [38, 34, 35];
const ROSA_CLARA = [244, 225, 230];

function registrarFuentes(doc) {
  doc.addFileToVFS('Caladea-Bold.ttf', FONT_CALADEA_BOLD);
  doc.addFont('Caladea-Bold.ttf', 'Caladea', 'bold');
  doc.addFileToVFS('Caladea-Regular.ttf', FONT_CALADEA_REGULAR);
  doc.addFont('Caladea-Regular.ttf', 'Caladea', 'normal');
  doc.addFileToVFS('Carlito-Regular.ttf', FONT_CARLITO_REGULAR);
  doc.addFont('Carlito-Regular.ttf', 'Carlito', 'normal');
  doc.addFileToVFS('Carlito-Bold.ttf', FONT_CARLITO_BOLD);
  doc.addFont('Carlito-Bold.ttf', 'Carlito', 'bold');
}

function recopilarDatos() {
  return {
    numeroRecibo: document.getElementById('numeroRecibo').value.trim() || '—',
    fechaRecibo: document.getElementById('fechaRecibo').value,
    clienteNombre: document.getElementById('clienteNombre').value.trim(),
    monto: parseFloat(document.getElementById('monto').value) || 0,
    concepto: document.getElementById('concepto').value.trim(),
    formaPago: document.getElementById('formaPago').value,
    saldoPendiente: parseFloat(document.getElementById('saldoPendiente').value) || 0,
  };
}

function validar(data) {
  const faltantes = [];
  if (!data.clienteNombre) faltantes.push('Cliente (recibí de)');
  if (!data.fechaRecibo) faltantes.push('Fecha');
  if (!data.monto || data.monto <= 0) faltantes.push('Monto');
  if (!data.concepto) faltantes.push('Concepto');
  return faltantes;
}

function drawWrapped(doc, text, x, y, maxWidth, opts = {}) {
  const { size = 10.5, font = 'Carlito', style = 'normal', color = NEGRO, lineHeight = 5 } = opts;
  doc.setFont(font, style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach(line => {
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

function generarPDF() {
  const errBox = document.getElementById('errorMsg');
  errBox.style.display = 'none';

  const data = recopilarDatos();
  const faltantes = validar(data);
  if (faltantes.length) {
    errBox.textContent = 'Faltan completar: ' + faltantes.join(', ') + '.';
    errBox.style.display = 'block';
    errBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  registrarFuentes(doc);

  const cardX = MARGIN;
  const cardY = 22;
  const cardW = CONTENT_W;
  const padX = 10;
  let y = cardY;

  // --- Marco de la tarjeta ---
  doc.setDrawColor(...BORDO);
  doc.setLineWidth(0.6);

  // --- Encabezado de marca ---
  y += 12;
  doc.setFont('Caladea', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...BORDO);
  doc.text('MILAR', cardX + cardW / 2, y, { align: 'center' });
  y += 5.5;
  doc.setFont('Carlito', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...BORDO);
  doc.text('f o t o g r a f í a', cardX + cardW / 2, y, { align: 'center' });
  y += 9;

  doc.setFont('Caladea', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...NEGRO);
  doc.text('RECIBO DE PAGO', cardX + cardW / 2, y, { align: 'center' });
  y += 3;

  // línea sutil
  doc.setDrawColor(...BORDO);
  doc.setLineWidth(0.3);
  doc.line(cardX + padX, y, cardX + cardW - padX, y);
  y += 9;

  // --- N° y fecha ---
  doc.setFont('Carlito', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...NEGRO);
  doc.text(`Recibo N°: ${data.numeroRecibo}`, cardX + padX, y);
  doc.text(`Fecha: ${fechaLarga(data.fechaRecibo)}`, cardX + cardW - padX, y, { align: 'right' });
  y += 10;

  // --- Recibí de ---
  doc.setFont('Carlito', 'bold');
  doc.setFontSize(10.5);
  doc.text('Recibí de:', cardX + padX, y);
  doc.setFont('Carlito', 'normal');
  doc.text(data.clienteNombre, cardX + padX + 26, y);
  y += 10;

  // --- Bloque de monto (degradado bordó, texto blanco) ---
  const montoBoxH = 20;
  const steps = 40;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r = BORDO[0] + (BORDO_OSCURO[0] - BORDO[0]) * t;
    const g = BORDO[1] + (BORDO_OSCURO[1] - BORDO[1]) * t;
    const b = BORDO[2] + (BORDO_OSCURO[2] - BORDO[2]) * t;
    doc.setFillColor(r, g, b);
    doc.rect(cardX + padX + (cardW - 2 * padX) * (i / steps), y, (cardW - 2 * padX) / steps + 0.5, montoBoxH, 'F');
  }
  doc.setFont('Caladea', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(formatARS(data.monto), cardX + cardW / 2, y + 9, { align: 'center' });
  doc.setFont('Carlito', 'normal');
  doc.setFontSize(9);
  doc.text(`(pesos ${numeroALetras(data.monto)})`, cardX + cardW / 2, y + 16, { align: 'center' });
  y += montoBoxH + 10;

  // --- Concepto ---
  doc.setFont('Carlito', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...NEGRO);
  doc.text('En concepto de:', cardX + padX, y);
  y += 5.5;
  y = drawWrapped(doc, data.concepto, cardX + padX, y, cardW - 2 * padX, { font: 'Carlito', style: 'normal', size: 10.5 });
  y += 5;

  // --- Forma de pago ---
  doc.setFont('Carlito', 'bold');
  doc.setFontSize(10.5);
  doc.text('Forma de pago:', cardX + padX, y);
  doc.setFont('Carlito', 'normal');
  doc.text(data.formaPago, cardX + padX + 33, y);
  y += 9;

  // --- Saldo pendiente ---
  doc.setFillColor(...ROSA_CLARA);
  const saldoBoxH = 12;
  doc.roundedRect(cardX + padX, y, cardW - 2 * padX, saldoBoxH, 2, 2, 'F');
  doc.setFont('Carlito', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...BORDO_OSCURO);
  if (data.saldoPendiente > 0) {
    doc.text(`Saldo pendiente: ${formatARS(data.saldoPendiente)} (pesos ${numeroALetras(data.saldoPendiente)})`, cardX + cardW / 2, y + 7.5, { align: 'center' });
  } else {
    doc.text('Sin saldo pendiente — pago saldado', cardX + cardW / 2, y + 7.5, { align: 'center' });
  }
  y += saldoBoxH + 12;

  // --- Firma ---
  doc.setFont('Carlito', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...NEGRO);
  doc.text('Firma: ________________________________', cardX + padX, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(...BORDO);
  doc.text('Milagros Arrighi — Milar.ph', cardX + padX, y);
  y += 8;

  // --- Marco alrededor de toda la tarjeta ---
  doc.setDrawColor(...BORDO);
  doc.setLineWidth(0.6);
  doc.roundedRect(cardX, cardY, cardW, y - cardY, 3, 3, 'S');

  guardarNumeroRecibo(data.numeroRecibo);

  const fechaCompacta = data.fechaRecibo ? data.fechaRecibo.replace(/-/g, '') : 'sinfecha';
  const nombreArchivo = `Recibo_${data.numeroRecibo}_${fechaCompacta}_${data.clienteNombre.replace(/\s+/g, '_')}.pdf`;
  doc.save(nombreArchivo);
}

document.getElementById('generateBtn').addEventListener('click', generarPDF);
