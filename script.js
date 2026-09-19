const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const typewriter = document.querySelector('.typewriter');

if (typewriter) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    typewriter.classList.add('is-typing');
  } else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry], currentObserver) => {
      if (entry.isIntersecting) {
        typewriter.classList.add('is-typing');
        currentObserver.disconnect();
      }
    }, { threshold: 0.35 });

    observer.observe(typewriter);
  } else {
    typewriter.classList.add('is-typing');
  }
}
