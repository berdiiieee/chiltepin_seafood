import { useEffect } from 'react';

export function useIntersectionObserver(deps = []) {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal:not(.visible)');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    elements.forEach((el) => {
      observer.observe(el);
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100 && rect.bottom > 0) {
        el.classList.add('visible');
        observer.unobserve(el);
      }
    });

    return () => observer.disconnect();
  }, deps);
}
