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

El app tiene dos modos según el día de la semana:

| Tipo | Días | Items | Max score |
|------|------|-------|-----------|
| Día laboral | Lunes, Jueves, Viernes | Morning launch · Work AM (5 pomos) · Anchor · Work PM · Reset | 15 |
| Día de café | Martes, Miércoles | Igual que laboral + "Trabajé desde café" (no suma) | 15 |
| Fin de semana | Sábado, Domingo | Morning · Cuerpo · Con Claudette · Reset | 8 |

---

## Schema del Sheet

La hoja `Log` se crea automáticamente en el primer uso.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `date` | string `yyyy-MM-dd` | Fecha del registro |
| `b1–b3` | boolean | Morning launch (bañado, vestido, desayunado) |
| `a1–a5` | boolean | Pomos AM |
| `g1–g2` | boolean | Gym, comida real |
| `m1` | boolean | Meditación |
| `p1–p3` | boolean | Pomos PM |
| `r1` | boolean | Reset (caminar/leer) |
| `cafe_ex` | boolean | Trabajó desde café (no cuenta en score) |
| `log` | string | Registro libre del día |
| `score` | number | Total de ítems completados |

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
- **Dashboard semanal** — tab con historial semana a semana, navegable con ← →
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
├── index.html   # App completa (UI + lógica)
└── Code.gs      # Google Apps Script (backend)
```
