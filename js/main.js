/**
 * MODERN PERSONAL PORTFOLIO INTERACTIVE ENGINE
 * Author: Ritesh Chandan Ahire (Aspiring Software Engineer)
 * Features: Particle Mesh Canvas, Modals, Audio Synthesis, Dynamic Theming
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initTypewriter();
  initThemeManager();
  initAudioSystem();
  initScrollObservers();
  initStatsCounter();
  initAboutTabs();
  initProjectFilters();
  initProjectModals();
  initContactForm();
  initScrollProgress();
  initMobileNav();
});

/* ==========================================================================
   1. HIGH-PERFORMANCE PARTICLE MESH CANVAS
   ========================================================================== */
function initParticleCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];
  const particleCount = window.innerWidth < 768 ? 35 : 75;
  const maxDistance = 140;

  const mouse = {
    x: null,
    y: null,
    radius: 160
  };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.size = Math.random() * 2 + 1;
      this.baseAlpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 2.5;
          this.y -= (dy / dist) * force * 2.5;
        }
      }
    }

    draw() {
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || '#00f0ff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = this.baseAlpha;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || '#00f0ff';

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = accent;
          ctx.globalAlpha = (1 - dist / maxDistance) * 0.18;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }
  animate();
}

/* ==========================================================================
   2. DYNAMIC TYPEWRITER EFFECT
   ========================================================================== */
function initTypewriter() {
  const element = document.getElementById('typewriter-text');
  if (!element) return;

  const words = [
    'Aspiring Software Engineer'
  ];

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 80;

  function type() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      element.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 40;
    } else {
      element.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 90;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      if (words.length === 1) {
        // Keep single headline steady once fully typed
        return;
      }
      typingSpeed = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingSpeed = 400;
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/* ==========================================================================
   3. THEME ACCENT MANAGER
   ========================================================================== */
function initThemeManager() {
  const toggleBtn = document.getElementById('theme-picker-btn');
  const dropdown = document.getElementById('theme-dropdown');
  const options = document.querySelectorAll('.theme-option');

  // Load saved theme
  const savedTheme = localStorage.getItem('portfolio_accent_theme') || 'cyan';
  setTheme(savedTheme);

  if (toggleBtn && dropdown) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
      playSound('click');
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('show');
    });
  }

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      const theme = opt.getAttribute('data-theme-val');
      setTheme(theme);
      playSound('switch');
      if (dropdown) dropdown.classList.remove('show');
    });
  });

  function setTheme(theme) {
    if (theme === 'cyan') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('portfolio_accent_theme', theme);
  }
}

/* ==========================================================================
   4. LIGHTWEIGHT WEB AUDIO SYNTHESIS SYSTEM
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initAudioSystem() {
  const soundBtn = document.getElementById('sound-toggle-btn');
  const savedSound = localStorage.getItem('portfolio_sound_enabled');
  if (savedSound !== null) {
    soundEnabled = savedSound === 'true';
  }
  updateSoundBtnUI(soundBtn);

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('portfolio_sound_enabled', soundEnabled);
      updateSoundBtnUI(soundBtn);
      if (soundEnabled) playSound('click');
    });
  }
}

function updateSoundBtnUI(btn) {
  if (!btn) return;
  if (soundEnabled) {
    btn.setAttribute('title', 'Sound Effects: On');
    btn.classList.remove('muted');
    btn.style.opacity = '1';
  } else {
    btn.setAttribute('title', 'Sound Effects: Muted');
    btn.classList.add('muted');
    btn.style.opacity = '0.5';
  }
}

function playSound(type) {
  if (!soundEnabled) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'key') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440 + Math.random() * 120, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'switch') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (err) {
    // Gracefully handle autoplay restrictions
  }
}

/* ==========================================================================
   5. SCROLL OBSERVERS & NAVBAR STICKY
   ========================================================================== */
function initScrollObservers() {
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const reveals = document.querySelectorAll('.reveal-init');

  // Sticky Navbar & Active Spy
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    let currentSection = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentSection = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

  // Reveal Animations Observer
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // If it's a skill card, animate skill bars
        if (entry.target.classList.contains('skill-category-card')) {
          const bars = entry.target.querySelectorAll('.skill-bar-fill');
          bars.forEach(bar => {
            const width = bar.getAttribute('data-width') || '85%';
            bar.style.width = width;
          });
        }
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => revealObserver.observe(el));
}

/* ==========================================================================
   6. HERO STATS ANIMATED COUNTERS
   ========================================================================== */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  let started = false;
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'), 10) || 0;
        const suffix = stat.getAttribute('data-suffix') || '';
        let current = 0;
        const duration = 1400;
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = target / steps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            stat.textContent = target + suffix;
            clearInterval(timer);
          } else {
            stat.textContent = Math.floor(current) + suffix;
          }
        }, stepTime);
      });
    }
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) observer.observe(statsSection);
}

/* ==========================================================================
   7. ABOUT INTERACTIVE TABS
   ========================================================================== */
function initAboutTabs() {
  const tabBtns = document.querySelectorAll('.about-tabs-nav .tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePane = document.getElementById(`tab-${target}`);
      if (activePane) activePane.classList.add('active');
      playSound('click');
    });
  });
}

/* ==========================================================================
   8. PROJECT CATEGORY FILTERS
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      playSound('click');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hide');
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.classList.add('hide');
        }
      });
    });
  });
}

/* ==========================================================================
   9. PROJECT DETAIL MODAL SYSTEM (Ritesh Chandan Ahire Projects)
   ========================================================================== */
