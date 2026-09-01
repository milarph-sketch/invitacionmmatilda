// ============================================================
// MILAR — Generador de contratos
// ============================================================

// ---------- Presets por tipo de evento ----------
const PRESETS = {
  quince: {
    persona: 'quinceañera',
    eventoDesc: 'la fiesta de 15 años',
    cobertura: [
      { id: 'bookprevio', incluir: true, label: 'Book Previo en exteriores', detalle: 'un mes antes del evento, 1.30 hora', horas: 1.5 },
      { id: 'preparacion', incluir: false, label: 'Preparación de la quinceañera', detalle: '20 a 21 hs', horas: 1 },
      { id: 'ceremonia', incluir: false, label: 'Ceremonia religiosa', detalle: 'a confirmar', horas: 1 },
      { id: 'fiesta', incluir: true, label: 'Fiesta completa', detalle: 'hasta 8 horas', horas: 8 },
    ],
  },
  boda: {
    persona: 'novia',
    eventoDesc: 'el casamiento',
    cobertura: [
      { id: 'bookprevio', incluir: true, label: 'Book Previo en exteriores', detalle: 'un mes antes del evento, 1.30 hora', horas: 1.5 },
      { id: 'preparacion', incluir: true, label: 'Preparación de la novia', detalle: '20 a 21 hs', horas: 1 },
      { id: 'ceremonia', incluir: true, label: 'Ceremonia', detalle: 'a confirmar', horas: 1 },
      { id: 'fiesta', incluir: true, label: 'Fiesta completa', detalle: 'hasta 8 horas', horas: 8 },
    ],
  },
};

let coberturaState = [];

function renderCobertura() {
  const cont = document.getElementById('coberturaItems');
  cont.innerHTML = '';
  coberturaState.forEach((item, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'item-cobertura' + (item.incluir ? '' : ' desactivado');

    wrap.innerHTML = `
      <div class="check-row">
        <input type="checkbox" id="cob_incluir_${idx}" ${item.incluir ? 'checked' : ''}>
        <label for="cob_incluir_${idx}"><strong>${item.label}</strong></label>
      </div>
      <div class="fila3">
        <div class="campo" style="grid-column:1 / span 2;">
          <label for="cob_label_${idx}">Nombre del ítem</label>
          <input type="text" id="cob_label_${idx}" value="${item.label}">
        </div>
        <div class="campo">
          <label for="cob_horas_${idx}">Horas</label>
          <input type="number" id="cob_horas_${idx}" value="${item.horas}" step="0.5" min="0">
        </div>
      </div>
      <div class="campo">
        <label for="cob_detalle_${idx}">Detalle (aparece entre paréntesis)</label>
        <input type="text" id="cob_detalle_${idx}" value="${item.detalle}">
      </div>
    `;
    cont.appendChild(wrap);

    wrap.querySelector(`#cob_incluir_${idx}`).addEventListener('change', (e) => {
      coberturaState[idx].incluir = e.target.checked;
      renderCobertura();
      actualizarResumen();
    });
    wrap.querySelector(`#cob_label_${idx}`).addEventListener('input', (e) => {
      coberturaState[idx].label = e.target.value;
      actualizarResumen();
    });
    wrap.querySelector(`#cob_detalle_${idx}`).addEventListener('input', (e) => {
      coberturaState[idx].detalle = e.target.value;
      actualizarResumen();
    });
    wrap.querySelector(`#cob_horas_${idx}`).addEventListener('input', (e) => {
      coberturaState[idx].horas = parseFloat(e.target.value) || 0;
      actualizarResumen();
    });
  });
}

function aplicarPreset(tipo) {
  const preset = PRESETS[tipo];
  coberturaState = preset.cobertura.map(c => ({ ...c }));
  renderCobertura();
  actualizarResumen();
}

document.getElementById('tipoEvento').addEventListener('change', (e) => {
  aplicarPreset(e.target.value);
});

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
    // "uno" -> "un" cuando precede a un sustantivo masculino (mil, millón/millones)
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

