/* ===== Demo mini-game: guess Lionel Messi's details ===== */
(function () {
  const form = document.getElementById('demoForm');
  if (!form) return; // only on the home page

  // ---- Player data (accept lists are matched after normalize) ----
  const PLAYER = {
    country: {
      accept: ['arjantin', 'argentina'],
      answer: { tr: 'Arjantin', en: 'Argentina' },
      hint:   { tr: 'Güney Amerikalı; mavi-beyaz milli forma 🇦🇷', en: 'South American; blue-and-white national kit 🇦🇷' }
    },
    year: {
      accept: ['1987'],
      answer: { tr: '1987 (24 Haziran)', en: '1987 (June 24)' },
      hint:   { tr: "1980'lerin ikinci yarısında, Rosario'da doğdu", en: 'Born in the late 1980s, in Rosario' }
    },
    club: {
      accept: ['barcelona', 'barca', 'fcbarcelona', 'psg', 'parissaintgermain', 'paris',
               'intermiami', 'miami', 'newells', 'newellsoldboys'],
      answer: { tr: 'Barcelona, PSG, Inter Miami (altyapı: Newell’s)', en: 'Barcelona, PSG, Inter Miami (youth: Newell’s)' },
      hint:   { tr: 'Kariyerine bir Katalan devinde başladı 🔵🔴', en: 'He started his career at a Catalan giant 🔵🔴' }
    },
    trophy: {
      accept: ['dunyakupasi', 'worldcup', 'ballondor', 'altintop', 'sampiyonlarligi', 'sampiyonlar',
               'championsleague', 'ucl', 'copaamerica', 'laliga'],
      answer: { tr: 'Dünya Kupası 2022, 8× Ballon d’Or, 4× Şampiyonlar Ligi, Copa América…',
                en: '2022 World Cup, 8× Ballon d’Or, 4× Champions League, Copa América…' },
      hint:   { tr: '2022’de milli takımıyla en büyük kupayı kaldırdı 🏆', en: 'In 2022 he lifted the biggest trophy of all with his country 🏆' }
    }
  };

  const FB = {
    correct: { tr: '✓ Doğru!', en: '✓ Correct!' },
    wrong:   { tr: '✗ Doğru cevap: ', en: '✗ Correct answer: ' },
    empty:   { tr: '✗ Boş bıraktın. Doğru cevap: ', en: '✗ You left it empty. Correct answer: ' }
  };

  const keys = Object.keys(PLAYER);
  const scoreEl   = document.getElementById('demoScore');
  const actionsEl = document.getElementById('demoActions');
  const resetBtn  = document.getElementById('demoReset');
  const submitBtn = form.querySelector('.demo-submit');

  // per-field state for re-rendering on language change
  const state = {};
  keys.forEach(k => (state[k] = { hint: false, result: null })); // result: 'ok' | 'no' | null
  let submitted = false;
  let score = 0;

  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'tr');

  function normalize(s) {
    return (s || '')
      .toLowerCase()
      .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c')
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o')
      .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip remaining accents
      .replace(/[^a-z0-9]/g, '');
  }

  function isCorrect(key, value) {
    const n = normalize(value);
    if (!n) return false;
    return PLAYER[key].accept.some(tok => n === tok || n.includes(tok));
  }

  function fieldEl(key) { return form.querySelector('.demo-field[data-key="' + key + '"]'); }

  function scoreMessage(sc, total, lg) {
    const msgs = {
      tr: ['Boş verme, uygulamada kolayca gelişirsin! 😄', 'Isınıyorsun! 💪',
           'Fena değil, biraz pratik iş görür. ⚽', 'Çok iyi, az kaldı! 👏',
           'Efsane! Sen tam bir futbol fanatiğisin. 🔥'],
      en: ["Don't worry, you'll level up fast in the app! 😄", 'Warming up! 💪',
           'Not bad, a little practice helps. ⚽', 'Great, so close! 👏',
           "Legendary! You're a true football fanatic. 🔥"]
    };
    return msgs[lg][sc] || msgs[lg][0];
  }

  // ---- Render dynamic (language-aware) bits ----
  function render() {
    const lg = lang();
    keys.forEach(key => {
      const el = fieldEl(key);
      const hintEl = el.querySelector('.demo-hint');
      const fbEl = el.querySelector('.demo-feedback');
      const st = state[key];

      // hint
      if (st.hint) { hintEl.textContent = '💡 ' + PLAYER[key].hint[lg]; hintEl.hidden = false; }
      else { hintEl.hidden = true; }

      // feedback
      if (st.result === 'ok') {
        fbEl.textContent = FB.correct[lg];
        fbEl.className = 'demo-feedback ok';
        fbEl.hidden = false;
      } else if (st.result === 'no' || st.result === 'empty') {
        const lead = st.result === 'empty' ? FB.empty[lg] : FB.wrong[lg];
        fbEl.textContent = lead + PLAYER[key].answer[lg];
        fbEl.className = 'demo-feedback no';
        fbEl.hidden = false;
      } else {
        fbEl.hidden = true;
      }
    });

    if (submitted) {
      scoreEl.innerHTML =
        '<div class="score-num">' + score + '/' + keys.length + '</div>' +
        '<div class="score-msg">' + scoreMessage(score, keys.length, lg) + '</div>';
      scoreEl.hidden = false;
      actionsEl.hidden = false;
    } else {
      scoreEl.hidden = true;
      actionsEl.hidden = true;
    }
  }

  // ---- Hint buttons ----
  keys.forEach(key => {
    const el = fieldEl(key);
    el.querySelector('.demo-hint-btn').addEventListener('click', () => {
      if (submitted) return;
      state[key].hint = true;
      el.querySelector('.demo-hint-btn').disabled = true;
      render();
    });
  });

  // ---- Submit ----
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitted) return;
    score = 0;
    keys.forEach(key => {
      const el = fieldEl(key);
      const input = el.querySelector('input');
      const val = input.value.trim();
      const ok = isCorrect(key, val);
      el.classList.remove('correct', 'wrong');
      el.classList.add(ok ? 'correct' : 'wrong');
      state[key].result = ok ? 'ok' : (val ? 'no' : 'empty');
      if (ok) score++;
      input.disabled = true;
      el.querySelector('.demo-hint-btn').disabled = true;
    });
    submitted = true;
    submitBtn.hidden = true;
    render();
    scoreEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // ---- Reset ----
  resetBtn.addEventListener('click', () => {
    submitted = false;
    score = 0;
    keys.forEach(key => {
      const el = fieldEl(key);
      const input = el.querySelector('input');
      input.value = '';
      input.disabled = false;
      el.classList.remove('correct', 'wrong');
      el.querySelector('.demo-hint-btn').disabled = false;
      state[key] = { hint: false, result: null };
    });
    submitBtn.hidden = false;
    render();
    form.querySelector('input').focus();
  });

  // ---- Keep dynamic text in sync when language toggles ----
  document.addEventListener('langchange', render);
})();
