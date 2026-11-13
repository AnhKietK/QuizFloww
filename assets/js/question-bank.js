/* Bộ lọc câu hỏi, biểu mẫu và kiểm tra tệp Excel trước khi gửi. */
(() => {
  'use strict';
  const { normalizeSearch, showFeedback } = window.QuizFlowTeacher;
  const cards = Array.from(document.querySelectorAll('[data-question]'));
  const subject = document.getElementById('question-subject');
  const search = document.getElementById('question-search');
  const fileInput = document.getElementById('import-file');
  const dropzone = document.getElementById('import-dropzone');
  const editor = document.getElementById('question-editor');
  const form = document.getElementById('question-form');
  const importLog = document.getElementById('import-errors');
  const logRows = Array.from(importLog.querySelectorAll('tbody tr'));
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dropLabel = dropzone.querySelector('strong');
  const dropIcon = dropzone.querySelector('.import-upload-icon');
  const initialDropLabel = dropLabel.textContent;
  const initialDropIcon = dropIcon.textContent;
  let dragDepth = 0;
  let logObserver;

  // Đếm các lượt vào/ra phần tử con để dropzone không nhấp nháy khi đang kéo file.
  function isFileDrag(event) {
    return Array.from(event.dataTransfer?.types || []).includes('Files');
  }

  function setDragging(active) {
    const value = String(active);
    if (dropzone.dataset.dragging === value) return;
    dropzone.dataset.dragging = value;
    dropLabel.textContent = active ? 'Thả tệp .xlsx để chọn' : initialDropLabel;
    dropIcon.textContent = active ? '↓' : initialDropIcon;
  }

  function resetDragging() {
    dragDepth = 0;
    setDragging(false);
  }

  function clearLogRow(row) {
    row.classList.remove('import-log-pending', 'import-log-enter');
    row.style.removeProperty('--i');
  }

  function finishImportLog() {
    logObserver?.disconnect();
    importLog.dataset.motionLog = 'entered';
    logRows.forEach(clearLogRow);
  }

  // Mỗi dòng fade theo thứ tự rồi rung một lần; hoàn tất hoặc bị ngắt đều dọn lớp.
  function revealImportLog() {
    if (importLog.dataset.motionLog === 'entered') return;
    finishImportLog();
    if (motionPreference.matches || importLog.hidden) return;
    logRows.forEach((row, index) => {
      row.style.setProperty('--i', String(index));
      row.classList.add('import-log-enter');
      const animations = row.getAnimations().filter((animation) =>
        ['motion-fade-up', 'motion-shake-soft'].includes(animation.animationName));
      Promise.allSettled(animations.map((animation) => animation.finished))
        .then(() => clearLogRow(row));
    });
  }

  function filterQuestions() {
    const difficulty = document.querySelector('[data-difficulty] [aria-pressed="true"]').dataset.value;
    const status = document.querySelector('[data-usage] [aria-pressed="true"]').dataset.value;
    let count = 0;
    cards.forEach((card) => {
      const matches = card.dataset.subject === subject.value && card.dataset.usage === status
        && (difficulty === 'all' || card.dataset.difficulty === difficulty)
        && normalizeSearch(card.querySelector('[data-question-content]').textContent).includes(normalizeSearch(search.value));
      card.hidden = !matches;
      if (matches) count += 1;
    });
    document.getElementById('question-count').textContent = `${count} câu hỏi`;
    document.getElementById('question-empty').hidden = count !== 0;
    document.getElementById('selected-subject').textContent = subject.selectedOptions[0].textContent;
  }

  function acceptFile(file) {
    if (!file) return;
    document.getElementById('import-filename').textContent = file.name;
    document.getElementById('import-filesize').textContent = `${(file.size / 1024).toFixed(1).replace('.', ',')} KiB`;
    let message = '○ Tệp đã chọn · Định dạng và dung lượng hợp lệ. Nội dung đang chờ kiểm tra.';
    if (!/\.xlsx$/i.test(file.name)) {
      message = '! Chỉ chấp nhận tệp .xlsx.';
    } else if (file.size === 0) {
      message = '! Tệp rỗng. Vui lòng chọn lại.';
    } else if (file.size > 5 * 1024 * 1024) {
      message = '! Tệp vượt quá giới hạn 5 MiB.';
    }
    finishImportLog();
    importLog.hidden = true;
    const state = document.getElementById('import-state');
    state.hidden = false;
    state.textContent = message;
    document.getElementById('import-confirm').disabled = true;
    fileInput.value = '';
  }

  search.addEventListener('input', filterQuestions);
  subject.addEventListener('change', filterQuestions);
  document.getElementById('question-filters').addEventListener('change', filterQuestions);
  fileInput.addEventListener('change', () => {
    resetDragging();
    acceptFile(fileInput.files[0]);
  });
  dropzone.addEventListener('dragenter', (event) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    dragDepth += 1;
    setDragging(true);
  });
  dropzone.addEventListener('dragover', (event) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    dragDepth = Math.max(1, dragDepth);
    setDragging(true);
  });
  dropzone.addEventListener('dragleave', () => {
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) setDragging(false);
  });
  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    resetDragging();
    if (!isFileDrag(event)) return;
    if (event.dataTransfer.files.length !== 1) {
      showFeedback('! Vui lòng chọn một tệp Excel mỗi lần.');
      return;
    }
    acceptFile(event.dataTransfer.files[0]);
  });
  document.addEventListener('dragend', resetDragging);
  document.addEventListener('drop', resetDragging);
  window.addEventListener('blur', resetDragging);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') resetDragging();
  });
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) finishImportLog();
  });
  document.getElementById('choose-import-file').addEventListener('click', () => fileInput.click());
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('[data-create-question], [data-edit-question]');
    if (!button) return;
    form.reset();
    document.getElementById('editor-error').hidden = true;
    const card = button.closest('[data-question]');
    document.getElementById('editor-title').textContent = card ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới';
    document.getElementById('editor-subject').value = card ? card.dataset.subject : subject.value;
    document.getElementById('editor-subject').disabled = Boolean(card);
    if (card) {
      document.getElementById('editor-content').value = card.querySelector('[data-question-content]').textContent;
      document.getElementById('editor-difficulty').value = card.dataset.difficulty;
      card.querySelectorAll('[data-option-text]').forEach((option, index) => {
        form.elements[`option-${index}`].value = option.textContent;
      });
      document.getElementById('editor-answer').value = card.dataset.answer;
    }
  }, true);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fields = Array.from(form.querySelectorAll('textarea, input'));
    const invalid = fields.find((field) => !field.value.trim() || field.value.trim().length > field.maxLength);
    if (invalid) {
      document.getElementById('editor-error').hidden = false;
      invalid.focus();
      return;
    }
    if (await window.QuizFlowUI.closeDialog(editor, 'confirm')) {
      showFeedback('Đã xác nhận lưu câu hỏi.');
    }
  });
  filterQuestions();
  resetDragging();
  if (!motionPreference.matches && 'IntersectionObserver' in window) {
    importLog.dataset.motionLog = 'pending';
    logRows.forEach((row) => row.classList.add('import-log-pending'));
    logObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) revealImportLog();
    }, { rootMargin: '0px 0px -24px 0px', threshold: 0 });
    logObserver.observe(importLog);
  } else {
    finishImportLog();
  }
})();
