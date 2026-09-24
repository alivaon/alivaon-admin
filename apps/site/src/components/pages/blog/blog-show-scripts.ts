/**
 * Scripts de blog/show.html.twig.
 * -               (function () {
                var PROVIDERS = [
                  {
                    pattern: /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
                    embed: function (m) { return 'https://www.youtube.com/embed/' + m[1] + '?rel=0'; },
                  },
                  {
                    pattern: /vimeo\.com\/(?:video\/)?(\d+)/,
                    embed: function (m) { return 'https://player.vimeo.com/video/' + m[1]; },
                  },
                  {
                    pattern: /dailymotion\.com\/(?:video\/|embed\/video\/)([a-zA-Z0-9]+)/,
                    embed: function (m) { return 'https://www.dailymotion.com/embed/video/' + m[1]; },
                  },
                ];

                function oembedToIframe(url) {
                  for (var i = 0; i < PROVIDERS.length; i++) {
                    var m = url.match(PROVIDERS[i].pattern);
                    if (m) {
                      var iframe = document.createElement('iframe');
                      iframe.src = PROVIDERS[i].embed(m);
                      iframe.allowFullscreen = true;
                      iframe.loading = 'lazy';
                      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                      iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;';
                      return iframe;
                    }
                  }
                  return null;
                }

                function renderOembeds() {
                  document.querySelectorAll('#article-body figure.media oembed[url]').forEach(function (el) {
                    var url = el.getAttribute('url');
                    var figure = el.closest('figure.media') || el.parentNode;
                    var iframe = oembedToIframe(url);

                    var wrapper = document.createElement('div');
                    wrapper.style.cssText = 'position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;margin:1.5rem 0;';

                    if (iframe) {
                      wrapper.appendChild(iframe);
                    } else {
                      var link = document.createElement('a');
                      link.href = url;
                      link.textContent = url;
                      link.target = '_blank';
                      link.rel = 'noopener noreferrer';
                      wrapper.style.padding = '0';
                      wrapper.appendChild(link);
                    }

                    figure.replaceWith(wrapper);
                  });
                }

                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', renderOembeds);
                } else {
                  renderOembeds();
                }
                document.addEventListener('turbo:load', renderOembeds);
              }());
_SCRIPT : vidéos intégrées par CKEditor (<oembed>) → lecteurs, inchangé.
 * - commentScript : réponse à un commentaire et envoi AJAX, adressé à l'API
 *   publique (champs sans préfixe « comment[…] », même réponse JSON que
 *   l'ancien contrôleur) ; libellés encodés en JSON.
 * - viewScript : compteur de vues. La page est servie depuis le cache : c'est
 *   le navigateur qui signale la vue (POST …/views), voir docs/api.md.
 */
import { trans, type Locale } from '@/i18n/translator';

export const OEMBED_SCRIPT = String.raw`              (function () {
                var PROVIDERS = [
                  {
                    pattern: /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
                    embed: function (m) { return 'https://www.youtube.com/embed/' + m[1] + '?rel=0'; },
                  },
                  {
                    pattern: /vimeo\.com\/(?:video\/)?(\d+)/,
                    embed: function (m) { return 'https://player.vimeo.com/video/' + m[1]; },
                  },
                  {
                    pattern: /dailymotion\.com\/(?:video\/|embed\/video\/)([a-zA-Z0-9]+)/,
                    embed: function (m) { return 'https://www.dailymotion.com/embed/video/' + m[1]; },
                  },
                ];

                function oembedToIframe(url) {
                  for (var i = 0; i < PROVIDERS.length; i++) {
                    var m = url.match(PROVIDERS[i].pattern);
                    if (m) {
                      var iframe = document.createElement('iframe');
                      iframe.src = PROVIDERS[i].embed(m);
                      iframe.allowFullscreen = true;
                      iframe.loading = 'lazy';
                      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                      iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;';
                      return iframe;
                    }
                  }
                  return null;
                }

                function renderOembeds() {
                  document.querySelectorAll('#article-body figure.media oembed[url]').forEach(function (el) {
                    var url = el.getAttribute('url');
                    var figure = el.closest('figure.media') || el.parentNode;
                    var iframe = oembedToIframe(url);

                    var wrapper = document.createElement('div');
                    wrapper.style.cssText = 'position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;margin:1.5rem 0;';

                    if (iframe) {
                      wrapper.appendChild(iframe);
                    } else {
                      var link = document.createElement('a');
                      link.href = url;
                      link.textContent = url;
                      link.target = '_blank';
                      link.rel = 'noopener noreferrer';
                      wrapper.style.padding = '0';
                      wrapper.appendChild(link);
                    }

                    figure.replaceWith(wrapper);
                  });
                }

                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', renderOembeds);
                } else {
                  renderOembeds();
                }
                document.addEventListener('turbo:load', renderOembeds);
              }());
`;

