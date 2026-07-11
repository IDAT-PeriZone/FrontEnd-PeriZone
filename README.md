# PERIZONE — Tienda de Periféricos Gaming

Aplicación web e-commerce para la tienda **PERIZONE**, construida con **React 19 + TypeScript + Vite**.

---

## 🚀 Despliegue local (Desarrollo)

### Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- npm v9 o superior

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd FrontEnd-PeriZone

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en **http://localhost:5173/**

> El servidor incluye Hot Module Replacement (HMR): los cambios en el código se reflejan automáticamente en el navegador sin recargar la página.

---

## 🏗️ Build para Producción

```bash
# Compilar TypeScript y generar bundle optimizado
npm run build
```

Los archivos generados quedan en la carpeta `dist/`. Para previsualizar el build localmente:

```bash
npm run preview
```

La preview estará disponible en **http://localhost:4173/**

---

## 📁 Estructura del proyecto

```
FrontEnd-PeriZone/
├── public/                   # Imágenes de productos (servidas estáticamente)
│   ├── keyboard.png
│   ├── mouse.png
│   ├── headset.png
│   ├── webcam.png
│   ├── monitor.png
│   └── mousepad.png
├── src/
│   ├── components/           # Componentes de cada vista
│   │   ├── Navbar.tsx        # Barra de navegación con búsqueda y carrito
│   │   ├── Footer.tsx        # Pie de página
│   │   ├── HomeTab.tsx       # Página de inicio (hero + productos destacados)
│   │   ├── CatalogTab.tsx    # Catálogo con filtros y búsqueda
│   │   ├── ProductDetailTab.tsx  # Vista de detalle de producto
│   │   ├── CartTab.tsx       # Carrito de compras
│   │   └── OrderSuccessModal.tsx # Modal de compra exitosa
│   ├── data/
│   │   └── products.ts       # Base de datos local de productos
│   ├── types.ts              # Interfaces TypeScript compartidas
│   ├── App.tsx               # Componente raíz y estado global
│   ├── App.css               # Estilos del sistema de diseño
│   ├── index.css             # Estilos globales y fuentes
│   └── main.tsx              # Punto de entrada de la aplicación
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con HMR |
| `npm run build` | Genera el bundle de producción en `dist/` |
| `npm run preview` | Previsualiza el build de producción localmente |
| `npm run lint` | Ejecuta ESLint sobre el código fuente |

---

## 🎨 Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.x | Framework UI |
| TypeScript | 6.x | Tipado estático |
| Vite | 8.x | Bundler y servidor de desarrollo |
| Vanilla CSS | — | Estilos (sin frameworks externos) |

### Paleta de colores

| Token | Color | Uso |
|---|---|---|
| Cyan | `#00b4d8` | Botones primarios, precios, links activos |
| Lime | `#c8f135` | Botón de checkout, badges |
| Dark | `#09090b` | Fondo principal |
| Card | `#111113` | Tarjetas y paneles |

### Tipografía

- **Headings:** [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts)
- **Body:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (Google Fonts)

---

## 📦 Despliegue en producción

### Vercel (recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar (primera vez)
vercel

# Desplegar actualizaciones
vercel --prod
```

### Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Build y deploy
npm run build
netlify deploy --prod --dir=dist
```

### Servidor propio (Nginx / Apache)

```bash
# 1. Generar el build
npm run build

# 2. Copiar la carpeta dist/ al servidor web
# Ejemplo con scp:
scp -r dist/ usuario@servidor:/var/www/perizone/

# 3. Configurar Nginx para servir SPA (Single Page Application)
```

**Configuración Nginx recomendada para SPA:**

```nginx
server {
    listen 80;
    server_name tudominio.com;
    root /var/www/perizone;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

> ⚠️ La directiva `try_files $uri $uri/ /index.html` es esencial para que React Router (o navegación SPA) funcione correctamente al recargar la página.

---

## 🔧 Variables de entorno (futuro)

Si en el futuro se conecta a una API backend, crear un archivo `.env` en la raíz:

```env
VITE_API_URL=https://api.perizone.com
VITE_API_KEY=tu_clave_aqui
```

Las variables en Vite deben comenzar con el prefijo `VITE_` para ser accesibles en el cliente.

---

## 📝 Notas de desarrollo

- El proyecto **no tiene dependencias externas de UI** (sin Tailwind, sin MUI, sin Bootstrap). Todo el sistema de diseño está implementado en `App.css` con CSS puro.
- Los datos de productos están en `src/data/products.ts`. Para conectar a una API real, reemplazar las importaciones de ese archivo por llamadas `fetch`/`axios`.
- Las imágenes de productos se sirven desde la carpeta `public/` con rutas absolutas (ej. `/keyboard.png`).
