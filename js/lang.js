/**
 * RHP FILMES — Sistema Bilíngue (PT / EN)
 * Alternância instantânea sem recarregamento e sem layout shift.
 * Persistência via localStorage e suporte a query param (?lang=en) / hash (#en).
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'rhp_filmes_lang';

  function getTargetLang() {
    try {
      // 1. Query parameter ?lang=en ou ?lang=pt
      var params = new URLSearchParams(window.location.search);
      var queryLang = params.get('lang');
      if (queryLang === 'en' || queryLang === 'pt') return queryLang;

      // 2. Hash #en ou #pt
      var hash = (window.location.hash || '').toLowerCase();
      if (hash === '#en') return 'en';
      if (hash === '#pt') return 'pt';

      // 3. Preferência salva no navegador
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'pt') return saved;
    } catch (e) {
      // Fallback gracioso caso localStorage esteja bloqueado
    }
    return 'pt';
  }

  function setLanguage(lang) {
    var isEn = (lang === 'en');
    var html = document.documentElement;

    html.lang = isEn ? 'en' : 'pt-BR';
    if (isEn) {
      html.setAttribute('data-lang', 'en');
    } else {
      html.removeAttribute('data-lang');
    }

    try {
      localStorage.setItem(STORAGE_KEY, isEn ? 'en' : 'pt');
    } catch (e) {}

    // Sincroniza estado visual dos seletores de idioma
    var buttons = document.querySelectorAll('.lang-switch, .lang-btn, .lang-toggle-minimal');
    buttons.forEach(function (btn) {
      var ptOpt = btn.querySelector('.lang-opt-pt');
      var enOpt = btn.querySelector('.lang-opt-en');
      if (ptOpt && enOpt) {
        if (isEn) {
          ptOpt.classList.remove('active');
          enOpt.classList.add('active');
        } else {
          ptOpt.classList.add('active');
          enOpt.classList.remove('active');
        }
      }
    });

    // Atualiza title da página se configurado com data-title-pt e data-title-en
    var titleEl = document.querySelector('title');
    if (titleEl) {
      var ptTitle = titleEl.getAttribute('data-pt');
      var enTitle = titleEl.getAttribute('data-en');
      if (isEn && enTitle) {
        titleEl.textContent = enTitle;
      } else if (!isEn && ptTitle) {
        titleEl.textContent = ptTitle;
      }
    }
  }

  // Execução imediata no carregamento para evitar FOUC
  var initialLang = getTargetLang();
  setLanguage(initialLang);

  // Vincula ouvintes de eventos após parse do DOM
  document.addEventListener('DOMContentLoaded', function () {
    setLanguage(getTargetLang());

    // Listener delegado ou direto para elementos de troca
    document.addEventListener('click', function (e) {
      var target = e.target.closest('.lang-switch, .lang-btn, .lang-toggle-minimal, [data-set-lang]');
      if (!target) return;

      e.preventDefault();
      var explicitLang = target.getAttribute('data-set-lang');
      var currentLang = (document.documentElement.lang === 'en') ? 'en' : 'pt';
      var nextLang = explicitLang ? explicitLang : (currentLang === 'en' ? 'pt' : 'en');
      setLanguage(nextLang);
    });
  });

  // Exporta função global para testes se necessário
  window.RHP_Lang = {
    set: setLanguage,
    get: getTargetLang
  };
})();
