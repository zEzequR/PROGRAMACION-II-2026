---
marp: true
theme: dracula
size: 16:9
paginate: true
style: |
  @import url("https://unpkg.com/lucide-static@1.60.0/font/lucide.css");

  section {
    font-size: 28px;
  }
  ul {
    margin: 0.4em 0 0.6em 0;
  }
  h2 {
    font-size: 1.15em;
    font-style: italic;
    text-decoration: underline;
  }
  strong {
    font-style: italic;
    text-decoration: underline;
  }
  section h1 strong {
    color: var(--dracula-purple);
    font-style: normal;
    text-decoration: none;
  }

  /* Logo arriba a la derecha */
  header {
    left: auto;
    right: 0;
    height: auto;
    padding: 14px 22px;
    line-height: 0;
    overflow: visible;
  }
  header img {
    height: 78px;
  }

  /* Íconos de Lucide: <i class="icon-nombre"></i> */
  [class^="icon-"] {
    display: inline-block;
    color: var(--dracula-purple);
    vertical-align: -0.1em;
    text-indent: 0;
  }
  h2 [class^="icon-"] {
    margin-right: 0.3em;
  }
  li > [class^="icon-"]:first-child {
    margin-right: 0.1em;
  }
  td [class^="icon-"] {
    margin-right: 0.25em;
  }
  ul:has(> li > [class^="icon-"]:first-child) {
    list-style: none;
    padding-left: 0;
  }
  li:has(> [class^="icon-"]:first-child) {
    padding-left: 1.4em;
    text-indent: -1.4em;
  }

  /* Logos de tecnologías (Simple Icons): ![](https://cdn.simpleicons.org/nombre) */
  td img,
  .diagrama img {
    height: 1em;
    vertical-align: -0.15em;
    margin-right: 0.2em;
  }

  /* Diapositiva con mucho texto: <!-- _class: compacta --> */
  section.compacta {
    font-size: 24px;
  }
  table {
    font-size: 0.85em;
  }
  td:first-child {
    white-space: nowrap;
  }

  section.lead {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .columnas {
    display: flex;
    gap: 1.5em;
  }
  .columnas > div {
    flex: 1;
  }

  /* Diagramas hechos con cajas */
  .diagrama {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    margin-top: 0.6em;
    font-size: 0.62em;
    line-height: 1.3;
  }
  .caja {
    padding: 0.45em 0.9em;
    border: 2px solid var(--dracula-purple);
    border-radius: 8px;
    background: var(--dracula-current-line);
    text-align: center;
  }
  .caja small {
    font-size: 0.85em;
    opacity: 0.8;
  }
  .caja.front {
    border-color: var(--dracula-cyan);
  }
  .caja.datos {
    border-color: var(--dracula-green);
  }
  .caja.cola {
    border-color: var(--dracula-orange);
  }
  .caja.rust {
    border-color: var(--dracula-pink);
  }
  .caja.externo {
    border-color: var(--dracula-yellow);
  }
  .diagrama [class^="icon-"] {
    color: var(--dracula-cyan);
    font-size: 1.3em;
  }
  .flecha {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--dracula-cyan);
  }
  .grupo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2em;
    padding: 0.6em 0.9em;
    border: 1px solid var(--dracula-comment);
    border-radius: 10px;
    background: #21222c;
  }
  .grupo .titulo {
    margin: 0 0 0.3em 0;
    color: var(--dracula-pink);
  }
  .pila {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2em;
  }
---

<!-- _class: lead -->
<!-- _paginate: false -->

