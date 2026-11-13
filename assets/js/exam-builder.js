/* Kiểm tra cấu hình đề thi và phản hồi thao tác. */
(() => {
  'use strict';
  const { showFeedback } = window.QuizFlowTeacher;
  const title = document.getElementById('exam-title');
  const duration = document.getElementById('exam-duration');
  const opens = document.getElementById('exam-opens');
  const closes = document.getElementById('exam-closes');
  const counts = Array.from(document.querySelectorAll('[data-generator-count]'));
  const classChoices = Array.from(document.querySelectorAll('[data-exam-class]'));
  const error = document.getElementById('exam-error');
  const dock = document.querySelector('.builder-dock');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const feedbackEffects = new Map();

  // Mỗi phần tử chỉ giữ lượt phản hồi mới nhất, kể cả khi thao tác liên tiếp.
  function stopFeedback(element) {
    const effect = feedbackEffects.get(element);
    if (!effect) return;
    feedbackEffects.delete(element);
    effect.animations.forEach((animation) => animation.cancel());
    element.classList.remove(effect.className);
  }

  function startFeedback(element, className) {
    stopFeedback(element);
    if (motionPreference.matches) return;
    const existing = new Set(element.getAnimations({ subtree: true }));
    element.classList.add(className);
    const animations = element.getAnimations({ subtree: true })
      .filter((animation) => !existing.has(animation));
    const effect = { className, animations };
    feedbackEffects.set(element, effect);
    Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (feedbackEffects.get(element) === effect) stopFeedback(element);
    });
  }

  function updateSummary() {
    document.getElementById('summary-duration').textContent = duration.value ? `${duration.value} phút` : 'Chưa đặt';
    document.getElementById('summary-classes').textContent = `${classChoices.filter(input => input.checked).length} lớp`;
    document.getElementById('publish-config').textContent =
      `${duration.value || 'Chưa đặt'} phút · ${classChoices.filter(input => input.checked).length} lớp · ${opens.value.replace('T', ' ')} → ${closes.value.replace('T', ' ')} · GMT+7`;
    document.querySelectorAll('[data-preview-title]').forEach((node) => {
      node.textContent = title.value.trim() || 'Đề thi chưa đặt tên';
    });
  }

  function validateExam(publish) {
    let message = '';
    let field = title;
    if (!title.value.trim() || title.value.trim().length > 200) {
      message = 'Tên đề thi phải có từ 1 đến 200 ký tự.';
    } else if ((publish || duration.value !== '') && (!Number.isSafeInteger(Number(duration.value)) || Number(duration.value) <= 0)) {
      message = 'Thời lượng phải là số phút nguyên dương.';
      field = duration;
    } else if (publish && (!opens.value || !closes.value)) {
      message = 'Vui lòng nhập đủ giờ mở và giờ đóng đề.';
      field = !opens.value ? opens : closes;
    } else if (opens.value && closes.value && opens.value >= closes.value) {
      message = 'Giờ mở phải trước giờ đóng đề.';
      field = closes;
    } else if (publish && new Date(`${closes.value}:00+07:00`).getTime() <= Date.now()) {
      message = 'Đề đã tới giờ đóng. Vui lòng chọn lịch thi mới.';
      field = closes;
    } else if (publish && !classChoices.some(input => input.checked)) {
      message = 'Cần giao đề cho ít nhất một lớp cùng môn.';
      field = classChoices[0];
    }
    error.hidden = !message;
    error.querySelector('[data-error-text]').textContent = message;
    [title, duration, opens, closes, ...classChoices].forEach(input => input.removeAttribute('aria-invalid'));
    if (message) {
      startFeedback(error, 'builder-warning-feedback');
      field.setAttribute('aria-invalid', 'true');
      field.focus();
    } else {
      stopFeedback(error);
    }
    return !message;
  }

  function checkStructure(emphasize = false) {
    let message = '';
    let total = 0;
    counts.forEach((input) => {
      const value = Number(input.value);
      const available = Number(input.dataset.available);
      if (!input.value || !Number.isSafeInteger(value) || value < 0) {
        message = 'Số câu từng mức phải là số nguyên không âm.';
      } else if (value > available) {
        message = `Thiếu câu hỏi mức ${input.dataset.label}: hiện có ${available}, yêu cầu ${value}, cần thêm ${value - available}. Giữ nguyên bộ câu hiện tại.`;
      }
      total += value;
    });
    if (!message && total === 0) message = 'Cần yêu cầu ít nhất một câu hỏi.';
    document.getElementById('requested-total').textContent = Number.isSafeInteger(total) && total >= 0 ? `${total} câu yêu cầu` : 'Cấu trúc chưa hợp lệ';
    const warning = document.getElementById('generator-warning');
    const previousMessage = warning.querySelector('[data-warning-text]').textContent;
    const wasHidden = warning.hidden;
    warning.hidden = !message;
    warning.querySelector('[data-warning-text]').textContent = message;
    if (message && (emphasize || wasHidden || previousMessage !== message)) {
      startFeedback(warning, 'builder-warning-feedback');
    } else if (!message) {
      stopFeedback(warning);
    }
    return !message;
  }

  document.querySelectorAll('[data-count-step]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.countTarget);
      const previousValue = input.value;
      const current = Number(input.value);
      input.value = Math.max(0, (Number.isSafeInteger(current) ? current : 0) + Number(button.dataset.countStep));
      if (previousValue !== input.value) {
        const display = input.closest('.builder-count-value');
        display.dataset.rollDirection = Number(button.dataset.countStep) > 0 ? 'up' : 'down';
        display.querySelector('.builder-count-before').textContent = previousValue;
        display.querySelector('.builder-count-after').textContent = input.value;
        startFeedback(display, 'builder-count-rolling');
      }
      checkStructure();
    });
  });
  counts.forEach((input) => {
    input.addEventListener('focus', () => stopFeedback(input.closest('.builder-count-value')));
    input.addEventListener('input', () => {
      stopFeedback(input.closest('.builder-count-value'));
      checkStructure();
    });
  });
  document.getElementById('generate-exam').addEventListener('click', () => {
    if (checkStructure(true)) showFeedback('Cấu trúc sinh đề hợp lệ.');
  });
  document.getElementById('save-draft').addEventListener('click', () => {
    if (validateExam(false)) showFeedback('Đã xác nhận lưu nháp.');
  });
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('[data-publish-exam]');
    if (button && !validateExam(true)) {
      event.preventDefault();
      event.stopPropagation();
    }
    updateSummary();
  }, true);
  document.getElementById('confirm-publish').addEventListener('click', async () => {
    if (validateExam(true)
      && await window.QuizFlowUI.closeDialog(document.getElementById('publish-dialog'), 'confirm')) {
      showFeedback('Đã xác nhận công bố đề thi.');
    }
  });
  [title, duration, opens, closes, ...classChoices].forEach(input => input.addEventListener('input', updateSummary));
  dock.addEventListener('focusin', () => stopFeedback(dock));
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) {
      feedbackEffects.forEach((_effect, element) => stopFeedback(element));
    }
  });
  updateSummary();
  checkStructure();
  startFeedback(dock, 'builder-dock-enter');
})();
