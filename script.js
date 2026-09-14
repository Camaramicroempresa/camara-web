/* ===========================================================
   Cámara de Microempresas de Santa Elena — script principal
   =========================================================== */
(function () {
  "use strict";

  /* ---- Año actual en el footer ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Video de fondo: asegurar reproducción automática ---- */
  var heroVideo = document.querySelector(".hero__video");
  if (heroVideo) {
    heroVideo.muted = true;
    var tryPlay = function () {
      var p = heroVideo.play();
      if (p && p.catch) p.catch(function () {});
    };
    tryPlay();
    // Reintentar tras el primer gesto del usuario (por si el navegador lo bloqueó)
    ["click", "touchstart", "scroll", "keydown"].forEach(function (ev) {
      document.addEventListener(ev, tryPlay, { once: true, passive: true });
    });
  }

  /* ---- Navbar: sombra al hacer scroll ---- */
  var nav = document.getElementById("nav");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 10) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  });

  /* ---- Menú móvil ---- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");
  toggle.addEventListener("click", function () {
    menu.classList.toggle("open");
    toggle.classList.toggle("open");
  });
  // Cerrar al hacer clic en un enlace
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("open");
      toggle.classList.remove("open");
      if (dropQuienes) dropQuienes.classList.remove("open");
    });
  });

  /* ---- Menú desplegable "¿Quiénes Somos?" ---- */
  var dropQuienes = document.getElementById("dropQuienes");
  if (dropQuienes) {
    var dropBtn = dropQuienes.querySelector(".nav__drop-toggle");
    dropBtn.addEventListener("click", function (e) {
      e.preventDefault();
      dropQuienes.classList.toggle("open");
    });
    // Cerrar el desplegable si se hace clic fuera (en escritorio)
    document.addEventListener("click", function (e) {
      if (!dropQuienes.contains(e.target)) dropQuienes.classList.remove("open");
    });
  }

  /* ---- Animación reveal al hacer scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---- Contador de estadísticas ---- */
  var counters = document.querySelectorAll(".stat__num");
  var counted = false;
  function runCounters() {
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      var dur = 1600;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = Math.floor(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(step);
    });
  }
  var statsSection = document.querySelector(".hero__stats");
  if (statsSection && "IntersectionObserver" in window) {
    var statsObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !counted) {
            counted = true;
            runCounters();
            statsObs.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    statsObs.observe(statsSection);
  }

  /* ---- Enrutador de vistas (cada opción del menú es una pantalla) ---- */
  var views = document.querySelectorAll(".view");
  var allNavLinks = document.querySelectorAll(".nav__link");
  var quienesIds = ["nosotros", "objetivos", "beneficios"];

  function showView(id) {
    var target = document.getElementById(id);
    if (!target || !target.classList.contains("view")) id = "inicio";
    views.forEach(function (v) { v.classList.toggle("is-active", v.id === id); });
    // Asegurar que el contenido de la vista activa sea visible
    var active = document.getElementById(id);
    if (active) active.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("visible"); });
    allNavLinks.forEach(function (l) {
      l.classList.toggle("active", l.getAttribute("href") === "#" + id);
    });
    if (dropQuienes) {
      dropQuienes.classList.toggle("is-current", quienesIds.indexOf(id) !== -1);
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  // Interceptar los enlaces internos (#) para cambiar de vista
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      if (!id) return;
      e.preventDefault();
      if (history.replaceState) history.replaceState(null, "", "#" + id);
      else location.hash = id;
      menu.classList.remove("open");
      toggle.classList.remove("open");
      if (dropQuienes) dropQuienes.classList.remove("open");
      showView(id);
    });
  });

  // Mostrar la vista inicial según el enlace (#) o "inicio" por defecto
  showView((location.hash || "#inicio").slice(1));
  window.addEventListener("hashchange", function () {
    showView((location.hash || "#inicio").slice(1));
  });

  /* ---- Formulario: enviar por WhatsApp ---- */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  var WHATSAPP = "593978995627"; // 0978995627 en formato internacional

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nombre = form.nombre.value.trim();
      var negocio = form.negocio.value.trim();
      var telefono = form.telefono.value.trim();
      var mensaje = form.mensaje.value.trim();

      if (!nombre || !telefono) {
        note.textContent = "Por favor completa tu nombre y teléfono.";
        note.className = "form__note err";
        return;
      }

      var texto =
        "*Solicitud de afiliación / información*%0A%0A" +
        "*Nombre:* " + encodeURIComponent(nombre) + "%0A" +
        (negocio ? "*Microempresa:* " + encodeURIComponent(negocio) + "%0A" : "") +
        "*Teléfono:* " + encodeURIComponent(telefono) + "%0A" +
        (mensaje ? "*Mensaje:* " + encodeURIComponent(mensaje) : "");

      var url = "https://wa.me/" + WHATSAPP + "?text=" + texto;
      window.open(url, "_blank");

      note.textContent = "¡Gracias! Se abrió WhatsApp para completar el envío.";
      note.className = "form__note ok";
      form.reset();
    });
  }
})();
