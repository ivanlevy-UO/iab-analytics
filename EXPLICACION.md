# Explicación del Proyecto: IAB Analytics Dashboard

Esta aplicación fue diseñada para visualizar de forma amigable y profesional las métricas de Google Analytics 4 (GA4) específicamente para las noticias del sitio de IAB Argentina.

Aquí tienes el paso a paso de cómo se construyó y cómo funciona cada parte:

---

## 1. Arquitectura de la App
La aplicación está dividida en dos grandes partes:
- **Backend (Servidor):** Hecho con Node.js y Express. Se encarga de hablar con Google Analytics y de "scrapear" los títulos.
- **Frontend (Dashboard):** Hecho con React y Vite. Es la interfaz moderna que ves en el navegador, con tablas, filtros y gráficos.

---

## 2. ¿Cómo consume los datos de Analytics?
El "corazón" de los datos es el archivo `src/services/ga4Service.js`.
- **Conexión:** Usamos una **Cuenta de Servicio** de Google (el archivo `credentials.json`). Esto permite que el servidor pida datos sin necesidad de que un humano inicie sesión.
- **Consulta:** Pedimos a la API de GA4 cuatro cosas específicas (métricas y dimensiones):
    1. `pagePath`: La ruta de la noticia (ej: `/noticia-208.php`).
    2. `screenPageViews`: Cuántas veces se vio la nota.
    3. `activeUsers`: Cuántas personas únicas la leyeron.
    4. `averageSessionDuration`: Cuánto tiempo se quedaron leyendo en promedio.
- **Filtro:** Solo pedimos datos de los últimos 30 días y filtramos para que solo aparezcan las rutas que contienen la palabra "noticia".

---

## 3. ¿Cómo se hicieron los links de cada nota?
Originalmente, el dashboard solo mostraba texto plano. Para hacerlo interactivo:
- En el archivo `client/src/App.jsx`, tomamos la ruta que nos da Analytics (ej: `/noticia-208.php`).
- La concatenamos con la URL base del sitio: `https://www.iabargentina.com.ar`.
- Envolvemos el título en una etiqueta `<a>` (link) de HTML con `target="_blank"` para que se abra en una pestaña nueva al hacer clic.

---

## 4. El "Bot" Scraper de Titulados
Como Google Analytics a veces da títulos genéricos (ej: todas las notas dicen "IAB ARGENTINA"), creamos un robot extractor en `src/services/titleService.js`:

1. **Visita la web:** Cuando el dashboard pide los datos, el servidor agarra cada link de noticia y "llama" a la página real usando una librería llamada `axios`.
2. **Busca el H1:** Una vez dentro del código de la noticia, usamos `cheerio` (que funciona como un jQuery para servidores) para buscar específicamente la etiqueta `<h1>`, que es donde suele estar el titular real de la nota.
3. **Caché Inteligente:** Para no ser pesados con el sitio de IAB y para que el dashboard sea rápido, creamos un archivo llamado `titles-cache.json`. 
    - Si el bot ya conoce el título de una nota, lo lee del archivo. 
    - Si es una nota nueva, la scrapea, guarda el título en el archivo y listo. Nunca más vuelve a visitar esa nota.
4. **Truncado:** Para que la tabla no se rompa si un título es muy largo, en el Frontend limitamos el texto a un máximo de caracteres y añadimos los tres puntitos (`...`).

---

## 5. Exportación a PDF
Finalmente, integramos `jsPDF` y `autoTable` en el frontend. Esta función toma exactamente los mismos datos que ves en pantalla (títulos reales extraídos por el bot + métricas de GA4) y los organiza en una tabla elegante para descargar y compartir.

---

Este proyecto combina la potencia de los datos oficiales de Google con la flexibilidad de un robot hecho a medida para mejorar la lectura de los contenidos.
