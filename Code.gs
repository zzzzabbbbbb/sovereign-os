// Sovereign OS · backend (Google Apps Script)
// El ID del Sheet NO va en el código. Opciones:
//  a) Script vinculado al Sheet (Extensiones → Apps Script): no hace falta nada.
//  b) Script independiente: Project Settings → Script Properties → SS_ID = <id del Sheet>.
const SH_NAME  = 'Log';
const CHECK_IDS = ['b1','b2','b3','a1','a2','a3','a4','a5','g1','g2','m1','p1','p2','p3','r1','n1','n2','n3','n4','n5','n6','n7','n8','n9'];
// v2: columnas nuevas AL FINAL para no mover las existentes
const EXTRA_IDS  = ['w1','x1','s1'];
const EXTRA_TEXT = ['focus_am','focus_pm','units'];
const COLS     = ['date',...CHECK_IDS,'cafe_ex','log','score',...EXTRA_IDS,...EXTRA_TEXT];
const col      = name => COLS.indexOf(name);

function fmtDate(val) {
  if (!val) return '';
  if (val instanceof Date)
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(val).slice(0, 10);
}

function getSheet() {
  const id = PropertiesService.getScriptProperties().getProperty('SS_ID');
  const ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Configura SS_ID en Script Properties');
  let sh = ss.getSheetByName(SH_NAME);
  if (!sh) {
    sh = ss.insertSheet(SH_NAME);
    sh.appendRow(COLS);
    sh.getRange(1,1,1,COLS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  } else if (sh.getLastColumn() < COLS.length) {
    // hoja vieja: agrega los encabezados nuevos
    sh.getRange(1,1,1,COLS.length).setValues([COLS]).setFontWeight('bold');
  }
  return sh;
}

function doGet(e) {
  const action   = e.parameter.action || 'get';
  const date     = e.parameter.date   || '';
  const callback = e.parameter.callback;

  let result;
  try {
    if (action === 'get') {
      result = getDayData(date);
    } else if (action === 'save') {
      // e.parameter ya viene decodificado; decodificar otra vez rompe con textos que llevan '%'
      const payload = JSON.parse(e.parameter.payload || '{}');
      saveDayData(date, payload);
      result = { ok: true };
    } else {
      result = { error: 'unknown action' };
    }
  } catch(err) {
    result = { error: err.message };
  }

  const json = JSON.stringify(result);
  const out  = callback ? callback + '(' + json + ')' : json;
  const mime = callback
    ? ContentService.MimeType.JAVASCRIPT
    : ContentService.MimeType.JSON;
  return ContentService.createTextOutput(out).setMimeType(mime);
}

const isTrue = v => v === true || v === 'TRUE';

function getDayData(date) {
  if (!date) return { checks: {}, log: '' };
  const sh   = getSheet();
  const data = sh.getDataRange().getValues();
  const row  = data.slice(1).find(r => fmtDate(r[0]) === date);
  if (!row) return { checks: {}, log: '' };

  const checks = {};
  CHECK_IDS.forEach(id => { checks[id] = isTrue(row[col(id)]); });
  checks['cafe_ex'] = isTrue(row[col('cafe_ex')]);
  // en filas viejas estas celdas están vacías: se dejan sin definir
  EXTRA_IDS.forEach(id => {
    const v = row[col(id)];
    if (v !== '' && v !== undefined) checks[id] = isTrue(v);
  });

  return {
    checks,
    log:      row[col('log')] || '',
    focus_am: row[col('focus_am')] || '',
    focus_pm: row[col('focus_pm')] || '',
    units:    Number(row[col('units')]) || 0
  };
}

function saveDayData(date, payload) {
  const { checks = {}, log } = payload;
  const sh    = getSheet();
  const score = typeof payload.score === 'number'
    ? payload.score
    : CHECK_IDS.filter(id => checks[id]).length;
  const row   = [
    date,
    ...CHECK_IDS.map(id => !!checks[id]),
    !!checks['cafe_ex'],
    log || '',
    score,
    ...EXTRA_IDS.map(id => !!checks[id]),
    payload.focus_am || '',
    payload.focus_pm || '',
    Number(payload.units) || 0
  ];

  const data     = sh.getDataRange().getValues();
  const rowIndex = data.slice(1).findIndex(r => fmtDate(r[0]) === date);

  if (rowIndex >= 0) {
    sh.getRange(rowIndex + 2, 1, 1, row.length).setValues([row]);
  } else {
    sh.appendRow(row);
  }
}
