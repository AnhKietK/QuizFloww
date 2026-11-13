/*
 * Tương tác dùng chung. Nạp tệp bằng thuộc tính defer.
 * data-dialog-open="id" mở modal hoặc drawer dạng <dialog>.
 * data-dialog-close đóng dialog chứa nút, data-dialog-value trả giá trị.
 * data-toggle dùng với button[role="switch"][aria-checked].
 * data-segmented chứa các button[data-segment][aria-pressed].
 * data-copy="mã lớp" cung cấp nội dung mã lớp cần sao chép.
 * QuizFlowUI.closeDialog trả Promise<boolean> sau khi kết thúc lượt đóng.
 * QuizFlowUI.showToast dùng chung cho thông báo trang và phản hồi sao chép.
 */
(() => {
  'use strict';

  let toast;
  let activeToast;
  let toastTimer;
  let toastVersion = 0;
  let openVersion = 0;
  const closingDialogs = new WeakMap();
  const dialogOpeners = new WeakMap();
  const copyFeedback = new WeakMap();

  // Thời gian lấy từ biến CSS để chuyển động và bộ đếm dùng cùng một giá trị.
  function duration(name) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return Number.parseFloat(value) * (value.endsWith('ms') ? 1 : 1000) || 0;
  }

  function waitForAnimation(element, name) {
    const animations = element.getAnimations({ subtree: true })
      .filter((animation) => animation.animationName === name);
    return Promise.allSettled(animations.map((animation) => animation.finished));
  }

  // Giữ tiến độ toast khi chuyển khỏi dialog vừa đóng sang góc của trang.
  function moveToastToBody() {
    const started = performance.now();
    const times = new Map(activeToast.getAnimations({ subtree: true })
      .filter((animation) => animation.animationName?.startsWith('motion-toast-'))
      .map((animation) => [animation.animationName, animation.currentTime]));
    if (!times.has('motion-toast-in')) {
      times.set('motion-toast-in', duration('--dur-base'));
    }
    document.body.append(activeToast);
    activeToast.getAnimations({ subtree: true }).forEach((animation) => {
      const time = times.get(animation.animationName);
      if (typeof time === 'number') {
        animation.currentTime = time + performance.now() - started;
      }
    });
  }

  // Một thông báo hoạt động tại một thời điểm; phiên mới thay thế cả timer cũ.
  function showToast(message, { failed = false, element } = {}) {
    if (!element && !toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.setAttribute('aria-atomic', 'true');
    }

    const notice = element || toast;
    const version = ++toastVersion;
    window.clearTimeout(toastTimer);
    if (activeToast && activeToast !== notice) {
      activeToast.hidden = true;
      activeToast.classList.remove('toast--show', 'toast--leaving');
    }
    activeToast = notice;
    notice.hidden = true;
    notice.classList.remove('toast--show', 'toast--leaving');
    notice.getAnimations();

    const container = document.querySelector('dialog[open]') || document.body;
    container.append(notice);

    let text = notice.querySelector('[data-feedback-message]');
    if (!text) {
      const icon = document.createElement('span');
      icon.className = 'icon';
      icon.dataset.toastIcon = '';
      icon.setAttribute('aria-hidden', 'true');
      text = document.createElement('span');
      text.dataset.feedbackMessage = '';
      notice.replaceChildren(icon, text);
    }
    const icon = notice.querySelector('[data-toast-icon], span.icon');
    if (icon) {
      icon.textContent = failed ? '!' : '✓';
    }

    text.textContent = message;
    notice.classList.toggle('toast--danger', failed);
    notice.classList.add('toast--show');
    notice.hidden = false;

    toastTimer = window.setTimeout(async () => {
      notice.classList.add('toast--leaving');
      await waitForAnimation(notice, 'motion-toast-out');
      if (version === toastVersion) {
        notice.hidden = true;
        notice.classList.remove('toast--show', 'toast--leaving');
      }
    }, duration('--dur-toast'));
    return notice;
  }

  // Dialog còn ở top layer trong suốt hiệu ứng đóng, rồi mới trả focus về nút mở.
  function closeDialog(dialog, value = 'cancel') {
    if (!(dialog instanceof HTMLDialogElement) || !dialog.open || closingDialogs.has(dialog)) {
      return Promise.resolve(false);
    }

    const state = {};
    closingDialogs.set(dialog, state);
    const style = getComputedStyle(dialog);
    dialog.style.setProperty('--overlay-from-transform', style.transform);
    dialog.style.setProperty('--overlay-from-opacity', style.opacity);
    dialog.style.setProperty('--overlay-backdrop-opacity', getComputedStyle(dialog, '::backdrop').opacity);
    dialog.classList.add('is-closing');
    state.promise = waitForAnimation(dialog, 'motion-overlay-out').then(() => {
      if (closingDialogs.get(dialog) !== state || !dialog.open) {
        return false;
      }
      if (activeToast && dialog.contains(activeToast)) {
        moveToastToBody();
      }
      dialog.querySelectorAll('[data-copy].is-copied').forEach(resetCopyFeedback);
      const opener = dialogOpeners.get(dialog);
      closingDialogs.delete(dialog);
      dialogOpeners.delete(dialog);
      dialog.close(value);
      dialog.classList.remove('is-closing');
      if (opener?.isConnected && !document.querySelector('dialog[open]')) {
        opener.focus({ preventScroll: true });
      }
      return true;
    });
    return state.promise;
  }

  async function openDialog(trigger) {
    const dialog = document.getElementById(trigger.dataset.dialogOpen);
    if (!(dialog instanceof HTMLDialogElement)) {
      return;
    }
    const version = ++openVersion;
    if (dialog.open) {
      if (closingDialogs.has(dialog)) {
        const style = getComputedStyle(dialog);
        dialog.style.setProperty('--overlay-enter-transform', style.transform);
        dialog.style.setProperty('--overlay-enter-opacity', style.opacity);
        closingDialogs.delete(dialog);
        dialog.classList.remove('is-closing');
      }
      return;
    }

    const currentDialog = document.querySelector('dialog[open]');
    const opener = currentDialog?.contains(trigger) ? dialogOpeners.get(currentDialog) : trigger;
    if (currentDialog) {
      await (closingDialogs.get(currentDialog)?.promise || closeDialog(currentDialog));
      if (version !== openVersion) {
        return;
      }
    }

    dialog.style.removeProperty('--overlay-enter-transform');
    dialog.style.removeProperty('--overlay-enter-opacity');
    trigger.focus({ preventScroll: true });
    dialogOpeners.set(dialog, opener);
    dialog.returnValue = '';
    dialog.showModal();
    if (dialog.classList.contains('nav-drawer')) {
      trigger.setAttribute('aria-expanded', 'true');
    }
  }

  // Giữ kích thước nút sao chép bằng cách thay nhãn trên một lớp phủ tạm thời.
  function resetCopyFeedback(trigger) {
    const state = copyFeedback.get(trigger);
    if (!state) {
      return;
    }
    window.clearTimeout(state.timer);
    trigger.replaceChildren(...state.content.childNodes);
    trigger.classList.remove('is-copied');
    if (trigger.getAttribute('aria-label') === state.feedbackLabel) {
      if (state.originalLabel === null) {
        trigger.removeAttribute('aria-label');
      } else {
        trigger.setAttribute('aria-label', state.originalLabel);
      }
    }
    copyFeedback.delete(trigger);
  }

  function showCopyFeedback(trigger, code) {
    resetCopyFeedback(trigger);
    trigger.getAnimations();
    const content = document.createElement('span');
    content.className = 'copy-content';
    content.append(...trigger.childNodes);
    const label = document.createElement('span');
    label.className = 'copy-feedback';
    label.setAttribute('aria-hidden', 'true');
    label.textContent = '✓ Đã sao chép';
    const state = {
      content,
      originalLabel: trigger.getAttribute('aria-label'),
      feedbackLabel: `Đã sao chép mã lớp ${code}`
    };
    copyFeedback.set(trigger, state);
    trigger.append(content, label);
    trigger.setAttribute('aria-label', state.feedbackLabel);
    trigger.classList.add('is-copied');
    state.timer = window.setTimeout(() => resetCopyFeedback(trigger), duration('--dur-copy'));
  }

  function toggleSwitch(button) {
    const checked = button.getAttribute('aria-checked') !== 'true';
    button.setAttribute('aria-checked', String(checked));

    const label = button.querySelector('[data-toggle-state]');
    const icon = button.querySelector('[data-toggle-icon]');
    if (label) {
      label.textContent = checked ? 'Đã bật' : 'Đã tắt';
    }
    if (icon) {
      icon.textContent = checked ? '✓' : '○';
    }

    button.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function selectSegment(button) {
    const group = button.closest('[data-segmented]');
    if (!group) {
      return;
    }

    group.querySelectorAll('[data-segment]').forEach((segment) => {
      segment.setAttribute('aria-pressed', String(segment === button));
    });
    button.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function copyWithSelection(text, trigger) {
    const selection = window.getSelection();
    const savedRanges = [];
    for (let index = 0; selection && index < selection.rangeCount; index += 1) {
      savedRanges.push(selection.getRangeAt(index).cloneRange());
    }

    const previousFocus = document.activeElement;
    const buffer = document.createElement('textarea');
    buffer.className = 'visually-hidden';
    buffer.value = text;
    buffer.readOnly = true;
    buffer.setAttribute('aria-label', 'Mã lớp để sao chép');
    const container = trigger.closest('dialog[open]') || document.body;
    container.append(buffer);

    try {
      buffer.focus({ preventScroll: true });
      buffer.select();
      buffer.setSelectionRange(0, text.length);
      return document.execCommand('copy');
    } finally {
      buffer.remove();
      previousFocus?.focus({ preventScroll: true });
      if (selection) {
        selection.removeAllRanges();
        savedRanges.forEach((range) => selection.addRange(range));
      }
    }
  }

  async function copyClassCode(trigger) {
    const code = trigger.dataset.copy.trim();
    if (!code) {
      resetCopyFeedback(trigger);
      showToast('Không có mã lớp để sao chép.', { failed: true });
      return;
    }

    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        copied = true;
      }
    } catch {
      // Thử cơ chế chọn văn bản khi trình duyệt từ chối Clipboard API.
    }

    if (!copied) {
      try {
        copied = copyWithSelection(code, trigger);
      } catch {
        copied = false;
      }
    }

    if (copied) {
      if (trigger.dataset.copy.trim() === code) {
        showCopyFeedback(trigger, code);
      }
      showToast(`Đã sao chép mã lớp ${code}.`);
    } else {
      resetCopyFeedback(trigger);
      showToast(`Không thể sao chép. Hãy sao chép thủ công mã ${code}.`, { failed: true });
    }
  }

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const trigger = event.target.closest(
      '[data-dialog-open], [data-dialog-close], [data-toggle], [data-segment], [data-copy]'
    );
    if (trigger && !trigger.matches(':disabled, [aria-disabled="true"]')) {
      if (trigger.hasAttribute('data-dialog-open')) {
        void openDialog(trigger);
      } else if (trigger.hasAttribute('data-dialog-close')) {
        void closeDialog(trigger.closest('dialog'), trigger.dataset.dialogValue || 'cancel');
      } else if (trigger.hasAttribute('data-toggle')) {
        toggleSwitch(trigger);
      } else if (trigger.hasAttribute('data-segment')) {
        selectSegment(trigger);
      } else if (trigger.hasAttribute('data-copy')) {
        void copyClassCode(trigger);
      }
    }

    // Chỉ đóng khi click ngoài khung, giữ nguyên click vào khoảng đệm bên trong.
    if (event.target instanceof HTMLDialogElement && event.target.open) {
      const bounds = event.target.getBoundingClientRect();
      const outside = event.clientX < bounds.left || event.clientX > bounds.right
        || event.clientY < bounds.top || event.clientY > bounds.bottom;
      if (outside) {
        void closeDialog(event.target);
      }
    }
  });

  // Esc và form method=dialog dùng cùng luồng đóng có chuyển động.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !event.defaultPrevented) {
      const dialog = document.querySelector('dialog[open]');
      if (dialog) {
        event.preventDefault();
        void closeDialog(dialog);
      }
    }
  });
  document.addEventListener('cancel', (event) => {
    if (event.target instanceof HTMLDialogElement) {
      event.preventDefault();
      void closeDialog(event.target);
    }
  }, true);
  document.addEventListener('submit', (event) => {
    const form = event.target;
    const method = event.submitter?.getAttribute('formmethod') || form.method;
    if (!event.defaultPrevented && method === 'dialog') {
      event.preventDefault();
      void closeDialog(form.closest('dialog'), event.submitter?.value || '');
    }
  });
  document.addEventListener('close', (event) => {
    if (event.target instanceof HTMLDialogElement && !event.target.open) {
      if (event.target.classList.contains('nav-drawer')) {
        document.querySelector('.nav-open')?.setAttribute('aria-expanded', 'false');
      }
      closingDialogs.delete(event.target);
      dialogOpeners.delete(event.target);
      event.target.classList.remove('is-closing');
      event.target.querySelectorAll('[data-copy].is-copied').forEach(resetCopyFeedback);
      if (activeToast && event.target.contains(activeToast)) {
        moveToastToBody();
      }
    }
  }, true);

  window.QuizFlowUI = Object.freeze({ closeDialog, showToast });

  // Menu dùng dialog gốc để khóa nền, hỗ trợ Esc/chạm nền và trả focus.
  function initializeResponsiveUi() {
    const app = document.querySelector('.app');
    const sidebar = app?.querySelector(':scope > .sidebar');
    const topbar = app?.querySelector('.topbar');
    if (sidebar && topbar) {
      const breakpoint = getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-sidebar').trim();
      const desktop = window.matchMedia(`(min-width: ${breakpoint})`);
      const dialog = document.createElement('dialog');
      dialog.id = 'app-navigation';
      dialog.className = 'drawer nav-drawer';
      dialog.setAttribute('aria-label', 'Menu điều hướng');
      const open = document.createElement('button');
      open.className = 'btn btn--icon nav-open';
      open.type = 'button';
      open.dataset.dialogOpen = dialog.id;
      open.setAttribute('aria-controls', dialog.id);
      open.setAttribute('aria-haspopup', 'dialog');
      open.setAttribute('aria-expanded', 'false');
      open.setAttribute('aria-label', 'Mở menu điều hướng');
      open.textContent = '☰';
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'btn btn--icon nav-close';
      close.dataset.dialogClose = '';
      close.setAttribute('aria-label', 'Đóng menu điều hướng');
      close.autofocus = true;
      close.textContent = '×';
      sidebar.prepend(close);
      topbar.prepend(open);
      document.body.append(dialog);
      function updateMenu() {
        if (desktop.matches) {
          const wasOpen = dialog.open;
          if (wasOpen) dialog.close();
          app.prepend(sidebar);
          open.setAttribute('aria-expanded', 'false');
          if (wasOpen) sidebar.querySelector('[aria-current="page"], a[href]')?.focus({ preventScroll: true });
        } else {
          sidebar.classList.remove('anim-slide-in-right');
          const hadFocus = sidebar.contains(document.activeElement);
          dialog.append(sidebar);
          if (hadFocus) open.focus({ preventScroll: true });
        }
      }
      desktop.addEventListener('change', updateMenu);
      dialog.addEventListener('click', (event) => {
        if (event.target.closest('a[href]')) void closeDialog(dialog);
      });
      updateMenu();
    }

    // Dự trữ đúng chiều cao dock khi xuống dòng, đổi hướng hoặc đổi phông chữ.
    const dock = document.querySelector('.builder-dock');
    if (dock && 'ResizeObserver' in window) {
      const observer = new ResizeObserver((entries) => {
        const height = entries[0].borderBoxSize?.[0]?.blockSize || dock.getBoundingClientRect().height;
        const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
        document.body.style.setProperty('--builder-dock-space', `${height / rootSize}rem`);
      });
      observer.observe(dock);
    }
  }
  // Script defer chạy khi readyState là interactive; chờ sidebar giáo viên dựng xong.
  if (document.readyState !== 'complete') {
    document.addEventListener('DOMContentLoaded', initializeResponsiveUi, { once: true });
  } else {
    initializeResponsiveUi();
  }

})();
