(function () {
    var root = document.documentElement;

    /* ---------- Tema claro / oscuro ---------- */
    var themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) {}
            var meta = document.querySelector('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', next === 'dark' ? '#181412' : '#AE6B47');
        });
    }

    /* ---------- Menú móvil ---------- */
    var menuBtn = document.getElementById('menuBtn');
    var navLinks = document.getElementById('navLinks');
    function closeMenu() {
        if (!navLinks || !menuBtn) return;
        navLinks.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
    }
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', function () {
            var open = navLinks.classList.toggle('open');
            menuBtn.setAttribute('aria-expanded', String(open));
        });
        navLinks.addEventListener('click', function (e) {
            if (e.target.tagName === 'A') closeMenu();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenu();
        });
    }

    /* ---------- Foto de respaldo ---------- */
    var photo = document.querySelector('#photoCard img');
    var card = document.getElementById('photoCard');
    if (photo && card) {
        function noPhoto() { card.classList.add('no-img'); }
        photo.addEventListener('error', noPhoto);
        if (photo.complete && photo.naturalWidth === 0) noPhoto();
    }

    /* ---------- Año actual ---------- */
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Filtro por tema en Bitácora ---------- */
    var filterButtons = document.querySelectorAll('.filter-pill');
    var journalCards = document.querySelectorAll('.journal-card');
    if (filterButtons.length && journalCards.length) {
        filterButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var cat = btn.getAttribute('data-filter');
                filterButtons.forEach(function (b) {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');

                journalCards.forEach(function (item) {
                    var itemCat = item.getAttribute('data-category');
                    var match = cat === 'all' || itemCat === cat;
                    item.classList.toggle('is-hidden', !match);
                });
            });
        });
    }

    /* ---------- Copiar al portapapeles ---------- */
    var toast = document.getElementById('toast');
    var toastTimer;
    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
    }
    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        return ok;
    }
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var text = btn.getAttribute('data-copy');
            var label = btn.getAttribute('data-label') || 'Copiado';
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(function () {
                    showToast(label);
                }, function () {
                    showToast(fallbackCopy(text) ? label : 'No se pudo copiar');
                });
            } else {
                showToast(fallbackCopy(text) ? label : 'No se pudo copiar');
            }
        });
    });

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Barra de lectura + volver arriba ---------- */
    var bar = document.getElementById('progressBar');
    var toTop = document.getElementById('toTop');
    function onScroll() {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(window.scrollY / h, 1) : 0) + ')';
        if (toTop) toTop.classList.toggle('show', window.scrollY > 650);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (toTop) {
        toTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        });
    }

    /* ---------- Diagramas de arquitectura desplegables ---------- */
    var ARCH = {
        servicecloud: {
            nodes: [
                ['Navegador Web', 'Cada empresa en su espacio aislado'],
                ['Laravel 13 · PHP 8.4', 'Roles, tickets y control de SLAs'],
                ['PostgreSQL 17', 'Base de datos relacional']
            ],
            note: 'Empaquetado con Docker Compose sobre servidor Linux VPS'
        },
        guardia: {
            nodes: [
                ['Jetpack Compose', 'Interfaz y lectura de sensores'],
                ['Room Database', 'Guarda datos aunque no haya señal'],
                ['Cloud Firestore', 'Sincroniza en la nube al volver la red']
            ],
            note: 'Arquitectura limpia · Envío automático de alertas SMS'
        },
        eventify: {
            nodes: [
                ['App Android', 'Kotlin · Google Maps SDK'],
                ['Firebase Auth', 'Cuentas de usuario'],
                ['Cloud Firestore', 'Eventos y ubicaciones en vivo']
            ],
            note: 'Mapas interactivos y sincronización en tiempo real'
        }
    };

    document.querySelectorAll('[data-arch]').forEach(function (h3, i) {
        var data = ARCH[h3.getAttribute('data-arch')];
        var container = h3.parentElement;
        if (!data || !container) return;

        var id = 'arch-' + i;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'arch-toggle';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', id);
        btn.innerHTML = '<span>Ver cómo funciona por dentro</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

        var box = document.createElement('div');
        box.className = 'arch';
        box.id = id;
        box.hidden = true;

        var flow = document.createElement('div');
        flow.className = 'arch-flow';
        data.nodes.forEach(function (n, k) {
            if (k) {
                var a = document.createElement('div');
                a.className = 'arch-arrow';
                a.textContent = '↓';
                flow.appendChild(a);
            }
            var d = document.createElement('div');
            d.className = 'arch-node';
            var b = document.createElement('b');
            b.textContent = n[0];
            var s = document.createElement('small');
            s.textContent = n[1];
            d.appendChild(b);
            d.appendChild(s);
            flow.appendChild(d);
        });

        var note = document.createElement('div');
        note.className = 'arch-note';
        note.textContent = data.note;
        box.appendChild(flow);
        box.appendChild(note);

        btn.addEventListener('click', function () {
            var open = box.hidden;
            box.hidden = !open;
            btn.setAttribute('aria-expanded', String(open));
            btn.firstChild.textContent = open ? 'Ocultar esquema' : 'Ver cómo funciona por dentro';
        });

        container.appendChild(btn);
        container.appendChild(box);
    });

    /* ---------- Versión imprimible ---------- */
    document.querySelectorAll('[data-action="print"]').forEach(function (b) {
        b.addEventListener('click', function () { window.print(); });
    });

    /* ---------- Paleta de comandos (Ctrl/Cmd + K) ---------- */
    var palette = document.getElementById('palette');
    var pInput = document.getElementById('paletteInput');
    var pList = document.getElementById('paletteList');
    var pIndex = 0;
    var pShown = [];

    function go(id) {
        var el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    }

    var COMMANDS = [
        { l: 'Inicio', h: 'Sección', run: function () { go('inicio'); } },
        { l: 'Hobbies y tiempo libre', h: 'Bitácora', run: function () { go('bitacora'); } },
        { l: 'Sobre mí', h: 'Historia', run: function () { go('sobre-mi'); } },
        { l: 'Proyectos de software', h: 'Crónicas', run: function () { go('proyectos'); } },
        { l: 'Experiencia y estudios', h: 'Camino', run: function () { go('camino'); } },
        { l: 'Herramientas y tecnologías', h: 'Stack', run: function () { go('herramientas'); } },
        { l: 'Charlemos (contacto)', h: 'Contacto', run: function () { go('contacto'); } },
        { l: 'Cambiar luz / modo nocturno', h: 'Acción', run: function () { if (themeBtn) themeBtn.click(); } },
        { l: 'Copiar correo electrónico', h: 'Acción', run: function () { var c = document.querySelector('[data-copy^="cdelgado"]'); if (c) c.click(); } },
        { l: 'Imprimir o guardar en PDF', h: 'Acción', run: function () { window.print(); } },
        { l: 'Ir a GitHub', h: 'Enlace', run: function () { window.open('https://github.com/Carlos08179', '_blank', 'noopener'); } },
        { l: 'Ir a ORCID', h: 'Enlace', run: function () { window.open('https://orcid.org/0009-0004-1704-463X', '_blank', 'noopener'); } }
    ];

    function renderPalette() {
        if (!pInput || !pList) return;
        var q = pInput.value.trim().toLowerCase();
        pShown = COMMANDS.filter(function (c) {
            return !q || c.l.toLowerCase().indexOf(q) !== -1 || c.h.toLowerCase().indexOf(q) !== -1;
        });
        if (pIndex >= pShown.length) pIndex = 0;
        pList.innerHTML = '';
        if (!pShown.length) {
            pList.innerHTML = '<div class="palette-empty">Sin resultados</div>';
            return;
        }
        pShown.forEach(function (c, i) {
            var li = document.createElement('li');
            li.setAttribute('role', 'option');
            if (i === pIndex) li.className = 'active';
            var s1 = document.createElement('span');
            s1.textContent = c.l;
            var s2 = document.createElement('small');
            s2.textContent = c.h;
            li.appendChild(s1);
            li.appendChild(s2);
            li.addEventListener('mousemove', function () {
                if (pIndex !== i) { pIndex = i; renderPalette(); }
            });
            li.addEventListener('click', function () { runCmd(c); });
            pList.appendChild(li);
        });
        var act = pList.querySelector('.active');
        if (act && act.scrollIntoView) act.scrollIntoView({ block: 'nearest' });
    }

    function openPalette() {
        if (!palette || !pInput) return;
        palette.classList.add('open');
        pInput.value = '';
        pIndex = 0;
        renderPalette();
        setTimeout(function () { pInput.focus(); }, 0);
    }

    function closePalette() {
        if (palette) palette.classList.remove('open');
    }

    function runCmd(c) {
        closePalette();
        closeMenu();
        setTimeout(c.run, 60);
    }

    document.querySelectorAll('[data-open-palette]').forEach(function (btn) {
        btn.addEventListener('click', openPalette);
    });

    if (palette && pInput) {
        palette.addEventListener('click', function (e) { if (e.target === palette) closePalette(); });
        pInput.addEventListener('input', function () { pIndex = 0; renderPalette(); });
        document.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                palette.classList.contains('open') ? closePalette() : openPalette();
                return;
            }
            if (!palette.classList.contains('open')) return;
            if (e.key === 'Escape') closePalette();
            else if (e.key === 'ArrowDown') { e.preventDefault(); pIndex = (pIndex + 1) % Math.max(pShown.length, 1); renderPalette(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); pIndex = (pIndex - 1 + pShown.length) % Math.max(pShown.length, 1); renderPalette(); }
            else if (e.key === 'Enter' && pShown[pIndex]) { e.preventDefault(); runCmd(pShown[pIndex]); }
        });
    }

    /* ---------- Animaciones de aparición + sección activa ---------- */
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    en.target.classList.add('in');
                    io.unobserve(en.target);
                }
            });
        }, { threshold: 0.08 });
        reveals.forEach(function (el) { io.observe(el); });

        var links = {};
        document.querySelectorAll('.nav-links a').forEach(function (a) {
            var href = a.getAttribute('href');
            if (href && href.startsWith('#')) links[href.slice(1)] = a;
        });
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting && links[en.target.id]) {
                    Object.keys(links).forEach(function (k) {
                        links[k].classList.remove('active');
                        links[k].removeAttribute('aria-current');
                    });
                    links[en.target.id].classList.add('active');
                    links[en.target.id].setAttribute('aria-current', 'true');
                }
            });
        }, { rootMargin: '-35% 0px -55% 0px' });
        Object.keys(links).forEach(function (id) {
            var s = document.getElementById(id);
            if (s) spy.observe(s);
        });
    } else {
        reveals.forEach(function (el) { el.classList.add('in'); });
    }
})();
