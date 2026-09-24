/**
 * Script de la page contact (bloc page_scripts de contact/index.html.twig) :
 * autocomplétion du sujet, inchangée ; soumission AJAX envoyée directement à
 * l'API publique (même réponse que l'ancien contrôleur : {success, message}
 * ou {success: false, errors}), champs sans préfixe « contact[…] ».
 */
export const CONTACT_SCRIPT = String.raw`(function () {
  'use strict';

  /* ── Autocomplete sujet ── */
  var wrapper = document.querySelector('.subject-autocomplete');
  if (wrapper) {
    var input = wrapper.querySelector('.subject-autocomplete__input');
    var list  = wrapper.querySelector('.subject-autocomplete__list');
    var items = list.querySelectorAll('.subject-autocomplete__item');

    function show(filter) {
      var val = (filter || '').toLowerCase().trim();
      var count = 0;
      items.forEach(function (item) {
        var match = !val || item.textContent.toLowerCase().indexOf(val) !== -1;
        item.style.display = match ? '' : 'none';
        if (match) count++;
      });
      list.classList.toggle('is-open', count > 0);
    }

    function hide() { list.classList.remove('is-open'); }

    function select(item) {
      input.value = item.textContent.trim();
      hide();
    }

    input.addEventListener('focus', function () { show(input.value); });
    input.addEventListener('click', function () { show(input.value); });
    input.addEventListener('input', function () { show(input.value); });

    items.forEach(function (item) {
      item.addEventListener('mousedown', function (e) {
        e.preventDefault();
        select(item);
      });
      var touchStartY = 0;
      item.addEventListener('touchstart', function (e) {
        touchStartY = e.touches[0].clientY;
      }, { passive: true });
      item.addEventListener('touchend', function (e) {
        if (Math.abs(e.changedTouches[0].clientY - touchStartY) < 10) {
          e.preventDefault();
          select(item);
        }
      });
    });

    document.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target)) hide();
    });
    document.addEventListener('touchstart', function (e) {
      if (!wrapper.contains(e.target)) hide();
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hide();
    });
  }

  /* ── Soumission AJAX du formulaire de contact (API publique) ── */
  var form = document.getElementById('contact-form');
  var card = document.getElementById('contact-form-card');
  if (!form || !card) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    /* Effacer les erreurs précédentes */
    card.querySelectorAll('.ajax-form-error').forEach(function (el) { el.remove(); });

    var btn = form.querySelector('.contact-form__send');
    if (btn) btn.disabled = true;

    fetch(form.getAttribute('action'), {
      method: 'POST',
      body: new URLSearchParams(new FormData(form)),
      headers: { 'Accept': 'application/json' },
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          if (btn) btn.disabled = false;
          card.querySelectorAll('.ajax-contact-success').forEach(function (el) { el.remove(); });
          var msg = document.createElement('div');
          msg.className = 'contact-form-success ajax-contact-success';
          msg.setAttribute('role', 'alert');
          msg.innerHTML = '<p>' + data.message + '</p>';
          btn ? btn.parentNode.insertAdjacentElement('afterend', msg) : form.appendChild(msg);
          form.reset();
        } else {
          if (btn) btn.disabled = false;
          if (data.errors) {
            Object.keys(data.errors).forEach(function (field) {
              var input = form.querySelector('[name="' + field + '"]');
              var err = document.createElement('p');
              err.className = 'ajax-form-error';
              err.textContent = data.errors[field].join(' ');
              /* Erreur sans champ (ex. « general » : trop de tentatives) : sous le bouton. */
              if (!input) { btn ? btn.parentNode.insertAdjacentElement('afterend', err) : form.appendChild(err); return; }
              input.closest('.col-md-4, .col-12') ? input.closest('.col-md-4, .col-12').appendChild(err) : input.parentNode.appendChild(err);
            });
          }
        }
      })
      .catch(function () {
        if (btn) btn.disabled = false;
      });
  });
}());`;
