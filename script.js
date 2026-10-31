const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const contactForm = document.querySelector('#contact-form');
const contactModal = document.querySelector('#contact-modal');
const contactTrigger = document.querySelector('.contact-trigger');
const contactClose = document.querySelector('.contact-close');
const contactStatus = document.querySelector('.contact-status');
const typewriter = document.querySelector('.typewriter');

function setContactStatus(message, state = '') {
  if (!contactStatus) return;
  contactStatus.textContent = message;
  contactStatus.dataset.state = state;
}

function setupNavigation() {
  if (!menuButton || !navigation) return;

  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navigation.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

function setupContactForm() {
  if (!contactForm || !contactModal || !contactTrigger || !contactClose) return;

  const endpoint = contactForm.dataset.gasEndpoint?.trim() || '';
  const submitButton = contactForm.querySelector('.contact-submit');

  const closeModal = () => {
    contactModal.close();
    contactTrigger.setAttribute('aria-expanded', 'false');
  };

  contactTrigger.addEventListener('click', () => {
    contactTrigger.classList.remove('is-popping');
    void contactTrigger.offsetWidth;
    contactTrigger.classList.add('is-popping');
    contactTrigger.addEventListener('animationend', () => {
      contactTrigger.classList.remove('is-popping');
    }, { once: true });

    window.setTimeout(() => {
      if (contactModal.open) return;
      contactModal.showModal();
      contactTrigger.setAttribute('aria-expanded', 'true');
      contactForm.querySelector('input')?.focus();
    }, 500);
  });

  contactClose.addEventListener('click', closeModal);
  contactModal.addEventListener('click', (event) => {
    if (event.target === contactModal) closeModal();
  });
  contactModal.addEventListener('close', () => {
    contactTrigger.setAttribute('aria-expanded', 'false');
  });

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!endpoint || !endpoint.endsWith('/exec')) {
      setContactStatus('GAS Web App URL 尚未設定。', 'error');
      return;
    }

    if (!contactForm.reportValidity()) return;

    submitButton.disabled = true;
    setContactStatus('訊息傳送中...', 'pending');

    try {
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams(new FormData(contactForm))
      });
      contactForm.reset();
      setContactStatus('訊息已送出，謝謝你的聯絡。', 'success');
    } catch (error) {
      console.error('Contact form submission failed:', error);
      setContactStatus('送出失敗，請稍後再試。', 'error');
    } finally {
      submitButton.disabled = false;
    }
  });
}

function setupTypewriter() {
  if (!typewriter) return;

  const startTyping = () => typewriter.classList.add('is-typing');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    startTyping();
    return;
  }

  const observer = new IntersectionObserver(([entry], currentObserver) => {
    if (!entry.isIntersecting) return;
    startTyping();
    currentObserver.disconnect();
  }, { threshold: 0.35 });

  observer.observe(typewriter);
}

function setupSkillMeters() {
  const skills = document.querySelector('.skills');
  if (!skills) return;

  const revealMeters = () => skills.classList.add('is-visible');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    revealMeters();
    return;
  }

  const observer = new IntersectionObserver(([entry]) => {
    skills.classList.toggle('is-visible', entry.isIntersecting);
  }, { threshold: 0.2 });

  observer.observe(skills);
}