// ---------- Fechas y horas ----------
function fechaLarga(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${d} de ${meses[m - 1]} de ${y}`;
}

function horaCorta(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hNum = parseInt(h, 10);
  return (m === '00') ? `${hNum}` : `${hNum}:${m}`;
}

// ---------- Resúmenes en vivo (para evitar errores antes de generar) ----------
function actualizarResumen() {
  const totalHoras = coberturaState.filter(c => c.incluir).reduce((acc, c) => acc + (c.horas || 0), 0);
  const desde = document.getElementById('horarioDesde').value;
  const hasta = document.getElementById('horarioHasta').value;
  document.getElementById('resumenCobertura').innerHTML =
    `<strong>Total de cobertura combinada:</strong> ${totalHoras} horas · <strong>Horario:</strong> desde las ${horaCorta(desde)} hasta las ${horaCorta(hasta)}`;

  const total = parseFloat(document.getElementById('valorTotal').value) || 0;
  const cuotas = parseInt(document.getElementById('cantidadCuotas').value) || 1;
  const letras = total > 0 ? numeroALetras(total) : '—';
  const { texto } = calcularCuotas(total, cuotas);
  document.getElementById('resumenPago').innerHTML =
    `<strong>Total:</strong> ${total > 0 ? formatARS(total) : '—'} (pesos ${letras})<br>` +
    `<strong>Forma de pago:</strong> ${texto}`;
}

function calcularCuotas(total, cantidad) {
  if (!total || !cantidad) return { texto: '—', montos: [] };
  const base = Math.floor(total / cantidad);
  const resto = total - base * cantidad;
  const montos = new Array(cantidad).fill(base);
  if (resto > 0) montos[cantidad - 1] += resto; // la última cuota absorbe el redondeo

  let texto;
  if (resto === 0) {
    texto = `${cantidad} cuota${cantidad > 1 ? 's' : ''} de ${formatARS(base)}${cantidad > 1 ? ' cada una' : ''}`;
  } else {
    texto = `${cantidad - 1} cuota${cantidad - 1 > 1 ? 's' : ''} de ${formatARS(base)} y 1 cuota de ${formatARS(montos[cantidad - 1])}`;
  }
  return { texto, montos };
}

// Escuchar cambios relevantes para refrescar los resúmenes en vivo
['horarioDesde', 'horarioHasta', 'valorTotal', 'cantidadCuotas'].forEach(id => {
  document.getElementById(id).addEventListener('input', actualizarResumen);
});

// ---------- Inicialización ----------
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('fechaContrato').value = new Date().toISOString().slice(0, 10);
  aplicarPreset('quince');
});

// ============================================================
// Generación del PDF
// ============================================================

const MARGIN = 20;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BORDO = [139, 58, 82];
const NEGRO = [38, 34, 35];

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

function ensureSpace(doc, y, needed) {
  if (y + needed > PAGE_H - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function drawParagraph(doc, text, y, opts = {}) {
  const {
    size = 10.5, font = 'Carlito', style = 'normal', color = NEGRO,
    x = MARGIN, maxWidth = CONTENT_W, lineHeight = 5.1, spacingAfter = 4.5,
  } = opts;
  doc.setFont(font, style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    y = ensureSpace(doc, y, lineHeight);
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y + spacingAfter;
}

function drawHeading(doc, num, text, y) {
  y = ensureSpace(doc, y, 14);
  y += 3.5;
  doc.setFont('Caladea', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(...BORDO);
  doc.text(`${num}. ${text}`, MARGIN, y);
  y += 6.2;
  return y;
}

function drawBullet(doc, text, y) {
  return drawParagraph(doc, `•  ${text}`, y, { x: MARGIN + 3, maxWidth: CONTENT_W - 3, spacingAfter: 1.8 });
}

function drawSpace(doc, y, h) {
  return y + h;
}

function drawCheckboxLine(doc, y, opciones) {
  y = ensureSpace(doc, y, 9);
  doc.setFont('Carlito', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...NEGRO);
  doc.setDrawColor(...NEGRO);
  doc.setLineWidth(0.35);
  const boxSize = 4.2;
  let x = MARGIN;
  opciones.forEach((label) => {
    doc.rect(x, y - boxSize + 1.2, boxSize, boxSize);
    doc.text(label, x + boxSize + 2.5, y);
    x += boxSize + 2.5 + doc.getTextWidth(label) + 14;
  });
  return y + 8.5;
}

function drawSignatureLine(doc, label, y) {
  y = ensureSpace(doc, y, 8);
  doc.setFont('Carlito', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...NEGRO);
  doc.text(`${label}: ______________________________________`, MARGIN, y);
  return y + 8;
}

function recopilarDatos() {
  const tipoEvento = document.getElementById('tipoEvento').value;
  const preset = PRESETS[tipoEvento];

  const clienteNombre = document.getElementById('clienteNombre').value.trim();
  const clienteDNI = document.getElementById('clienteDNI').value.trim();
  const clienteContacto = document.getElementById('clienteContacto').value.trim();
  const lugarContrato = document.getElementById('lugarContrato').value.trim() || 'Buenos Aires';
  const fechaContrato = document.getElementById('fechaContrato').value;
  const fechaEvento = document.getElementById('fechaEvento').value;
  const zonaEvento = document.getElementById('zonaEvento').value.trim();
  const lugarSalon = document.getElementById('lugarSalon').value.trim();

  const horarioDesde = document.getElementById('horarioDesde').value;
  const horarioHasta = document.getElementById('horarioHasta').value;

  const srv = {
    foto: document.getElementById('srv_foto').checked,
    video: document.getElementById('srv_video').checked,
    book: document.getElementById('srv_book').checked,
    paginas: document.getElementById('srv_paginas').value,
    pendrive: document.getElementById('srv_pendrive').checked,
    invitacion: document.getElementById('srv_invitacion').checked,
    edicion: document.getElementById('srv_edicion').checked,
  };

  const formatoFotos = document.getElementById('formatoFotos').value.trim() || 'JPG';
  const plazoMin = document.getElementById('plazoMin').value;
  const plazoMax = document.getElementById('plazoMax').value;
  const backupMeses = document.getElementById('backupMeses').value;

  const valorTotal = parseFloat(document.getElementById('valorTotal').value) || 0;
  const cantidadCuotas = parseInt(document.getElementById('cantidadCuotas').value) || 1;
  const primeraCuotaSena = document.getElementById('primeraCuotaSena').checked;
  const interesMora = document.getElementById('interesMora').value;
  const medioPago = document.getElementById('medioPago').value.trim() || 'transferencia bancaria';

  const redes = [];
  if (document.getElementById('img_instagram').checked) redes.push('Instagram');
  if (document.getElementById('img_tiktok').checked) redes.push('TikTok');
  if (document.getElementById('img_facebook').checked) redes.push('Facebook');

  const incluirLaser = document.getElementById('incluirLaser').checked;

  return {
    tipoEvento, preset, clienteNombre, clienteDNI, clienteContacto,
    lugarContrato, fechaContrato, fechaEvento, zonaEvento, lugarSalon,
    horarioDesde, horarioHasta, srv, formatoFotos, plazoMin, plazoMax, backupMeses,
    valorTotal, cantidadCuotas, primeraCuotaSena, interesMora, medioPago,
    redes, incluirLaser,
  };
}

function validar(data) {
  const faltantes = [];
  if (!data.clienteNombre) faltantes.push('Nombre del cliente');
  if (!data.fechaEvento) faltantes.push('Fecha del evento');
  if (!data.zonaEvento) faltantes.push('Zona del evento');
  if (!data.valorTotal || data.valorTotal <= 0) faltantes.push('Valor total del servicio');
  if (!coberturaState.some(c => c.incluir)) faltantes.push('Al menos un ítem de cobertura');
  return faltantes;
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

  let y = MARGIN;
  let seccion = 0;
  const sig = () => { seccion += 1; return seccion; };

  // --- Encabezado de marca ---
  doc.setFont('Caladea', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...BORDO);
  doc.text('MILAR', PAGE_W / 2, y, { align: 'center' });
  y += 6;
  doc.setFont('Carlito', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...BORDO);
  doc.text('f o t o g r a f í a', PAGE_W / 2, y, { align: 'center' });
  y += 10;

  doc.setFont('Caladea', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...NEGRO);
  const tituloLines = doc.splitTextToSize('CONTRATO DE PRESTACIÓN DE SERVICIOS FOTOGRÁFICOS Y DE VIDEO', CONTENT_W);
  tituloLines.forEach(line => {
    doc.text(line, PAGE_W / 2, y, { align: 'center' });
    y += 6;
  });
  y += 4;

  // --- Datos de cabecera ---
  y = drawParagraph(doc, `Lugar y fecha del contrato: ${data.lugarContrato}, ${fechaLarga(data.fechaContrato)}`, y);
  y = drawParagraph(doc, `Fecha del evento: ${fechaLarga(data.fechaEvento)}   —   Zona del evento: ${data.zonaEvento}`, y);
  y = drawParagraph(doc, `Fotógrafa / Productora: Milagros Arrighi – Milar.ph`, y);
  y = drawParagraph(doc, `Cliente: ${data.clienteNombre}`, y);
  y = drawParagraph(doc, `DNI: ${data.clienteDNI || '_____________________________________________________'}`, y);
  y = drawParagraph(doc, `Teléfono / Mail: ${data.clienteContacto || '_________________________________________'}`, y);

  // --- 1. Objeto del contrato ---
  y = drawHeading(doc, sig(), 'Objeto del contrato', y);
  y = drawParagraph(doc, `El presente contrato tiene por objeto regular los términos y condiciones bajo los cuales la fotógrafa brindará servicios de fotografía y video para ${data.preset.eventoDesc} del cliente, a realizarse en la ciudad de ${data.zonaEvento}, con fecha ${fechaLarga(data.fechaEvento)}.`, y);

  // --- 2. Detalles del evento ---
  y = drawHeading(doc, sig(), 'Detalles del evento', y);
  y = drawParagraph(doc, `Lugar específico (salón / iglesia): ${data.lugarSalon || 'NOMBRE DEL SALÓN'}`, y);
  y = drawParagraph(doc, 'El servicio incluye la cobertura de:', y, { spacingAfter: 1 });
  const activos = coberturaState.filter(c => c.incluir);
  activos.forEach(c => {
    y = drawBullet(doc, `${c.label}${c.detalle ? ` (${c.detalle})` : ''}`, y);
  });
  const totalHoras = activos.reduce((acc, c) => acc + (c.horas || 0), 0);
  y = drawBullet(doc, `Total de cobertura: hasta ${totalHoras} horas combinadas`, y);
  y += 2.5;
  y = drawParagraph(doc, `Horario estimado: desde las ${horaCorta(data.horarioDesde)} hasta las ${horaCorta(data.horarioHasta)}`, y);

  // --- 3. Servicios incluidos ---
  y = drawHeading(doc, sig(), 'Servicios incluidos', y);
  y = drawParagraph(doc, 'Este contrato incluye los siguientes servicios:', y, { spacingAfter: 1 });
  if (data.srv.foto) y = drawBullet(doc, 'Cobertura fotográfica profesional del evento', y);
  if (data.srv.video) y = drawBullet(doc, 'Cobertura de video profesional del evento', y);
  if (data.srv.book) y = drawBullet(doc, `Book de fotos previo y fotolibro tapa dura de ${data.srv.paginas} páginas`, y);
  if (data.srv.pendrive) y = drawBullet(doc, 'Entrega digital completa en pendrive', y);
  if (data.srv.invitacion) y = drawBullet(doc, 'Invitación digital de regalo', y);
  if (data.srv.edicion) y = drawBullet(doc, 'Edición de color y luz en todas las fotografías', y);
  y += 2.5;
  y = drawParagraph(doc, 'No se entrega material en crudo (RAW o sin editar), ya que el mismo no representa el trabajo final ni el estándar de calidad del servicio ofrecido.', y);

  // --- 4. Entrega del material ---
  y = drawHeading(doc, sig(), 'Entrega del material', y);
  y = drawParagraph(doc, `Las imágenes serán entregadas en alta resolución, en formato ${data.formatoFotos}, y el video editado se entregará en formato digital a través de un pendrive.`, y);
  y = drawParagraph(doc, `El plazo de entrega será de ${data.plazoMin} a ${data.plazoMax} días posteriores al evento, sujeto a la carga de trabajo y disponibilidad de la fotógrafa.`, y);
  y = drawParagraph(doc, `Todo el material estará disponible durante un período de ${data.backupMeses} meses posteriores a la entrega como BACKUP; transcurrido ese tiempo, la fotógrafa no tendrá obligación de conservar ni las fotografías ni el material de video.`, y);

  // --- 5. Honorarios y forma de pago ---
  y = drawHeading(doc, sig(), 'Honorarios y forma de pago', y);
  y = drawParagraph(doc, `Valor total del servicio: ${formatARS(data.valorTotal)} (pesos ${numeroALetras(data.valorTotal)})`, y);
  y = drawParagraph(doc, 'La fecha del evento se reserva únicamente con el pago de la seña.', y);
  y = drawParagraph(doc, 'Forma de pago:', y, { spacingAfter: 1 });
  const { texto: textoCuotas } = calcularCuotas(data.valorTotal, data.cantidadCuotas);
  y = drawBullet(doc, textoCuotas + (data.primeraCuotaSena ? ', donde la primera cuota funciona como seña' : ''), y);
  y = drawBullet(doc, 'Las cuotas son consecutivas, mes a mes, a partir de la reserva del servicio', y);
  y = drawBullet(doc, `Medio de pago: ${data.medioPago}`, y);
  y += 2.5;
  y = drawParagraph(doc, 'La seña no es reembolsable, ya que implica bloquear la fecha y rechazar otros trabajos. En caso de fuerza mayor, se buscarán alternativas de común acuerdo. Las cuotas serán consecutivas a partir del momento en que se realiza la reserva (pago de la seña).', y);
  y = drawParagraph(doc, `En caso de demora en el pago de alguna cuota, se aplicará un interés del ${data.interesMora}% mensual sobre el monto adeudado, hasta su regularización.`, y);
  y = drawParagraph(doc, 'El monto total del servicio deberá estar íntegramente abonado antes del evento, como condición para la prestación del mismo.', y);

  // --- 6. Uso de imagen ---
  y = drawHeading(doc, sig(), 'Uso de imagen', y);
  y = drawParagraph(doc, 'El cliente autoriza de manera opcional a la fotógrafa a utilizar algunas imágenes y/o fragmentos de video del evento exclusivamente con fines profesionales.', y);
  y = drawBullet(doc, `Redes sociales (${data.redes.length ? data.redes.join(', ') : 'a definir'})`, y);
  y += 2.5;
  y = drawParagraph(doc, 'El material no será comercializado ni cedido a terceros.', y);
  y = drawParagraph(doc, 'En caso de que el cliente no desee autorizar el uso de su imagen, deberá informarlo por escrito al momento de la firma del presente contrato.', y);
  y = drawParagraph(doc, 'Autorización de uso de imagen:', y, { spacingAfter: 2 });
  y = drawCheckboxLine(doc, y, ['SI autorizo', 'NO autorizo']);

  // --- 7. Modificaciones y cancelaciones ---
  y = drawHeading(doc, sig(), 'Modificaciones y cancelaciones', y);
  y = drawParagraph(doc, 'Cualquier modificación al presente contrato deberá ser acordada por ambas partes por escrito.', y);
  y = drawParagraph(doc, 'En caso de cancelación por parte del cliente, la seña será considerada como compensación por la reserva del tiempo de la fotógrafa.', y);
  y = drawParagraph(doc, 'Si la fotógrafa debiera cancelar, se devolverá al cliente el monto total de la seña recibida.', y);

  // --- 8. Responsabilidad ---
  y = drawHeading(doc, sig(), 'Responsabilidad', y);
  y = drawParagraph(doc, 'La fotógrafa se compromete a realizar su trabajo con la mayor profesionalidad posible, pero no se responsabiliza por circunstancias ajenas a su control que puedan afectar el servicio, tales como:', y, { spacingAfter: 1 });
  y = drawBullet(doc, 'Condiciones climáticas adversas', y);
  y = drawBullet(doc, 'Fallas técnicas inevitables', y);
  y = drawBullet(doc, 'Restricciones del lugar', y);
  y = drawBullet(doc, 'Interrupciones ajenas al servicio contratado', y);
  y += 2.5;

  // --- 9. Uso de láser en pista (opcional) ---
  if (data.incluirLaser) {
    y = drawHeading(doc, sig(), 'Uso de láser en pista', y);
    y = drawParagraph(doc, 'En caso de que el evento cuente con efectos de láser en la pista de baile, el cliente entiende y acepta que la fotógrafa no podrá registrar fotografía ni video mientras los lásers se encuentren activos, dado el riesgo que representan para los equipos y para la salud visual del equipo de trabajo.', y);
    y = drawParagraph(doc, 'Esto no implica perder cobertura del evento: es totalmente posible lograr un registro completo y de calidad coordinando con el DJ o proveedor de efectos tramos sin láser durante los momentos clave (entradas, primer baile, torta, brindis, etc.), dejando el láser para el resto de la pista libre.', y);
    y = drawParagraph(doc, 'Se recomienda al cliente conversar este punto con anticipación con el proveedor de efectos y/o el salón, para asegurar que dichos lapsos estén contemplados. La fotógrafa no se responsabiliza por la falta de registro en los tramos en que el láser esté en funcionamiento sin previo aviso o coordinación.', y);
  }

  // --- Garantía de cobertura ---
  y = drawHeading(doc, sig(), 'Garantía de cobertura y reemplazo profesional', y);
  y = drawParagraph(doc, 'En caso de que, por causa de fuerza mayor debidamente justificada (enfermedad grave, accidente u otra situación imprevista), la fotógrafa no pudiera presentarse al evento, se compromete a gestionar un reemplazo profesional de confianza, con experiencia comprobable en eventos sociales, que garantice un estándar de calidad equivalente al servicio contratado. Dicho reemplazo no implicará ningún costo adicional para el cliente.', y);

  // --- Aceptación ---
  y = drawHeading(doc, sig(), 'Aceptación', y);
  y = drawParagraph(doc, 'Leído y comprendido el presente contrato, ambas partes manifiestan su conformidad y lo firman en señal de aceptación.', y);

  y += 6;
  y = drawSignatureLine(doc, 'Firma del cliente', y);
  y = drawSignatureLine(doc, 'Aclaración', y);
  y = drawSignatureLine(doc, 'DNI', y);
  y = drawSignatureLine(doc, 'Fecha', y);
  y += 4;
  y = drawSignatureLine(doc, 'Firma de la fotógrafa', y);
  y = drawSignatureLine(doc, 'Aclaración', y);
  y = drawSignatureLine(doc, 'DNI', y);

  // --- Número de página ---
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFont('Carlito', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(150, 150, 150);
    doc.text(`${i} / ${totalPaginas}`, PAGE_W - MARGIN, PAGE_H - 10, { align: 'right' });
  }

  const fechaCompacta = data.fechaEvento ? data.fechaEvento.replace(/-/g, '') : 'sinfecha';
  const nombreArchivo = `Contrato_${fechaCompacta}_${data.clienteNombre.replace(/\s+/g, '_')}.pdf`;
  doc.save(nombreArchivo);
}

document.getElementById('generateBtn').addEventListener('click', generarPDF);
