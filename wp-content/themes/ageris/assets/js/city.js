(function () {
  var COOKIE = 'city';
  var COOKIE_NAME = 'city_name';
  var MAX_AGE = 182 * 24 * 60 * 60; // ~6 месяцев
  var ROOT_SELECTOR = '.city';      // корневой блок города в шапке

  var root = document.querySelector(ROOT_SELECTOR);
  var popup = document.getElementById('city-popup');
  if (!root || !popup) return;

  var nameEl = root.querySelector('.city-name');
  var content = popup.querySelector('.city-popup__content');
  var built = false;

  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  function setCookie(name, value) {
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; path=/; max-age=' + MAX_AGE + '; SameSite=Lax';
  }

  function saveCity(slug, name) {
    setCookie(COOKIE, slug);
    setCookie(COOKIE_NAME, name);
  }

  function removeConfirm() {
    var box = root.querySelector('.confirm-city');
    if (box) box.remove();
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Строим список городов, сгруппированный по первой букве
  function buildList() {
    var groups = {};
    var order = [];
    (SK_CITY.cities || []).forEach(function (c) {
      var letter = c.n.charAt(0).toUpperCase();
      if (!groups[letter]) { groups[letter] = []; order.push(letter); }
      groups[letter].push(c);
    });

    var html = '<div class="cities-container">';
    order.forEach(function (letter) {
      html += '<div class="letter-block"><div class="letter">' + escapeHtml(letter) +
              '</div><div class="cities">';
      groups[letter].forEach(function (c) {
        html += '<a href="#" data-city="' + escapeHtml(c.s) + '">' + escapeHtml(c.n) + '</a>';
      });
      html += '</div></div>';
    });
    html += '</div>';

    content.innerHTML = html;
    built = true;
  }

  // Подсветка текущего города в списке
  function markActive() {
    var current = root.dataset.city;
    content.querySelectorAll('a[data-city]').forEach(function (a) {
      a.classList.toggle('is-active', a.dataset.city === current);
    });
  }

  // Город уже выбран ранее: не спрашиваем и показываем сохранённый
  var savedSlug = getCookie(COOKIE);
  if (savedSlug) {
    removeConfirm();
    var savedName = getCookie(COOKIE_NAME);
    if (savedName) {
      nameEl.textContent = savedName;
      root.dataset.city = savedSlug;
    }
  }

  function openPopup() {
    if (!built) buildList();
    markActive();
    popup.hidden = false;
  }

  function closePopup() { popup.hidden = true; }

  document.addEventListener('click', function (e) {
    var t = e.target;

    // Клик по названию города: открыть попап выбора
    if (t.closest(ROOT_SELECTOR + ' .city-name')) {
      removeConfirm();
      openPopup();
      return;
    }

    // «Все верно»
    if (t.closest('.confirm-city .blue-button')) {
      saveCity(root.dataset.city, nameEl.textContent.trim());
      removeConfirm();
      return;
    }

    // «Сменить город»
    if (t.closest('.confirm-city .base-button')) {
      removeConfirm();
      openPopup();
      return;
    }

    // Выбор города в попапе
    var link = t.closest('#city-popup a[data-city]');
    if (link) {
      e.preventDefault();
      var name = link.textContent.trim();
      saveCity(link.dataset.city, name);
      root.dataset.city = link.dataset.city;
      nameEl.textContent = name;
      removeConfirm();
      closePopup();
      // location.reload(); // раскомментируйте, если баннеры по городу выводятся на сервере
      return;
    }

    if (t.closest('.city-popup__overlay') || t.closest('.city-popup__close')) {
      closePopup();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePopup();
  });
})();