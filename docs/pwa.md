# GranTrico como PWA instalable

**Estado:** Pendiente de implementación  
**Última actualización:** 2026-04-24  
**Scope:** Instalabilidad en Android e iOS. Sin offline robusto ni push notifications.

---

## Por qué hacerlo

GranTrico se usa exclusivamente desde el celular. Hoy el flujo de retorno es: abrir el browser → escribir la URL (o buscarla en historial) → esperar carga. Como PWA, el usuario agrega un ícono al home screen y abre la app igual que cualquier aplicación nativa: ícono propio, sin barra del browser, splash con los colores del club.

**Beneficios concretos:**
- Ícono del club en el home screen de cada jugador
- Abre en modo standalone (sin barra de URL)
- Splash screen con fondo navy del club al abrir
- Retención: el ícono visible en el home genera más vueltas a la app
- Cero fricción para el usuario final — se instala en 2 taps

---

## Qué requiere cada plataforma

| Requisito | Android (Chrome) | iOS (Safari) |
|---|---|---|
| HTTPS | ✓ obligatorio | ✓ obligatorio |
| `manifest.json` | ✓ obligatorio | Parcial (lee `name`, `icons`) |
| Service worker activo | ✓ obligatorio para el prompt de instalación | ✗ no requerido |
| `<meta apple-mobile-web-app-capable>` | No aplica | ✓ obligatorio |
| Íconos 192px y 512px | ✓ obligatorio | No aplica |
| `apple-touch-icon` 180px | No aplica | ✓ obligatorio |
| `theme_color` en manifest | ✓ para splash | No aplica |

**HTTPS:** Cubierto por Vercel en producción. En desarrollo local no hay prompt de instalación — normal.

---

## Archivos a crear y modificar

### 1. `app/manifest.ts` — Web App Manifest

Next.js 14 genera el manifest automáticamente con este archivo:

```typescript
// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GranTrico Fantasy',
    short_name: 'GranTrico',
    description: 'Fantasy rugby del club',
    start_url: '/post-login',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0d1f35',
    theme_color: '#0d1f35',
    lang: 'es',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-192-maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
```

Esto genera `/manifest.webmanifest` automáticamente en el build. No hace falta crear el JSON manualmente.

---

### 2. `app/layout.tsx` — Metadata y viewport PWA

Agregar los exports `metadata` y `viewport` al layout raíz. Next.js 14 App Router los lee y los inyecta en el `<head>` automáticamente.

```typescript
// app/layout.tsx
import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { auth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'GranTrico Fantasy',
  description: 'Fantasy rugby del club',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GranTrico',
  },
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#0d1f35',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <html lang="es">
      <body className="min-h-screen text-gray-900 antialiased" style={{ background: '#0d1f35' }}>
        <ServiceWorkerRegister />
        {session?.user ? (
          <AppShell isAdmin={session.user.isAdmin}>{children}</AppShell>
        ) : (
          <div className="min-h-screen">{children}</div>
        )}
      </body>
    </html>
  );
}
```

`viewportFit: 'cover'` es necesario para que el contenido llegue hasta el borde en iPhones con notch o Dynamic Island (se usa junto con `safe-area-inset-*` en CSS).

---

### 3. `components/ServiceWorkerRegister.tsx` — Registro del SW

Componente cliente mínimo que registra el service worker. Se monta en el layout raíz y no renderiza nada visible.

```typescript
// components/ServiceWorkerRegister.tsx
'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Silenciar errores de registro — no son críticos para el usuario
      });
    }
  }, []);

  return null;
}
```

---

### 4. `public/sw.js` — Service worker mínimo

Estrategia: **network-first con precache del app shell**. Chrome requiere un SW activo con fetch handler para mostrar el prompt de instalación. No cacheamos rutas `/api/*` (datos dinámicos por usuario).

