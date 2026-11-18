/* === CHILTEPIN SEAFOOD — JAVASCRIPT COMPARTIDO === */
/* global mostrarModal */

function openReservations() {
    document.getElementById('resSidebar').classList.add('active');
    document.getElementById('resOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    document.getElementById('resStep1').classList.add('active');
    document.getElementById('resStep2').classList.remove('active');
    document.getElementById('resStep3').classList.remove('active');
}

function mostrarModal(msg) {
    document.getElementById('modalMsg').innerText = msg;
    document.getElementById('modalOverlay').classList.add('active');
}

function cerrarModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

function closeReservations() {
    document.getElementById('resSidebar').classList.remove('active');
    document.getElementById('resOverlay').classList.remove('active');
    document.body.style.overflow = '';
    const t = document.querySelector('#resStep2 input[type="text"]'); if (t) t.value = '';
    const p = document.querySelector('#resStep2 input[type="tel"]'); if (p) p.value = '';
    const e = document.querySelector('#resStep2 input[type="email"]'); if (e) e.value = '';
    document.querySelectorAll('.guest-pill').forEach((b, i) => b.classList.toggle('selected', i === 1));
    document.querySelectorAll('.loc-pill').forEach((b, i) => b.classList.toggle('selected', i === 0));
    document.querySelectorAll('.time-pill').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.field-error').forEach(e => e.classList.remove('visible'));
    const ci = document.getElementById('resContactInfo'); if (ci) ci.style.display = 'none';
    const fm = document.querySelector('#resStep2 form'); if (fm) fm.style.display = 'block';
    const btn = document.getElementById('btnStep1Confirm');
    if (btn) { btn.textContent = 'Confirmar Horario'; btn.className = 'btn-submit-event'; }
}

function clearError(id) {
    document.getElementById(id).classList.remove('visible');
}

function showError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
}

function validateResDate(input) {
    if (!input.value) return;
    const day = new Date(input.value + 'T12:00:00').getDay();
    if (day === 0 || day === 6) {
        showError('error-fecha', 'Solo atendemos reservaciones entre semana. Los fines de semana te esperamos sin reservación.');
        input.value = '';
    } else {
        const el = document.getElementById('error-fecha');
        if (el) el.classList.remove('visible');
    }
}

function confirmStep1() {
    document.querySelectorAll('#resStep1 .field-error').forEach(e => e.classList.remove('visible'));
    const selectedTimeEl = document.querySelector('.time-pill.selected');
    const selectedTime = selectedTimeEl ? selectedTimeEl.dataset.value : '';
    const dateVal = document.getElementById('resDate').value;
    if (!dateVal) { showError('error-fecha', 'Selecciona una fecha'); return; }
    if (!selectedTime) { showError('error-horario', 'Selecciona un horario'); return; }
    const day = new Date(dateVal + 'T12:00:00').getDay();
    if (day === 0 || day === 6) {
        showError('error-fecha', 'Solo atendemos reservaciones entre semana. Los fines de semana te esperamos sin reservación.');
        return;
    }
    const locEl = document.querySelector('.loc-pill.selected');
    const loc = locEl ? locEl.dataset.value : '';
    const guestEl = document.querySelector('.guest-pill.selected');
    const guests = guestEl ? guestEl.dataset.value : '';
    document.getElementById('summaryLoc').innerText = loc;
    document.getElementById('summaryDetails').innerText = guests + ' \u2022 ' + dateVal + ' \u2022 ' + selectedTime;

    const isLargeGroup = guestEl && guestEl.dataset.value === '7+ Personas';
    document.getElementById('resContactInfo').style.display = isLargeGroup ? 'block' : 'none';
    document.querySelector('#resStep2 form').style.display = isLargeGroup ? 'none' : 'block';

    document.getElementById('resStep1').classList.remove('active');
    document.getElementById('resStep2').classList.add('active');
}

function goBackToStep1() {
    document.getElementById('resStep2').classList.remove('active');
    document.getElementById('resStep1').classList.add('active');
}

function submitReservation(e) {
    e.preventDefault();
    document.querySelectorAll('#resStep2 .field-error').forEach(e => e.classList.remove('visible'));
    const name = document.querySelector('#resStep2 input[type="text"]').value.trim();
    const phone = document.querySelector('#resStep2 input[type="tel"]').value.trim();
    const email = document.querySelector('#resStep2 input[type="email"]').value.trim();
    let valid = true;
    if (!name) { showError('error-name', 'Ingresa tu nombre completo'); valid = false; }
    if (!/^\d{10}$/.test(phone)) { showError('error-phone', 'Ingresa un teléfono válido de 10 dígitos'); valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('error-email', 'Ingresa un correo electrónico válido'); valid = false; }
    if (!valid) return;
    document.getElementById('resStep2').classList.remove('active');
    document.getElementById('resStep3').classList.add('active');
}

document.addEventListener('DOMContentLoaded', function() {
    // Reservations sidebar wiring
    var resTriggers = document.querySelectorAll('.res-trigger');
    var resSidebar = document.getElementById('resSidebar');
    var resOverlay = document.getElementById('resOverlay');
    var resClose = document.getElementById('resClose');
    if (resTriggers.length > 0 && resSidebar && resOverlay && resClose) {
        resTriggers.forEach(function(btn) { btn.addEventListener('click', openReservations); });
        resClose.addEventListener('click', closeReservations);
        resOverlay.addEventListener('click', closeReservations);
    }

    // Date input default
    var dateResInput = document.getElementById('resDate');
    if (dateResInput) {
        var today = new Date().toISOString().split('T')[0];
        dateResInput.value = today;
        dateResInput.min = today;
    }

    // Location pills
    document.querySelectorAll('.loc-pill').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.loc-pill').forEach(function(b) { b.classList.remove('selected'); });
            btn.classList.add('selected');
        });
    });

    // Time pills
    document.querySelectorAll('.time-pill').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-pill').forEach(function(b) { b.classList.remove('selected'); });
            btn.classList.add('selected');
        });
    });

    // Guest pills
    document.querySelectorAll('.guest-pill').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.guest-pill').forEach(function(b) { b.classList.remove('selected'); });
            btn.classList.add('selected');
            var btnConfirm = document.getElementById('btnStep1Confirm');
            if (btn.dataset.value === '7+ Personas') {
                btnConfirm.textContent = 'Contáctanos';
                btnConfirm.className = 'btn-submit-event btn-contact';
            } else {
                btnConfirm.textContent = 'Confirmar Horario';
                btnConfirm.className = 'btn-submit-event';
            }
        });
    });

    // Scroll reveal
    var revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        revealElements.forEach(function(el) { observer.observe(el); });
    }

    // Scroll-to-top button
    window.addEventListener('scroll', function() {
        var btn = document.getElementById('scrollTopBtn');
        if (btn) btn.classList.toggle('visible', scrollY > 400);
    });
});