![h:180](https://www.institutozonaoeste.edu.ar/assets/logo-IZO-d8e2a478.webp)

# Proyecto **Localia**

**Integrantes**: Calsino Leila, Ramos Ezequiel, Simó Ramiro
**Año**: 3° Año
**Materia**: Práctica Profesionalizante II
**Docente/s**: Mauricio García

---

<!-- header: '![](https://www.institutozonaoeste.edu.ar/assets/logo-IZO-d8e2a478.webp)' -->

# Introducción

## <i class="icon-lightbulb"></i>¿Cómo surge?

- Emprendedores y Pymes locales venden por redes sociales o mensajería, o con sistemas obsoletos
- Eso limita la automatización y el crecimiento de sus negocios

## <i class="icon-rocket"></i>Motivación

- **Técnica:** dominar tecnologías muy demandadas y trabajar en equipo
- **Laboral:** salir con una ventaja competitiva (empleo o freelance)

## <i class="icon-trending-up"></i>Impacto

- Acceso al comercio electrónico profesionalizado para negocios locales

---

<!-- _class: compacta -->

# Funcionalidad

<div class="columnas">
<div>

## <i class="icon-layout-grid"></i>¿Qué permite hacer?

- <i class="icon-store"></i> **Emprendedor:** crea su tienda, carga productos (físicos y digitales), stock y cupones, y ve ventas y estadísticas
- <i class="icon-user"></i> **Cliente:** descubre productos en un feed personalizado, compra y descarga lo digital
- <i class="icon-sparkles"></i> **Feed:** recomendaciones según intereses, actividad y popularidad
- <i class="icon-wand-sparkles"></i> **IA:** sugiere nombre y descripción a partir de la foto del producto

</div>
<div>

## <i class="icon-users"></i>Roles

- <i class="icon-store"></i> Emprendedor (Dashboard)
- <i class="icon-user"></i> Cliente (Storefront)
- <i class="icon-user-plus"></i> Un usuario pasa a ser Emprendedor al crear su primera tienda

## <i class="icon-shield-alert"></i>Restricciones

- <i class="icon-credit-card"></i> Pagos solo con Mercado Pago (cobro directo al emprendedor)
- <i class="icon-lock"></i> No se almacenan datos de tarjeta
- <i class="icon-sparkles"></i> Intereses del feed: de 1 a 4 categorías
- <i class="icon-history"></i> **Estadísticas:** 7, 30 o 90 días, solo órdenes pagadas

</div>
</div>

---

# Tecnologías Utilizadas

| Capa | Tecnología |
|---|---|
| <i class="icon-monitor"></i> Frontend | ![](https://cdn.simpleicons.org/nextdotjs/f8f8f2) Next.js · ![](https://cdn.simpleicons.org/tailwindcss) Tailwind CSS |
| <i class="icon-server"></i> Backend | ![](https://cdn.simpleicons.org/nodedotjs) Node.js + ![](https://cdn.simpleicons.org/express/f8f8f2) Express · ![](https://cdn.simpleicons.org/zod) Zod · ![](https://cdn.simpleicons.org/jsonwebtokens/f8f8f2) JWT |
| <i class="icon-database"></i> Base de datos | ![](https://cdn.simpleicons.org/postgresql) PostgreSQL hosteada en ![](https://cdn.simpleicons.org/neon) Neon |
| <i class="icon-sparkles"></i> Recomendaciones | ![](https://cdn.simpleicons.org/rust/f8f8f2) Microservicio en Rust · ![](https://cdn.simpleicons.org/modelcontextprotocol/f8f8f2) MCP · ![](https://cdn.simpleicons.org/sqlite/0f80cc) SQLite |
| <i class="icon-radio-tower"></i> Cola de eventos - mensajes | ![](https://cdn.simpleicons.org/apachekafka/f8f8f2) Kafka |
| <i class="icon-bot"></i> IA | ![](https://cdn.simpleicons.org/claude) API de Claude |
| <i class="icon-plug"></i> Servicios externos | ![](https://cdn.simpleicons.org/mercadopago) Mercado Pago · ![](https://cdn.simpleicons.org/google) Google · ![](https://api.iconify.design/simple-icons/amazons3.svg?color=%23569a31) AWS S3 · ![](https://cdn.simpleicons.org/resend/f8f8f2) Resend |
| <i class="icon-square-kanban"></i> Gestión | ![](https://cdn.simpleicons.org/github/f8f8f2) GitHub · ![](https://api.iconify.design/simple-icons/visualstudiocode.svg?color=%23007acc) VS Code · ![](https://cdn.simpleicons.org/postman) Postman · <i class="icon-iteration-cw"></i> SCRUM |

---

# Demo - Estructura del proyecto

<div class="diagrama">
  <div class="grupo">
    <p class="titulo"><img src="https://cdn.simpleicons.org/nextdotjs/f8f8f2">pp2-localiapp-front · src/</p>
    <div class="caja front">app/<br><small>páginas</small></div>
    <i class="icon-arrow-down"></i>
    <div class="caja front">components/<br><small>UI</small></div>
    <i class="icon-arrow-down"></i>
    <div class="caja front">lib/api/<br><small>llamadas a la API</small></div>
  </div>
  <div class="flecha">HTTPS<i class="icon-arrow-right"></i></div>
  <div class="pila">
    <div class="grupo">
      <p class="titulo"><img src="https://cdn.simpleicons.org/express/f8f8f2">PROGRAMACION-II-2026 · src/</p>
      <div class="caja">routes/</div>
      <i class="icon-arrow-down"></i>
      <div class="caja">middlewares/<br><small>JWT · roles · uploads</small></div>
      <i class="icon-arrow-down"></i>
      <div class="caja">controllers/</div>
      <i class="icon-arrow-down"></i>
      <div class="caja">services/</div>
      <i class="icon-arrow-down"></i>
      <div class="caja">models/ + schemas/<br><small><img src="https://cdn.simpleicons.org/zod">Zod</small></div>
    </div>
    <i class="icon-arrow-down"></i>
    <div class="caja datos"><img src="https://cdn.simpleicons.org/postgresql">PostgreSQL</div>
  </div>
  <div class="pila">
    <div class="flecha"><span><img src="https://cdn.simpleicons.org/modelcontextprotocol/f8f8f2">MCP</span><i class="icon-arrow-right"></i></div>
    <div class="flecha"><span><img src="https://cdn.simpleicons.org/apachekafka/f8f8f2">Kafka</span><i class="icon-arrow-right"></i></div>
  </div>
  <div class="grupo">
    <p class="titulo"><img src="https://cdn.simpleicons.org/rust/f8f8f2">feed-service/ · Rust</p>
    <div class="caja rust">tools/<br><small>MCP</small></div>
    <i class="icon-arrow-down"></i>
    <div class="caja rust">services/<br><small><img src="https://cdn.simpleicons.org/claude">IA con Claude</small></div>
    <i class="icon-arrow-down"></i>
    <div class="caja datos"><img src="https://cdn.simpleicons.org/sqlite/0f80cc">SQLite</div>
  </div>
</div>

---
<!-- _class: compacta -->

<div class="columnas">
<div>

## <i class="icon-list-plus"></i>Nuevas funcionalidades

- Integración de pedidos con Correo Argentino
- Más especificaciones por producto
- Términos y condiciones
- Formulario manual de dirección para quienes no puedan usar Google Maps

## <i class="icon-handshake"></i>Distribución / venta

- Modelo SaaS: plan gratuito con límites y plan pago mensual
- Piloto con emprendedores de Rosario y la región

</div>
<div>

## <i class="icon-trophy"></i>Qué logramos

- Un MVP funcional de inicio a fin: de crear una tienda a cobrar y entregar un producto digital
- Integrar servicios reales y una arquitectura con varias piezas, incluido un servicio en Rust
- Aprender herramientas nuevas e investigar

## <i class="icon-graduation-cap"></i>Qué aprendimos

- Planificar mejor y definir con claridad el alcance y los límites del proyecto
- Mejor uso de IA para tareas repetitivas y tests del sistema

</div>
</div>

---

<!-- _class: lead -->

# ¡Gracias por su atención