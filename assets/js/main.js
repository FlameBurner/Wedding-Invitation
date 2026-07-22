(() => {
  // Show the guest's name from the ?to= URL parameter
  const params = new URLSearchParams(location.search);
  const guest = params.get('to');
  if (guest) document.getElementById('guest-name').textContent = guest;

  // Fade out the intro animation
  setTimeout(() => document.getElementById('intro').classList.add('intro-out'), 4900);

  // "Buka Undangan" button: reveal the site and start the gallery video
  document.getElementById('open-invitation').addEventListener('click', () => {
    document.getElementById('cover').classList.add('cover-hidden');
    document.body.classList.remove('invitation-locked');
    if (galleryVideo) galleryVideo.play().catch(() => {});
  });

  // Hero photo slideshow
  const slides = [...document.querySelectorAll('.slide')];
  const dots = [...document.querySelectorAll('.dots button')];
  let current = 0;
  let timer;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((el, i) => el.classList.toggle('active', i === current));
    dots.forEach((el, i) => el.classList.toggle('active', i === current));
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => show(current + 1), 5000);
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    show(i);
    restart();
  }));
  restart();

  // Gallery arrows
  const gallery = document.querySelector('.gallery-track');
  document.querySelector('.gallery-arrow.previous').addEventListener('click', () => {
    gallery.scrollBy({ left: -gallery.clientWidth * 0.9, behavior: 'smooth' });
  });
  document.querySelector('.gallery-arrow.next').addEventListener('click', () => {
    gallery.scrollBy({ left: gallery.clientWidth * 0.9, behavior: 'smooth' });
  });

  // Countdown to the wedding
  const wedding = new Date('2026-07-27T16:00:00+08:00');

  function tick() {
    const d = Math.max(0, wedding - Date.now());
    const values = [
      Math.floor(d / 86400000),
      Math.floor(d / 3600000) % 24,
      Math.floor(d / 60000) % 60,
      Math.floor(d / 1000) % 60,
    ];
    ['days', 'hours', 'minutes', 'seconds'].forEach((id, i) => {
      document.getElementById(id).textContent = String(values[i]).padStart(2, '0');
    });
  }
  tick();
  setInterval(tick, 1000);

  // Fade-in on scroll for elements with the .reveal class
  const observer = new IntersectionObserver((items) => {
    items.forEach((item) => {
      if (item.isIntersecting) {
        item.target.classList.add('in-view');
        observer.unobserve(item.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // Small helper for talking to api.php
  const api = async (data = null) => {
    const response = await fetch('api.php', data
      ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }
      : {});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Something went wrong.');
    return result;
  };

  // RSVP form
  document.getElementById('rsvp-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = e.target.querySelector('.form-status');
    status.textContent = 'Menyimpan...';
    try {
      const data = Object.fromEntries(new FormData(e.target));
      await api({ action: 'rsvp', ...data });
      e.target.reset();
      status.textContent = 'Terima kasih, RSVP Anda telah diterima.';
    } catch (error) {
      status.textContent = error.message;
    }
  });

  // Wishes / ucapan list
  const list = document.getElementById('wish-list');
  const safe = (value) => String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

  async function renderWishes() {
    try {
      const { wishes } = await api();
      list.innerHTML = wishes.map((w) => `
        <article class="wish">
          <p>“${safe(w.wish)}”</p>
          <span>— ${safe(w.name)}</span>
        </article>
      `).join('') || '<p class="form-status">Jadilah yang pertama mengirim ucapan.</p>';
    } catch (error) {
      list.innerHTML = '<p class="form-status">Ucapan belum dapat dimuat.</p>';
    }
  }
  renderWishes();

  document.getElementById('wish-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(e.target));
      await api({ action: 'wish', ...data });
      e.target.reset();
      renderWishes();
    } catch (error) {
      alert(error.message);
    }
  });

  // Music / video sound toggle
  const musicToggle = document.getElementById('music-toggle');
  const galleryVideo = document.querySelector('.gallery-video video');

  function syncSoundButton() {
    if (!galleryVideo) return;
    const muted = galleryVideo.muted;
    musicToggle.textContent = muted ? '♩' : '♫';
    musicToggle.classList.toggle('playing', !muted);
    musicToggle.setAttribute('aria-label', muted ? 'Unmute video sound' : 'Mute video sound');
  }

  if (galleryVideo) {
    galleryVideo.addEventListener('volumechange', syncSoundButton);
    syncSoundButton();
  }

  musicToggle.addEventListener('click', () => {
    if (galleryVideo) galleryVideo.muted = !galleryVideo.muted;
  });
})();
