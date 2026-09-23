# Sovereign OS

Tracker diario personal. Registra hábitos, bloques de trabajo y score del día. Backend en Google Sheets, frontend en GitHub Pages.

**Live:** https://zzzzabbbbbb.github.io/sovereign-os/

---

## Stack

- **Frontend:** HTML/CSS/JS estático — sin dependencias, sin build step
- **Backend:** Google Apps Script (Web App) — lee y escribe en Google Sheets vía JSONP
- **Hosting:** GitHub Pages
- **DB:** Google Sheets (hoja `Log`)

---

## Estructura del día

El app tiene tres modos según el día de la semana:

| Tipo | Días | Max score |
|------|------|-----------|
| Día laboral | Lunes, Miércoles, Viernes | 23 |
| Día de café | Martes, Jueves | 23 (igual que laboral + "Trabajé desde café", que no suma) |
| Fin de semana | Sábado, Domingo | 12 |

### Días laborales y de café

| Bloque | Hora | Ítems (id) |
|--------|------|------------|
| Morning launch | 07:00–09:00 | `w1` Desperté a las 7 · `m1` Meditación · 15 min · `b1` Bañado · `b2` Vestido · `b3` Desayunado |
| Work AM | 09:00–14:00 | `a1–a5` Pomos AM · input `focus_am` |
| Anchor | 14:00–16:00 | `g1` Gym · `g2` Comida real |
| Work PM | 16:00–19:00 | `p1–p3` Pomos PM · `x1` Sin Play en horas de trabajo · input `focus_pm` · contador `units` |
| Reset | 19:00–21:00 | `r1` Caminé o leí · sin pantallas · `s1` Dormí a mi hora |
| Café (solo mar/jue) | — | `cafe_ex` Trabajé desde café (no suma) |

### Fin de semana

| Bloque | Hora | Ítems (id) |
|--------|------|------------|
| Morning | 07:00–10:00 | `w1` Desperté antes de las 9 · `b1` Bañado · `b2` Vestido · `b3` Desayunado |
| Cuerpo | Mañana | `g1` Gym |
| Reset | Noche | `r1` Caminé o leí · sin pantallas · `s1` Dormí a mi hora |

`w1` siempre significa "desperté a tiempo" y `m1` siempre "meditación". Los registros viejos de fin de semana con `m1` se migran a `w1` al cargarlos.

### Bloque Mente (todos los días)

Nueve ítems `n1–n9`, cada uno vale 5/9 de punto (5 pts en total):

Sin doomscrolling al despertar · Evité sabotaje digital · Regulé impulsos · Evité anestesiarme · Sostuve incomodidad · Elegí presencia · Actué con coherencia · Me hice responsable de mi energía · Cerré el día con claridad.

### Score

`max = ítems físicos del tipo de día + 5 (Mente)`, calculado en `getMax()`:

- Laboral / café: 18 físicos + 5 = **23**
- Fin de semana: 7 físicos + 5 = **12**

### Foco y avance

- `focus_am` / `focus_pm`: texto corto "¿En qué trabajaste?" al final de cada bloque de trabajo.
- `units`: contador "Avance del día" (módulos, lecciones, labs).
- No suman al score. Son registro.
- El dashboard muestra pomodoros de la semana, avance total y la lista de focos. La meta semanal de avance es opcional: toca la tarjeta de Avance para fijarla (se guarda en `localStorage` como `sov_units_target`).
- No hay nombres de cursos o metas en el código: todo lo específico lo escribes tú en la UI.

### Nunca dos seguidos

Cada día se compara con su **día comparable anterior**: el primer día hacia atrás (hasta 7) del mismo grupo. Laboral y café son un grupo, fin de semana otro. El lunes se compara con el viernes y el sábado con el domingo anterior.

- **Vista del día**: los ítems que no se marcaron el día comparable muestran una marca ámbar ("ayer no", "vie no"…). Hoy no puedes fallarlos.
- **Resumen semanal (lunes)** y **reporte IA semanal**: lista de ítems fallados dos días comparables seguidos.
- Si el día comparable no tiene datos (no se abrió la app), no se marca nada.

`s1` (Dormí a mi hora) normalmente se marca al día siguiente: navega con ← a la fecha anterior.