export function commentScript(locale: Locale, slug: string): string {
  const label = (key: string) => JSON.stringify(trans(locale, key));
  const action = JSON.stringify(`/api/public/${locale}/articles/${encodeURIComponent(slug)}/comments`);
  return `(function () {
  function initCommentForm() {
    var parentIdInput = document.getElementById('comment_parentId');
    var formTitle = document.getElementById('comment-form-title');
    var replyNotice = document.getElementById('comment-reply-notice');
    var replyText = document.getElementById('comment-reply-text');
    var cancelBtn = document.getElementById('comment-cancel-reply');
    var formWrap = document.getElementById('comment-form');
    var form = formWrap ? formWrap.querySelector('form') : null;

    if (!form) return;

    document.querySelectorAll('.comment-reply-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var commentId = btn.getAttribute('data-comment-id');
        var authorName = btn.getAttribute('data-author-name');
        parentIdInput.value = commentId;
        formTitle.textContent = ${label('blog.show.reply_to')} + ' ' + authorName;
        replyText.textContent = ${label('blog.show.replying_to')} + ' ' + authorName;
        replyNotice.style.display = 'block';
      });
    });

    if (cancelBtn) {
      cancelBtn.addEventListener('click', function (e) {
        e.preventDefault();
        parentIdInput.value = '';
        formTitle.textContent = ${label('blog.show.leave_comment')};
        replyNotice.style.display = 'none';
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      formWrap.querySelectorAll('.ajax-form-error').forEach(function (el) { el.remove(); });

      var btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;

      var body = new URLSearchParams(new FormData(form));
      if (!parentIdInput.value) body.delete('parentId');

      fetch(${action}, {
        method: 'POST',
        body: body,
        headers: { 'Accept': 'application/json' },
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
            if (btn) btn.disabled = false;
            var existing = formWrap.querySelector('.ajax-comment-success');
            if (!existing) {
              var msg = document.createElement('div');
              msg.className = 'alert alert-success ajax-comment-success';
              msg.setAttribute('role', 'alert');
              msg.style.cssText = 'margin-bottom:1rem;';
              msg.textContent = data.message;
              form.parentNode.insertBefore(msg, form);
            }
            form.reset();
            parentIdInput.value = '';
            formTitle.textContent = ${label('blog.show.leave_comment')};
            if (replyNotice) replyNotice.style.display = 'none';
          } else {
            if (btn) btn.disabled = false;
            if (data.errors) {
              Object.keys(data.errors).forEach(function (field) {
                var input = form.querySelector('[name="' + field + '"]');
                var err = document.createElement('p');
                err.className = 'ajax-form-error';
                err.style.cssText = 'color:#e74c3c;font-size:.85rem;margin-top:.25rem;';
                err.textContent = data.errors[field].join(' ');
                /* Erreur sans champ (ex. « general » : trop de tentatives) : sous le bouton. */
                if (!input || input.type === 'hidden') { (btn ? btn.parentNode : form).appendChild(err); return; }
                input.parentNode.appendChild(err);
              });
            }
          }
        })
        .catch(function () {
          if (btn) btn.disabled = false;
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommentForm);
  } else {
    initCommentForm();
  }
}());`;
}

export function viewScript(locale: Locale, slug: string): string {
  return `fetch(${JSON.stringify(`/api/public/${locale}/articles/${encodeURIComponent(slug)}/views`)}, { method: 'POST', keepalive: true }).catch(function () {});`;
}