function setupGraphicPortfolio() {
  const container = document.querySelector('.graphic-work-grid');
  if (!container) return;

  const workGroups = [
    {
      label: '課程圖',
      folder: '課程圖',
      files: [
        '1017.png', '2拷貝.png', '57拷貝.png', 'BN拷貝.png', 'ertyuio.jpg',
        'klsjiowueiio.png', 'lhhliji;.png', 'sakdjklji;osd.png', 'skl.png', '主視覺.png',
        '圖.png', '圖1-.png', '圖1-影片banner.jpg', '圖1-影片banner.png',
        '圖1-影片banner1.jpg', '圖1-影片bannerx.jpg', '圖1-影片banner拷貝.png',
        '圖1-影片banner拷貝2.png', '圖1.png', '圖2.png', '圖4.jpg', '圖5-FB.png',
        '貝.png', '首頁圖拷貝.png'
      ]
    },
    {
      label: '行銷圖',
      folder: '行銷圖',
      files: [
        '  _Typeform 複本.jpg', ' -06.jpg', '220119_劉沛Vlog_Typeform.jpg',
        'Typeform 複本 3拷貝.png', 'Typeform 複本2.png', 'YOTTA_IG首圖.png',
        'YOTTA_YT影片-封面圖拷貝.png', '_Typeform 複本 3.jpg', '_活動倒數拷貝.png',
        '問卷圖_A.png', '工作區域 4.jpg', '影片Banner.png'
      ]
    }
  ];

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  workGroups.forEach(({ label, folder, files }) => {
    const carousel = document.createElement('section');
    carousel.className = 'graphic-carousel';
    carousel.setAttribute('aria-label', `${label}輪播`);

    const heading = document.createElement('h4');
    heading.textContent = label;

    const viewport = document.createElement('div');
    viewport.className = 'graphic-carousel-viewport';
    viewport.tabIndex = 0;

    const track = document.createElement('div');
    track.className = 'graphic-carousel-track';

    const slides = files.map((file, index) => {
      const source = `${folder}/${file}`;
      const slide = document.createElement('div');
      slide.className = 'graphic-carousel-slide';
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', '投影片');

      const link = document.createElement('a');
      link.href = source;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.setAttribute('aria-label', `開啟${label}圖片 ${index + 1}`);
      link.tabIndex = index === 0 ? 0 : -1;

      const image = document.createElement('img');
      image.src = source;
      image.alt = `${label}圖片`;
      image.loading = index === 0 ? 'eager' : 'lazy';
      image.decoding = 'async';

      link.append(image);
      slide.append(link);
      track.append(slide);
      return { slide, link };
    });

    const controls = document.createElement('div');
    controls.className = 'graphic-carousel-controls';

    const previous = document.createElement('button');
    previous.type = 'button';
    previous.title = '上一張';
    previous.setAttribute('aria-label', '上一張');
    previous.textContent = '‹';

    const count = document.createElement('span');
    count.className = 'graphic-carousel-count';
    count.setAttribute('aria-live', 'polite');

    const next = document.createElement('button');
    next.type = 'button';
    next.title = '下一張';
    next.setAttribute('aria-label', '下一張');
    next.textContent = '›';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.title = prefersReducedMotion ? '播放輪播' : '暫停輪播';
    toggle.setAttribute('aria-label', toggle.title);
    toggle.textContent = prefersReducedMotion ? '▶' : 'Ⅱ';

    let currentIndex = 0;
    let isPlaying = !prefersReducedMotion;
    let isVisible = false;
    let isHovered = false;
    let timer = null;

    const renderSlide = () => {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      count.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(files.length).padStart(2, '0')}`;
      slides.forEach(({ slide, link }, index) => {
        const isCurrent = index === currentIndex;
        slide.setAttribute('aria-label', `${index + 1} / ${files.length}`);
        slide.setAttribute('aria-hidden', String(!isCurrent));
        link.tabIndex = isCurrent ? 0 : -1;
      });
    };

    const move = (offset) => {
      currentIndex = (currentIndex + offset + files.length) % files.length;
      renderSlide();
    };

    const syncAutoplay = () => {
      window.clearInterval(timer);
      if (!isPlaying || !isVisible || isHovered || document.hidden) return;
      timer = window.setInterval(() => move(1), 4500);
    };

    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    toggle.addEventListener('click', () => {
      isPlaying = !isPlaying;
      toggle.textContent = isPlaying ? 'Ⅱ' : '▶';
      toggle.title = isPlaying ? '暫停輪播' : '播放輪播';
      toggle.setAttribute('aria-label', toggle.title);
      syncAutoplay();
    });
    carousel.addEventListener('mouseenter', () => { isHovered = true; syncAutoplay(); });
    carousel.addEventListener('mouseleave', () => { isHovered = false; syncAutoplay(); });
    carousel.addEventListener('focusin', () => { isHovered = true; syncAutoplay(); });
    carousel.addEventListener('focusout', (event) => {
      if (!carousel.contains(event.relatedTarget)) {
        isHovered = false;
        syncAutoplay();
      }
    });
    document.addEventListener('visibilitychange', syncAutoplay);

    viewport.append(track);
    controls.append(previous, count, next, toggle);
    carousel.append(heading, viewport, controls);
    container.append(carousel);
    renderSlide();

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        syncAutoplay();
      }, { threshold: 0.25 });
      observer.observe(carousel);
    } else {
      isVisible = true;
      syncAutoplay();
    }
  });
}

setupNavigation();
setupContactForm();
setupTypewriter();
setupSkillMeters();
setupGraphicPortfolio();