---

## Contrato con el backend

`save` envía, por GET vía JSONP:

```
?action=save&date=yyyy-MM-dd&payload=<JSON>&callback=<fn>
payload = { checks: {id: bool}, log, focus_am, focus_pm, units, score }
```

`get` (`?action=get&date=yyyy-MM-dd&callback=<fn>`) debe devolver `{ checks, log, focus_am, focus_pm, units }`.

### Schema de la hoja `Log`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `date` | string `yyyy-MM-dd` | Fecha del registro |
| `w1`, `m1`, `b1–b3` | boolean | Morning launch |
| `a1–a5`, `p1–p3` | boolean | Pomos AM / PM |
| `g1–g2` | boolean | Gym, comida real |
| `x1` | boolean | Sin Play en horas de trabajo |
| `r1`, `s1` | boolean | Reset (caminar/leer, dormir a mi hora) |
| `n1–n9` | boolean | Bloque Mente |
| `cafe_ex` | boolean | Trabajó desde café (no cuenta en score) |
| `log` | string | Registro libre del día |
| `focus_am`, `focus_pm` | string | En qué trabajó en cada bloque |
| `units` | number | Avance del día |
| `score` | number | Score del día (con decimales por Mente) |

> `Code.gs` vive en el proyecto de Apps Script vinculado al Sheet (Extensiones → Apps Script), no en este repo. Guarda columnas fijas (`CHECK_IDS`), así que necesita `w1`, `x1`, `s1`, `focus_am`, `focus_pm` y `units` para que persistan. Después de editarlo: Deploy → Manage deployments → Edit → New version → Deploy.

---

## Setup

### 1. Google Apps Script

1. Crea un Google Sheet en [sheets.google.com](https://sheets.google.com)
2. Copia el ID de la URL: `https://docs.google.com/spreadsheets/d/ESTE_ID/edit`
3. **Extensiones → Apps Script** → borra el código default → pega `Code.gs`
4. Reemplaza la línea 1: `const SS_ID = 'tu_id_aqui';`
5. Guarda (`Cmd+S`) y nómbralo `Sovereign OS`
6. **Deploy → New deployment → engranaje → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Autoriza los permisos y copia la URL (`https://script.google.com/macros/s/.../exec`)

> Si modificas `Code.gs` después: Deploy → Manage deployments → Edit → New version → Deploy.

### 2. GitHub Pages

```bash
git clone https://github.com/zzzzabbbbbb/sovereign-os.git
cd sovereign-os
# hacer cambios...
git add . && git commit -m "msg" && git push
```

GitHub Pages se actualiza automáticamente en ~1 minuto.

### 3. Conectar

1. Abre la URL de GitHub Pages
2. Pega la URL del GAS → **Conectar**
3. La URL se guarda en `localStorage` — no hace falta volver a pegarla

Para usar desde el celular: agrega la URL a la pantalla de inicio (Safari → Compartir → Agregar a inicio).

---

## Funcionalidades

- **Navegación por día** — flechas ← → para moverse entre fechas
- **Auto-save** — guarda 1.5s después del último cambio
- **Guardar manual** — botón en la barra de navegación
- **Score en tiempo real** — color verde/amarillo/rojo según porcentaje completado
- **Dashboard semanal** — tab con historial semana a semana, navegable con ← →, pomodoros, avance y focos
- **Heatmap** — últimos 35 días
- **Racha** — días consecutivos ≥80%
- **Resumen semanal** — modal los lunes con score, mejor día, ítem más fallado y fallados dos seguidos
- **Reportes IA** — botones que copian el reporte del día o de la semana al portapapeles
- **Offline-tolerant** — si el GAS no responde, la UI sigue funcionando (sin persistir)

---

## Desarrollo local

No hay build. Abre `index.html` directamente en el browser o usa cualquier servidor estático:

```bash
npx serve .
# o
python3 -m http.server
```

---

## Archivos

```
sovereign-os/
├── index.html      # App completa (UI + lógica)
├── manifest.json   # PWA
└── icon*.png       # Íconos

Code.gs (backend) vive en el proyecto de Apps Script, no en el repo.
```