const projectData = {
  'portfolio-site': {
    title: 'Personal Portfolio Website',
    category: 'Web Development (2026)',
    image: 'assets/images/project-1.jpg',
    role: 'Frontend Developer & Designer',
    timeline: '2026',
    metrics: '100% Mobile Responsive • Glassmorphic Dark UI',
    overview: 'Built a modern, responsive personal portfolio website using HTML, CSS, and JavaScript to showcase skills, projects, certifications, and resume.',
    challenge: 'Implementing dynamic interactive features including smooth scrolling navigation, theme color customizer, interactive modals, and contact form validation without heavy external frameworks.',
    solution: 'Engineered custom Vanilla JavaScript modules with Canvas particle mesh background, Web Audio API sound synthesis, IntersectionObserver animations, and real-time form validation.',
    techStack: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'Canvas API', 'Web Audio API', 'Responsive Design'],
    demoUrl: '#',
    githubUrl: 'https://github.com/riteshhahire18'
  },
  'todo-app': {
    title: 'To-Do List Web Application',
    category: 'Web Application (2026)',
    image: 'assets/images/project-todo.jpg',
    role: 'JavaScript Developer',
    timeline: '2026',
    metrics: 'Instant CRUD • Persistent LocalStorage',
    overview: 'Developed an intuitive task management web application with add, edit, delete, and mark-complete capabilities with persistent state across browser sessions.',
    challenge: 'Ensuring reliable client-side data persistence with seamless DOM synchronization and responsive UI controls across both desktop and mobile screens.',
    solution: 'Utilized JavaScript DOM manipulation paired with structured JSON serialization in browser LocalStorage, adding smooth CSS micro-interactions and minimal modern card styling.',
    techStack: ['JavaScript', 'HTML5', 'CSS3', 'LocalStorage API', 'DOM Manipulation', 'Git'],
    demoUrl: '#',
    githubUrl: 'https://github.com/riteshhahire18'
  },
};

function initProjectModals() {
  const modalBackdrop = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const modalTriggers = document.querySelectorAll('.open-modal-trigger');

  if (!modalBackdrop) return;

  function openModal(projectId) {
    const data = projectData[projectId];
    if (!data) return;

    document.getElementById('modal-img').src = data.image;
    document.getElementById('modal-img').alt = data.title;
    document.getElementById('modal-category').textContent = data.category;
    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-role').textContent = data.role;
    document.getElementById('modal-timeline').textContent = data.timeline;
    document.getElementById('modal-metrics').textContent = data.metrics;
    document.getElementById('modal-overview').textContent = data.overview;
    document.getElementById('modal-challenge').textContent = data.challenge;
    document.getElementById('modal-solution').textContent = data.solution;

    const techContainer = document.getElementById('modal-tech-stack');
    techContainer.innerHTML = '';
    data.techStack.forEach(t => {
      const chip = document.createElement('span');
      chip.className = 'tech-tag';
      chip.textContent = t;
      techContainer.appendChild(chip);
    });

    document.body.style.overflow = 'hidden';
    modalBackdrop.classList.add('open');
    playSound('switch');
  }

  function closeModal() {
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    playSound('click');
  }

  modalTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projectId = btn.getAttribute('data-project-id');
      openModal(projectId);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   10. CONTACT FORM WITH REAL-TIME VALIDATION & TOAST
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const messageInput = document.getElementById('contact-message');
  const charCounter = document.getElementById('char-count');
  const submitBtn = document.getElementById('submit-btn');

  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      const count = messageInput.value.length;
      charCounter.textContent = `${count} / 500`;
      if (count > 450) {
        charCounter.style.color = 'var(--status-warning)';
      } else {
        charCounter.style.color = 'var(--text-dim)';
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !message) {
        showToast('Please fill out all required fields.', 'warning');
        return;
      }

      if (!isValidEmail(email)) {
        showToast('Please enter a valid email address.', 'warning');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>Transmitting Message... 🚀</span>`;

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          form.reset();
          if (charCounter) charCounter.textContent = '0 / 500';
          showToast(`Thank you, ${name}! Your message has been sent to Ritesh.`, 'success');
          playSound('success');
        }, 1200);
      }
    });
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : '⚠'}</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

/* ==========================================================================
   12. SCROLL PROGRESS & BACK TO TOP BUTTON
   ========================================================================== */
function initScrollProgress() {
  const backToTopBtn = document.getElementById('back-to-top-btn');
  const progressCircle = document.getElementById('scroll-progress-circle');

  if (!backToTopBtn) return;

  const totalLength = 157;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(scrollY / (docHeight || 1), 1);

    if (progressCircle) {
      const offset = totalLength - (progress * totalLength);
      progressCircle.style.strokeDashoffset = offset;
    }

    if (scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    playSound('click');
  });
}

/* ==========================================================================
   13. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileNav() {
  const toggle = document.getElementById('mobile-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-drawer-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggle || !drawer || !overlay) return;

  function toggleMenu() {
    toggle.classList.toggle('active');
    drawer.classList.toggle('open');
    overlay.classList.toggle('active');
    playSound('click');
  }

  function closeMenu() {
    toggle.classList.remove('active');
    drawer.classList.remove('open');
    overlay.classList.remove('active');
  }

  toggle.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
      playSound('click');
    });
  });
}
