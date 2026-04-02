/**
 * IMPULSOIL — main.js
 * Production JavaScript — no console.log, no jQuery, no external libraries.
 * Vanilla JS, ES6+, clean and self-contained.
 */

(function () {
  'use strict';

  /* ============================================================
     1. UTILITY FUNCTIONS
  ============================================================ */

  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.from((context || document).querySelectorAll(selector));
  }

  function debounce(fn, delay) {
    var timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  /* ============================================================
     2. HEADER — Scroll state
  ============================================================ */

  function initHeader() {
    var header = $('#site-header');
    if (!header) return;

    var scrollThreshold = 40;

    function handleScroll() {
      if (window.scrollY > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ============================================================
     3. MOBILE NAV TOGGLE
  ============================================================ */

  function initMobileNav() {
    var toggleBtn = $('#nav-mobile-toggle');
    var mobileMenu = $('#nav-mobile-menu');
    if (!toggleBtn || !mobileMenu) return;

    var mobileLinks = $$('.nav-mobile-link, .nav-mobile-cta', mobileMenu);
    var isOpen = false;

    function openMenu() {
      isOpen = true;
      toggleBtn.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      isOpen = false;
      toggleBtn.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', function () {
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
        toggleBtn.focus();
      }
    });
  }

  /* ============================================================
     4. SMOOTH SCROLL — Anchor links
  ============================================================ */

  function initSmoothScroll() {
    var headerHeight = 72;

    document.addEventListener('click', function (e) {
      var anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      var href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      var target = document.getElementById(href.slice(1));
      if (!target) return;

      e.preventDefault();

      var targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    });
  }

  /* ============================================================
     5. SCROLL REVEAL — Intersection Observer
  ============================================================ */

  function initScrollReveal() {
    var elements = $$('.reveal-up, .reveal-left, .reveal-right');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -48px 0px'
      }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ============================================================
     6. STICKY MOBILE CTA — Show/hide logic
  ============================================================ */

  function initStickyMobileCta() {
    var ctaBar = $('#sticky-mobile-cta');
    var hero = $('#hero');
    if (!ctaBar || !hero) return;

    function updateCta() {
      var heroBottom = hero.getBoundingClientRect().bottom;
      if (heroBottom < 0) {
        ctaBar.classList.add('visible');
        ctaBar.setAttribute('aria-hidden', 'false');
        var btn = ctaBar.querySelector('.sticky-mobile-btn');
        if (btn) btn.removeAttribute('tabindex');
      } else {
        ctaBar.classList.remove('visible');
        ctaBar.setAttribute('aria-hidden', 'true');
        var btn2 = ctaBar.querySelector('.sticky-mobile-btn');
        if (btn2) btn2.setAttribute('tabindex', '-1');
      }
    }

    window.addEventListener('scroll', updateCta, { passive: true });
    updateCta();
  }

  /* ============================================================
     7. SERVICE CARD WHATSAPP — Per-service links
  ============================================================ */

  function initServiceCards() {
    var cards = $$('.servicio-card[data-whatsapp]');

    cards.forEach(function (card) {
      var whatsappMsg = card.getAttribute('data-whatsapp');
      var btn = card.querySelector('.btn-servicio');
      if (!btn || !whatsappMsg) return;

      var whatsappUrl = 'https://wa.me/5491159719731?text=' + whatsappMsg;

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      });

      card.addEventListener('click', function (e) {
        if (e.target === btn || btn.contains(e.target)) return;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      });

      card.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === card) {
          e.preventDefault();
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        }
      });

      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
    });
  }

  /* ============================================================
     8. CONTACT FORM — Validation + Formspree submission
  ============================================================ */

  function initContactForm() {
    var form = $('#contacto-form');
    if (!form) return;

    var submitBtn = $('#form-submit-btn');
    var statusEl = $('#form-status');

    var fields = {
      nombre: {
        el: form.querySelector('#nombre'),
        errorEl: form.querySelector('#nombre-error'),
        validate: function (v) {
          if (!v.trim()) return 'Por favor ingrese su nombre.';
          if (v.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres.';
          return null;
        }
      },
      email: {
        el: form.querySelector('#email'),
        errorEl: form.querySelector('#email-error'),
        validate: function (v) {
          if (!v.trim()) return 'Por favor ingrese su correo electrónico.';
          var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(v.trim())) return 'Por favor ingrese un correo electrónico válido.';
          return null;
        }
      },
      consulta: {
        el: form.querySelector('#consulta'),
        errorEl: form.querySelector('#consulta-error'),
        validate: function (v) {
          if (!v.trim()) return 'Por favor ingrese su consulta.';
          if (v.trim().length < 10) return 'La consulta debe tener al menos 10 caracteres.';
          return null;
        }
      }
    };

    function setFieldError(fieldKey, message) {
      var field = fields[fieldKey];
      if (!field) return;
      if (message) {
        field.el.classList.add('error');
        field.errorEl.textContent = message;
      } else {
        field.el.classList.remove('error');
        field.errorEl.textContent = '';
      }
    }

    function validateField(fieldKey) {
      var field = fields[fieldKey];
      if (!field) return true;
      var error = field.validate(field.el.value);
      setFieldError(fieldKey, error);
      return !error;
    }

    function validateAll() {
      var valid = true;
      Object.keys(fields).forEach(function (key) {
        if (!validateField(key)) valid = false;
      });
      return valid;
    }

    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      if (!field.el) return;

      field.el.addEventListener('blur', function () {
        validateField(key);
      });

      field.el.addEventListener('input', function () {
        if (field.el.classList.contains('error')) {
          validateField(key);
        }
      });
    });

    function setSubmitting(state) {
      if (state) {
        submitBtn.classList.add('form-submitting');
        submitBtn.disabled = true;
      } else {
        submitBtn.classList.remove('form-submitting');
        submitBtn.disabled = false;
      }
    }

    function showStatus(type, message) {
      statusEl.textContent = message;
      statusEl.className = 'form-status ' + type;
    }

    function hideStatus() {
      statusEl.className = 'form-status';
      statusEl.textContent = '';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideStatus();

      if (!validateAll()) {
        var firstError = form.querySelector('.form-input.error, .form-textarea.error');
        if (firstError) firstError.focus();
        return;
      }

      var formAction = form.getAttribute('action');

      if (formAction.includes('PLACEHOLDER')) {
        showStatus('error', 'El formulario no está configurado aún. Por favor contáctenos directamente por WhatsApp o email.');
        return;
      }

      setSubmitting(true);

      var formData = new FormData(form);

      fetch(formAction, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json'
        }
      })
        .then(function (response) {
          if (response.ok) {
            return response.json().then(function () {
              form.reset();
              showStatus('success', 'Consulta enviada correctamente. Rodolfo le responderá en menos de 24 horas hábiles.');
              setSubmitting(false);
              statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
          } else {
            return response.json().then(function (data) {
              if (data && data.errors) {
                var errMsg = data.errors.map(function (err) { return err.message; }).join(', ');
                showStatus('error', 'Error al enviar: ' + errMsg + '. Por favor intente nuevamente.');
              } else {
                showStatus('error', 'Error al enviar el formulario. Por favor intente nuevamente o contáctenos directamente.');
              }
              setSubmitting(false);
            });
          }
        })
        .catch(function () {
          showStatus('error', 'Error de conexión. Por favor verifique su conexión a internet e intente nuevamente.');
          setSubmitting(false);
        });
    });
  }

  /* ============================================================
     9. INIT — DOM Ready
  ============================================================ */

  function init() {
    initHeader();
    initMobileNav();
    initSmoothScroll();
    initScrollReveal();
    initStickyMobileCta();
    initServiceCards();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
