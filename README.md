# Mi BFF Duo

Nia y Ruby, tus dos BFF virtuales en el mismo cuarto: platica con una, con la otra, o con las dos a la vez. Siempre paradas juntas en el centro del cuarto, sin celular en la mano.

- **Nia** — pelo largo plata/negro, tranquila y dulce. **API: Gemini** (`gemini-3.6-flash` / `gemini-3.5-flash-lite`). Es la única que ve fotos: el botón 📷 le manda la foto y la comenta con Gemini (necesita tu llave gratis de Gemini en Ajustes → Llaves).
- **Ruby** — pelo largo rojo/blanco, atrevida y directa. **API: Groq** (`qwen/qwen3-32b`, respaldo `openai/gpt-oss-120b`). No ve fotos, su API no tiene visión.
- **Respaldo gratis, sin tarjeta:** Pollinations (sin llave) para las dos, si no hay llave o el proveedor falla. Si un modelo ya no existe, se consulta `/models` y se usa otro.
- **Chat en grupo:** botones Nia / Ruby / Ambas. En modo Ambas, Nia contesta primero con Gemini y Ruby reacciona en una frase corta con Groq. Cada una tiene su propio historial y su voz (Nia más aguda, Ruby más grave).
- **Modo +18 (solo texto):** opcional en ⚙, apagado por defecto, con confirmación de mayoría de edad. Límites duros en el prompt y en `guard()`: todo entre adultos, nada con menores (si hay señal de menor, el modo se apaga solo), consentimiento, nada de incesto/bestialidad/personas reales, nunca imágenes. La memoria de largo plazo solo existe en +18: guarda lo que le encantó (máx 30 recuerdos, se retoman los últimos 5 en el prompt), es por reglas (regex), no es memoria real de la IA. También hay detección de tono, generador de escenarios, reacción física y registro de límites (intensidad 1–10 y lista de "no").
- **Escena:** cuarto fijo con ventana a la ciudad de noche, hecho en CSS. Las dos en el mismo cuadro, en la misma foto-escena, con animaciones CSS sincronizadas: respiración, balanceo, movimiento de pelo, parpadeo estilizado, mirada que sigue al cursor, brillo al hablar y reacción cuando habla la otra. No hay videos, no hay clips, no hay poses por separado: así no se enciman ni se ven mal. No hay modo selfie ni celular en mano.
- **Voz:** voz del sistema por nombre (en Android suelen ser las de Google) y velocidad 75%–150%, en Ajustes. Micrófono con reconocimiento de voz donde el navegador lo permite.
- **Investigar:** escribe "investiga …" y buscan en Wikipedia + DuckDuckGo.
- **Versión:** una sola constante `VERSION` en `js/app.js`; el service worker se registra como `sw.js?v=VERSION` y nombra su caché con ella. Imágenes: stale-while-revalidate.
- **Pruebas:** `node tests/guard.test.mjs` (filtro de menores y límites +18, y que Nia usa Gemini y Ruby usa Groq).

Todos los datos se quedan en el dispositivo del usuario (localStorage, prefijo `bffduo_`): `bffduo_cfg`, `bffduo_hist` (máx 200), `bffduo_profile`, `bffduo_memories` (máx 30, solo +18), `bffduo_limits`, `bffduo_groq`, `bffduo_gemini`, `bffduo_models_*`, `bffduo_stats`, `bffduo_ucount`, `bffduo_tone`, `bffduo_scenarios`. Las llaves se guardan solo en el navegador y se mandan directo al proveedor.

## Desplegar en GitHub Pages

1. Crea el repo `mi-bff-duo` en GitHub (todavía no creado).
2. Sube todo el contenido de esta carpeta a la rama `main`.
3. Activa Pages: Settings → Pages → Deploy from a branch → `main` / `/ (root)`.
4. Abre `https://<tu-usuario>.github.io/mi-bff-duo/`.

## Archivos

- `index.html` — escena + chat
- `css/app.css` — cuarto, animaciones, chat, Ajustes
- `js/ai.js` — cerebro dual: guard, proveedores por personaje, investigación, perfil, memoria +18, tono, escenarios, límites
- `js/app.js` — UI, chat en grupo, foto, micrófono, Ajustes
- `js/voice.js` — voz del sistema y reconocimiento
- `sw.js`, `manifest.webmanifest`, `.nojekyll`
- `img/nia.jpg`, `img/ruby.jpg` — fotos originales de la usuaria, sin celular
- `tests/guard.test.mjs`