```javascript
// public/sw.js
const CACHE = 'gtrico-v1';

// Recursos del app shell que se precachean al instalar el SW
const SHELL = [
  '/',
  '/login',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

// Rutas que nunca se cachean (datos dinámicos)
const NO_CACHE = ['/api/', '/_next/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Pasar sin interceptar: otras origins, API, archivos internos de Next.js
  if (
    url.origin !== location.origin ||
    NO_CACHE.some((path) => url.pathname.startsWith(path))
  ) {
    return;
  }

  // Network-first: intentar red, fallback a cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Guardar copia fresca en cache sólo para GET exitosos
        if (request.method === 'GET' && response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
```

**Cache busting:** Cuando se hace deploy con cambios importantes, cambiar `CACHE = 'gtrico-v2'`. El bloque `activate` limpia automáticamente las versiones anteriores en todos los dispositivos de los usuarios.

---

### 5. Safe areas iOS — `components/AppShell.tsx`

Con `viewport-fit=cover`, el contenido puede quedar detrás del notch o la Dynamic Island. Aplicar `padding-top: env(safe-area-inset-top)` al top bar del `AppShell`.

En el elemento que hace de top bar, agregar al `className`:

```tsx
// Antes:
<div className="fixed top-0 ...">

// Después:
<div className="fixed top-0 ..." style={{ paddingTop: 'env(safe-area-inset-top)' }}>
```

Solo hace falta en el top bar — el resto del contenido ya está dentro del área segura.

---

## Generación de íconos

El proyecto tiene `public/logo.png`. Se necesitan estos archivos en `public/icons/`:

| Archivo | Tamaño | Uso |
|---|---|---|
| `icon-192.png` | 192×192 | Android Chrome |
| `icon-512.png` | 512×512 | Android splash / Play Store |
| `icon-192-maskable.png` | 192×192 | Android adaptive icon |
| `icon-512-maskable.png` | 512×512 | Android adaptive icon (alta res) |
| `apple-touch-icon.png` | 180×180 | iOS home screen |
| `favicon-32.png` | 32×32 | Favicon desktop |
| `favicon-16.png` | 16×16 | Favicon desktop pequeño |

### Opción A — Online (recomendado, sin código)

