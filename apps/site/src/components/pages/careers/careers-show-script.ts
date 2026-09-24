/**
 * Script de carriere/show.html.twig (bloc page_scripts) : nom du CV choisi et
 * envoi AJAX de la candidature, adressé à l'API publique (multipart, champs
 * sans préfixe « candidate_application[…] », même réponse JSON que l'ancien
 * contrôleur). Libellés encodés en JSON.
 */
import { trans, type Locale } from '@/i18n/translator';

export function applicationScript(locale: Locale, slug: string): string {
  const label = (key: string) => JSON.stringify(trans(locale, key));
  const action = JSON.stringify(`/api/public/${locale}/job-offers/${encodeURIComponent(slug)}/applications`);
  return `(function () {
  'use strict';

  var cvInput = document.querySelector('input[type="file"]');
  var cvLabel = document.getElementById('cv-filename');
  if (cvInput && cvLabel) {
    cvInput.addEventListener('change', function () {
      if (this.files && this.files.length > 0) {
        cvLabel.textContent = this.files[0].name;
      } else {
        cvLabel.textContent = 'Choisir votre CV';
      }
    });
  }

  var form = document.getElementById('candidature-form');
  var card = document.getElementById('candidature-form-card');
  var btn  = document.getElementById('candidature-submit');

  if (!form || !card) return;

  var submitHtml = '<i class="fa-solid fa-paper-plane me-2"></i> ' + ${label('carriere.show.submit')};

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    card.querySelectorAll('.ajax-candidature-error').forEach(function (el) { el.remove(); });

    if (btn) {
      btn.disabled = true;
      btn.querySelector('.contact-form__send-text').innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-2"></i> Envoi en cours…';
    }

    fetch(${action}, {
      method : 'POST',
      body   : new FormData(form),
      headers: { 'Accept': 'application/json' },
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          var title = document.createElement('h3');
          title.style.marginBottom = '.75rem';
          title.textContent = ${label('carriere.show.sent')};
          var message = document.createElement('p');
          message.textContent = data.message;
          var other = document.createElement('a');
          other.href = '/carrieres';
          other.style.color = '#36A9E1';
          other.textContent = ${label('carriere.show.see_other')};
          card.innerHTML =
            '<div class="contact-form-success" role="alert" style="text-align:center; padding:3rem 2rem;">' +
            '<div style="font-size:3rem; margin-bottom:1rem; color:#36A9E1;"><i class="fa-solid fa-circle-check"></i></div>' +
            '</div>';
          var box = card.firstChild;
          box.appendChild(title);
          box.appendChild(message);
          box.appendChild(other);
          window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
        } else {
          if (btn) {
            btn.disabled = false;
            btn.querySelector('.contact-form__send-text').innerHTML = submitHtml;
          }
          if (data.errors) {
            Object.keys(data.errors).forEach(function (field) {
              var msgs = data.errors[field];
              if (!Array.isArray(msgs)) { msgs = [msgs]; }
              var el = form.querySelector('[name="' + field + '"]') || form;
              var errEl = document.createElement('p');
              errEl.className = 'ajax-candidature-error';
              errEl.style.cssText = 'color:#ef4444; font-size:.85rem; margin-top:.25rem;';
              errEl.textContent = msgs.join(' ');
              el.parentNode ? el.parentNode.appendChild(errEl) : card.appendChild(errEl);
            });
          }
        }
      })
      .catch(function () {
        if (btn) {
          btn.disabled = false;
          btn.querySelector('.contact-form__send-text').innerHTML = submitHtml;
        }
      });
  });
}());`;
}
