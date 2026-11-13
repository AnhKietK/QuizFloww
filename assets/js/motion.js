/* Nền tảng chuyển động dùng chung. Nạp bằng defer sau CSS animations.css. */
(() => {
  'use strict';

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mousePreference = window.matchMedia('(hover: hover) and (pointer: fine)');

  // Các hiệu ứng JavaScript đọc tùy chọn hiện tại, kể cả khi đổi trong phiên xem.
  window.QuizFlowMotion = Object.freeze({
    get reducedMotion() {
      return preference.matches;
    }
  });

  function initializeComponentMotion() {
    const cards = document.querySelectorAll('.glass-card:not(.builder-dock)');
    cards.forEach((card) => {
      const light = document.createElement('span');
      light.className = 'motion-card-light';
      light.setAttribute('aria-hidden', 'true');
      card.classList.add('motion-card');
      card.append(light);
    });

    let activeCard;
    let pointerX;
    let pointerY;
    let frame = 0;

    function clearSpotlight() {
      window.cancelAnimationFrame(frame);
      frame = 0;
      activeCard?.style.removeProperty('--mx');
      activeCard?.style.removeProperty('--my');
      activeCard?.style.removeProperty('--tilt-x');
      activeCard?.style.removeProperty('--tilt-y');
      activeCard = null;
    }

    // Đọc khung và ghi biến tọa độ tối đa một lần mỗi frame cho thẻ dưới chuột.
    function updateSpotlight() {
      frame = 0;
      if (!activeCard || preference.matches || !mousePreference.matches) {
        return;
      }
      const bounds = activeCard.getBoundingClientRect();
      if (!bounds.width || !bounds.height) {
        clearSpotlight();
        return;
      }
      const offsetX = pointerX - bounds.left - bounds.width / 2;
      const offsetY = pointerY - bounds.top - bounds.height / 2;
      activeCard.style.setProperty('--mx', `${offsetX}px`);
      activeCard.style.setProperty('--my', `${offsetY}px`);

      // Thẻ có data-motion-tilt dùng chung frame và tọa độ với spotlight.
      if (activeCard.hasAttribute('data-motion-tilt') && !activeCard.matches(':focus-within')) {
        const normalizedX = Math.max(-1, Math.min(1, offsetX * 2 / bounds.width));
        const normalizedY = Math.max(-1, Math.min(1, offsetY * 2 / bounds.height));
        activeCard.style.setProperty('--tilt-x', String(normalizedX));
        activeCard.style.setProperty('--tilt-y', String(normalizedY));
      }
    }

    document.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse' || preference.matches || !mousePreference.matches) {
        return;
      }
      const card = event.target.closest('.motion-card');
      if (card !== activeCard) {
        clearSpotlight();
        activeCard = card;
      }
      if (!card) {
        return;
      }
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frame) {
        frame = window.requestAnimationFrame(updateSpotlight);
      }
    });

    // Rời thẻ, cuộn hoặc đổi tùy chọn chuyển động sẽ hủy frame và trả sáng về giữa.
    document.addEventListener('pointerout', (event) => {
      if (activeCard && !activeCard.contains(event.relatedTarget)) {
        clearSpotlight();
      }
    });
    document.addEventListener('scroll', clearSpotlight, { capture: true, passive: true });
    document.addEventListener('focusin', (event) => {
      if (event.target.closest('[data-motion-tilt]')) {
        clearSpotlight();
      }
    });
    window.addEventListener('blur', clearSpotlight);
    mousePreference.addEventListener('change', clearSpotlight);
    preference.addEventListener('change', () => {
      if (preference.matches) {
        clearSpotlight();
      }
    });
  }

  function initializeMotion() {
    const app = document.querySelector('.app');
    if (!app) {
      return;
    }

    initializeComponentMotion();

    const sidebar = app.querySelector(':scope > .sidebar');
    const cards = Array.from(app.querySelectorAll('.app-main .glass-card'))
      .filter((card) => !card.closest('.builder-dock, dialog'));
    let observer;

    // Lớp nền trang trí có khung cắt riêng để chuyển động không làm tràn trang.
    const aurora = document.createElement('div');
    aurora.className = 'motion-aurora';
    aurora.setAttribute('aria-hidden', 'true');
    app.prepend(aurora);

    function finishCard(card) {
      observer?.unobserve(card);
      card.dataset.motionReveal = 'entered';
      card.classList.remove('anim-fade-up', 'anim-stagger');
      card.style.removeProperty('--i');
    }

    // Chỉ quan sát một lần mỗi thẻ; thẻ được bộ lọc mở lại sẽ giữ trạng thái đã xem.
    if (!preference.matches && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        const entering = entries.filter((entry) => entry.isIntersecting
          && entry.target.dataset.motionReveal === 'pending');

        entering.forEach((entry, index) => {
          const card = entry.target;
          observer.unobserve(card);
          card.dataset.motionReveal = 'entered';
          card.style.setProperty('--i', String(index));
          card.classList.add('anim-stagger', 'anim-fade-up');

          // Promise nhận cả trường hợp bộ lọc hủy hiệu ứng trước lúc bắt đầu.
          const entrance = card.getAnimations().find((animation) =>
            animation.animationName === 'motion-fade-up');
          const cleanup = () => finishCard(card);
          entrance?.finished.then(cleanup, cleanup);
        });
      }, { rootMargin: '0px 0px -24px 0px', threshold: 0 });

      sidebar?.classList.add('anim-slide-in-right');
      cards.forEach((card) => {
        card.dataset.motionReveal = 'pending';
        observer.observe(card);
      });
    } else {
      // Nội dung hiển thị ngay khi giảm chuyển động hoặc trình duyệt thiếu observer.
      cards.forEach(finishCard);
    }

    // Dọn transform của sidebar sau khi vào trang để giữ định vị ban đầu.
    app.addEventListener('animationend', (event) => {
      if (event.target === sidebar && event.animationName === 'motion-slide-in-right') {
        sidebar.classList.remove('anim-slide-in-right');
      }
    });

    // Focus bàn phím bỏ qua phần chờ để trường nhập và nút luôn hiện rõ khi thao tác.
    app.addEventListener('focusin', (event) => {
      const card = event.target.closest('[data-motion-reveal]');
      if (card) {
        finishCard(card);
      }
      if (sidebar?.contains(event.target)) {
        sidebar.classList.remove('anim-slide-in-right');
      }
    });

    // Đổi Reduce motion trong phiên xem sẽ hiện ngay mọi thẻ và kết thúc quan sát.
    preference.addEventListener('change', () => {
      if (preference.matches) {
        observer?.disconnect();
        cards.forEach(finishCard);
        sidebar?.classList.remove('anim-slide-in-right');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMotion, { once: true });
  } else {
    initializeMotion();
  }
})();
