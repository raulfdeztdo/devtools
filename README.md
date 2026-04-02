# `</devTools>`

Suite de herramientas de desarrollo completamente offline, construida con Vue 3, Tailwind CSS y Vite. Todo el procesamiento ocurre en el navegador — ningún dato sale del dispositivo.

![Vue.js](https://img.shields.io/badge/Vue.js-3.3-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white)
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR_SITE_ID/deploy-status)](https://devtoolset.netlify.app/)

**[https://devtoolset.netlify.app/](https://devtoolset.netlify.app/)**

---

## Herramientas incluidas (29)

### JSON

| Herramienta | Descripcion |
|---|---|
| **JSONLint** | Valida, formatea y minifica JSON con deteccion de errores en tiempo real y resaltado de sintaxis. |
| **JSON Schema Validator** | Valida documentos JSON contra un esquema JSON (Draft 04, 07, 2019-09, 2020-12) usando AJV. Muestra errores detallados con la ubicacion exacta del problema. |
| **JSON Compare** | Compara dos documentos JSON con diff visual lado a lado. Detecta adiciones, eliminaciones y modificaciones a nivel de clave/valor. |

### Codificacion y conversion

| Herramienta | Descripcion |
|---|---|
| **Base64 Converter** | Codifica y decodifica texto y archivos en Base64. Permite descargar el resultado. |
| **URL Converter** | Codifica y decodifica URLs, parsea parametros de consulta automaticamente y permite construir URLs de forma interactiva. |
| **HTML Entities** | Codifica y decodifica entidades HTML como `&amp;`, `&lt;`, `&gt;` y mas. |
| **JWT Decoder** | Decodifica tokens JWT y visualiza header, payload y firma. Sin verificacion remota. |
| **PHP Serializer** | Convierte entre JSON y el formato `serialize()` de PHP en ambas direcciones. |
| **YAML <-> JSON** | Convierte entre YAML y JSON de forma bidireccional. |
| **TOML <-> JSON** | Convierte entre TOML y JSON de forma bidireccional. |
| **XML <-> JSON** | Convierte entre XML y JSON de forma bidireccional. |

### Generadores

| Herramienta | Descripcion |
|---|---|
| **UUID Generator** | Genera identificadores UUID en versiones v1, v3, v4 y v5. Generacion en lotes hasta 1000 UUIDs. |
| **Password Generator** | Genera contrasenas seguras con control granular sobre caracteres, longitud y medidor de seguridad en tiempo real. |
| **Hash Generator** | Genera hashes MD5, SHA-1, SHA-256 y SHA-512 de texto. Todo se procesa localmente. |
| **Lorem Ipsum** | Genera texto de relleno Lorem Ipsum por parrafos, frases o palabras. |
| **QR Generator** | Genera codigos QR desde cualquier texto o URL. Se genera localmente en el navegador. |
| **Color Palette Generator** | Genera paletas de colores con seis algoritmos de armonia. Exporta en HEX, RGB y HSL e incluye verificacion de contraste WCAG. |
| **Favicon Generator** | Genera favicons en multiples tamanos a partir de texto, emoji o imagen. |

### Formateo y texto

| Herramienta | Descripcion |
|---|---|
| **SQL Formatter** | Formatea y embellece consultas SQL para mejorar su legibilidad. |
| **CSS / JS Minifier** | Minifica y formatea codigo CSS y JavaScript con Prettier. |
| **Markdown Preview** | Editor Markdown con vista previa en tiempo real y exportacion HTML. |
| **Text Diff** | Compara dos textos y resalta las diferencias linea por linea. |
| **Case Converter** | Convierte texto entre camelCase, snake_case, kebab-case, UPPER_CASE y mas. |
| **String Counter** | Cuenta caracteres, palabras, lineas y bytes de cualquier texto. |
| **Regex Tester** | Prueba expresiones regulares con resaltado de coincidencias, grupos capturados y referencia rapida. |

### Web y referencia

| Herramienta | Descripcion |
|---|---|
| **Timestamp Converter** | Convierte timestamps Unix a fechas legibles y viceversa. Soporta multiples zonas horarias. |
| **Cron Parser** | Interpreta y construye expresiones cron visualmente con descripcion en lenguaje natural. |
| **HTTP Status Codes** | Referencia completa de codigos de estado HTTP con descripcion y casos de uso. |
| **User-Agent Parser** | Analiza cadenas de User-Agent y extrae navegador, sistema operativo y dispositivo. |

---

## Caracteristicas

- **100% offline** — No requiere conexion a internet en tiempo de ejecucion
- **Sin telemetria** — Ningun dato se envia a servidores externos
- **Sin dependencias CDN** — Todos los assets estan empaquetados o servidos localmente
- **Modo oscuro y claro** — Detecta la preferencia del sistema; el usuario puede cambiarlo manualmente
- **Responsive** — Usable en movil, tablet y escritorio
- **Bilingue** — Espanol e ingles, con cambio manual desde la barra de navegacion

---

## Stack tecnologico

- **Vue 3** — Composition API con `<script setup>`
- **Tailwind CSS 3** — Framework CSS utilitario con modo oscuro basado en clase
- **Vite 7** — Build tool y servidor de desarrollo
- **Vue Router 5** — Enrutamiento SPA con history mode
- **vue-i18n 11** — Internacionalizacion (espanol e ingles, deteccion automatica por locale del navegador)
- **AJV 8** — Validacion de JSON Schema
- **Prettier** — Formateo de CSS/JS en el minifier
- **Marked** — Renderizado de Markdown
- **sql-formatter** — Formateo de SQL
- **js-yaml** — Parseo de YAML
- **smol-toml** — Parseo de TOML
- **qrcode** — Generacion de codigos QR
- **diff** — Algoritmo de diff para comparacion de texto
- **Lucide Vue Next** — Iconografia

---

## Estructura del proyecto

```
devtools/
├── public/                          # Assets estaticos (favicon, fuentes)
├── src/
│   ├── App.vue                      # Shell principal: nav, theme toggle, locale switcher
│   ├── main.js                      # Entry point: createApp, router, i18n
│   ├── style.css                    # Tailwind layers + clases custom
│   ├── i18n/
│   │   ├── index.js                 # Configuracion i18n con deteccion de locale
│   │   └── locales/
│   │       ├── es.json              # Traducciones en espanol
│   │       └── en.json              # Traducciones en ingles
│   ├── components/
│   │   └── LineNumberedTextarea.vue  # Textarea compartido con numeros de linea
│   └── views/                       # 29 herramientas + Home
│       ├── Home.vue                 # Bento grid con acceso a todas las herramientas
│       ├── JSONLint.vue
│       ├── JSONSchemaValidator.vue
│       ├── JSONCompare.vue
│       ├── Base64Converter.vue
│       ├── URLConverter.vue
│       ├── HtmlEntityEncoder.vue
│       ├── JwtDecoder.vue
│       ├── PHPSerializer.vue
│       ├── YamlJsonConverter.vue
│       ├── TomlJsonConverter.vue
│       ├── XmlJsonConverter.vue
│       ├── UUIDGenerator.vue
│       ├── PasswordGenerator.vue
│       ├── HashGenerator.vue
│       ├── LoremIpsum.vue
│       ├── QrGenerator.vue
│       ├── ColorPaletteGenerator.vue
│       ├── FaviconGenerator.vue
│       ├── SqlFormatter.vue
│       ├── CssJsMinifier.vue
│       ├── MarkdownPreview.vue
│       ├── TextDiff.vue
│       ├── CaseConverter.vue
│       ├── StringCounter.vue
│       ├── RegexTester.vue
│       ├── TimestampConverter.vue
│       ├── CronParser.vue
│       ├── HttpStatusCodes.vue
│       └── UserAgentParser.vue
├── netlify.toml                     # Configuracion de build y deploy para Netlify
├── tailwind.config.js               # Paleta de colores brand, fuentes, animaciones
├── vite.config.js                   # Config de Vite con alias @
├── package.json                     # Dependencias y scripts
└── index.html                       # Punto de entrada HTML
```

---

## Requisitos

- Node.js 18 o superior (se recomienda 22 LTS)
- npm 9 o superior

---

## Instalacion y uso

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd devtools

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo (puerto 3000)
npm run dev
```

La aplicacion estara disponible en `http://localhost:3000`.

---

## Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo con hot reload (puerto 3000)
npm run build     # Build de produccion optimizado en dist/
npm run preview   # Vista previa del build de produccion
npm run serve     # Servidor estatico en puerto 8080
```

---

## Deploy

El proyecto esta configurado para desplegarse en **Netlify** mediante integracion directa con GitHub.

### Configuracion

El archivo `netlify.toml` en la raiz del proyecto define:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node.js version:** 22
- **SPA redirect:** Todas las rutas redirigen a `index.html` (necesario para Vue Router con history mode)

### Pasos para desplegar

1. Sube el repositorio a GitHub
2. En Netlify, selecciona **"Import an existing project"**
3. Conecta tu cuenta de GitHub y selecciona el repositorio
4. Netlify detectara automaticamente la configuracion desde `netlify.toml`
5. Haz clic en **"Deploy"**

Cada push a `main` desplegara automaticamente a produccion. Los pull requests generaran deploy previews con URL unica.