1. Ir a [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
2. Subir `public/logo.png`
3. Descargar el zip generado
4. Copiar los archivos renombrados a `public/icons/`

Alternativa: [RealFaviconGenerator](https://realfavicongenerator.net/) — también genera todos los tamaños + los meta tags HTML (ignorar los meta tags, ya están cubiertos por Next.js).

### Opción B — Script local con `sharp`

```bash
npm install -D sharp
```

Crear `scripts/generate-icons.mjs`:

```javascript
// scripts/generate-icons.mjs
import sharp from 'sharp';
import { mkdir } from 'fs/promises';

const input = 'public/logo.png';
const outDir = 'public/icons';

await mkdir(outDir, { recursive: true });

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-16.png', size: 16 },
];

for (const { name, size } of sizes) {
  await sharp(input)
    .resize(size, size, { fit: 'contain', background: '#0d1f35' })
    .toFile(`${outDir}/${name}`);
  console.log(`✓ ${name}`);
}

// Maskable: 20% de padding para que el logo no se recorte en adaptive icons
for (const size of [192, 512]) {
  const pad = Math.round(size * 0.2);
  const inner = size - pad * 2;
  await sharp(input)
    .resize(inner, inner, { fit: 'contain', background: '#0d1f35' })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#0d1f35' })
    .toFile(`${outDir}/icon-${size}-maskable.png`);
  console.log(`✓ icon-${size}-maskable.png`);
}

console.log('Íconos generados en', outDir);
```

```bash
node scripts/generate-icons.mjs
```

**Por qué el padding en maskable:** Android recorta el ícono con una máscara (círculo, cuadrado redondeado, etc. según el launcher). El "safe zone" es el 80% central del ícono. El padding del 20% garantiza que el logo siempre sea visible sin importar el launcher.

---

## Cómo instalar la app (instrucciones para usuarios)

### Android (Chrome)

Chrome muestra un banner automático "Agregar a pantalla de inicio" después de que el usuario visita la app un par de veces. Si no aparece:

1. Tocar los tres puntos (⋮) arriba a la derecha
2. Tocar "Agregar a pantalla de inicio"
3. Confirmar el nombre → "Agregar"

El ícono aparece en el home. Al abrirlo, la app abre sin barra de URL.

### iOS (Safari)

Safari no muestra banners automáticos. El usuario tiene que hacerlo manualmente:

1. Abrir la URL de GranTrico en **Safari** (no Chrome ni Firefox — no funcionan en iOS para instalar PWA)
2. Tocar el botón de compartir (cuadrado con flecha hacia arriba) en la barra inferior
3. Desplazarse hacia abajo y tocar "Agregar a pantalla de inicio"
4. Confirmar el nombre → "Agregar"

---

## Cómo validar

### En desarrollo (Chrome desktop)

1. `npm run build && npm run start`
2. Abrir `http://localhost:3000` en Chrome
3. DevTools (F12) → Application → Manifest: debe mostrar nombre, íconos, theme color sin errores rojos
4. DevTools → Application → Service Workers: debe mostrar `sw.js` como "activated and running"
5. Lighthouse → generar reporte → categoría "Progressive Web App" → apuntar a verde en instalabilidad

Los checks de "offline" pueden quedar en amarillo — es esperado dado el scope de este trabajo.

### En producción (prueba real)

**Android:**
- Abrir la URL de Vercel en Chrome móvil
- Verificar que aparece el banner o la opción en el menú ⋮
- Instalar → verificar ícono en home con el logo del club
- Abrir → debe arrancar sin barra de URL, splash con fondo navy

**iOS:**
- Abrir en Safari móvil
- Compartir → "Agregar a pantalla de inicio"
- Verificar nombre "GranTrico" e ícono correcto
- Abrir → standalone, sin barra de Safari, safe area respetada en el notch

### Prueba de actualización del SW

1. Cambiar `CACHE = 'gtrico-v2'` en `sw.js`
2. Hacer deploy
3. En el celular: recargar la PWA instalada
4. El SW nuevo toma control y limpia el cache viejo automáticamente

Si el update no se aplica: ir a Ajustes del browser → Datos del sitio → limpiar caché del dominio.

---

## Mantenimiento

**Cuándo hacer cache busting** (cambiar `CACHE = 'gtrico-vN'`):
- Cuando cambia el app shell: nueva fuente, cambio en `globals.css`, nuevo ícono
- Cuando se cambia `start_url` o `scope` en el manifest
- No es necesario por cada deploy normal — Next.js versiona sus JS/CSS automáticamente

**Qué NO meter en el cache:**
- Rutas `/api/*` — son datos por usuario (equipo, rankings, stats)
- Páginas de admin — baja frecuencia, datos críticos que deben estar frescos
- Cualquier cosa que requiera autenticación para renderizar correctamente

**Datos del usuario offline:** Si un usuario abre la PWA sin conexión, verá el shell (landing/login) desde el cache, pero no sus datos de equipo ni rankings. Esto es correcto y esperado dado el scope actual.

---

## Fuera del scope (posibles extensiones futuras)

| Feature | Cuándo considerarlo |
|---|---|
| **Notificaciones push** | Cuando haya eventos urgentes: "¡Cierre de edición en 1 hora!", "Resultados publicados" |
| **Offline para rankings** | Si el uso crece y hay feedback de conectividad en el estadio |
| **Background sync** | Si se permite armar equipo offline y sincronizar después |
| **Install prompt personalizado** | Si se quiere mostrar un botón "Instalar app" dentro de la UI |

Para notificaciones push se necesitaría un servidor de push (Web Push con VAPID keys) y un backend que guarde las suscripciones — trabajo no trivial, conviene evaluar cuando haya base de usuarios más grande.
