/*
 * QuizFlow — Tương tác Sảnh chờ thi (Exam Lobby - F07)
 * Quản lý đồng hồ đếm ngược, kiểm tra điều kiện lượt thi và bộ chuyển 3 trạng thái xem thử.
 */
(() => {
  'use strict';

  // Các phần tử DOM cần điều khiển
  const examStatusPill = document.getElementById('lobby-exam-status');
  const counterEffectiveTime = document.getElementById('counter-effective-time');
  const lobbyStartWrapper = document.getElementById('lobby-start-wrapper');
  const lobbyClosedNotice = document.getElementById('lobby-closed-notice');
  const demoStateButtons = document.querySelectorAll('[data-lobby-state]');

  // Quản lý đếm ngược thời gian thực
  let remainingSeconds = 15 * 60; // 15 phút (08:45 -> 09:00)
  let timerInterval = null;
  let currentState = 'not-started';

  function formatTimer(totalSecs) {
    if (totalSecs <= 0) return '00:00';
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function startCountdown() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (currentState === 'closed') return;
      if (remainingSeconds > 0) {
        remainingSeconds--;
        counterEffectiveTime.textContent = formatTimer(remainingSeconds);

        if (remainingSeconds <= 300) {
          counterEffectiveTime.classList.add('is-warning');
        }
        if (remainingSeconds <= 60) {
          counterEffectiveTime.classList.remove('is-warning');
          counterEffectiveTime.classList.add('is-danger');
        }
      } else {
        clearInterval(timerInterval);
        applyState('closed');
      }
    }, 1000);
  }

  function applyState(state) {
    currentState = state;

    // Cập nhật trạng thái active cho nút demo
    demoStateButtons.forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.dataset.lobbyState === state ? 'true' : 'false');
    });

    counterEffectiveTime.classList.remove('is-warning', 'is-danger');

    if (state === 'not-started') {
      // 1. Chưa bắt đầu (Đang mở)
      remainingSeconds = 15 * 60;
      counterEffectiveTime.textContent = '15:00';
      examStatusPill.className = 'status status--success';
      examStatusPill.innerHTML = '<span aria-hidden="true">●</span>Đang mở thi';

      lobbyStartWrapper.innerHTML = `
        <a class="btn btn--primary lobby-start-btn" id="btn-start-exam" href="exam-taking.html">
          <span class="icon" aria-hidden="true">🚀</span>
          Bắt đầu làm bài ngay →
        </a>
      `;

      lobbyClosedNotice.hidden = true;
      startCountdown();

    } else if (state === 'in-progress') {
      // 2. Đang làm dở (Tiếp tục)
      remainingSeconds = 14 * 60 + 28; // 14:28
      counterEffectiveTime.textContent = '14:28';
      counterEffectiveTime.classList.add('is-warning');
      examStatusPill.className = 'status status--warning';
      examStatusPill.innerHTML = '<span aria-hidden="true">⟳</span>Đang làm dở';

      lobbyStartWrapper.innerHTML = `
        <a class="btn btn--primary lobby-start-btn" id="btn-start-exam" href="exam-taking.html">
          <span class="icon" aria-hidden="true">⚡</span>
          Tiếp tục lượt đang thi (Còn 14:28) →
        </a>
      `;

      lobbyClosedNotice.hidden = true;
      startCountdown();

    } else if (state === 'closed') {
      // 3. Đề đã đóng
      clearInterval(timerInterval);
      remainingSeconds = 0;
      counterEffectiveTime.textContent = '00:00';
      counterEffectiveTime.classList.add('is-danger');
      examStatusPill.className = 'status status--danger';
      examStatusPill.innerHTML = '<span aria-hidden="true">■</span>Đề đã đóng';

      lobbyStartWrapper.innerHTML = `
        <button class="btn lobby-start-btn" id="btn-start-exam" type="button" disabled>
          <span class="icon" aria-hidden="true">🔒</span>
          Đề thi đã kết thúc — Không thể bắt đầu
        </button>
      `;

      lobbyClosedNotice.hidden = false;
    }
  }

  // Lắng nghe các nút chuyển đổi xem thử
  demoStateButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetState = btn.dataset.lobbyState;
      if (targetState === currentState) return;
      applyState(targetState);
      window.QuizFlowMotion?.animateChange(lobbyStartWrapper);

      const stateNames = {
        'not-started': 'Chưa bắt đầu — Đề thi đang mở',
        'in-progress': 'Đang làm dở — Tiếp tục lượt thi (Còn 14:28)',
        'closed': 'Đề đã đóng — Khóa nút bắt đầu'
      };
      window.QuizFlowStudent.showFeedback(`Đang xem thử trạng thái: ${stateNames[targetState]}`);
    });
  });

  // Khởi động trạng thái ban đầu
  applyState('not-started');

  // Xử lý các nút data-student-note
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-student-note]');
    if (button) {
      window.QuizFlowStudent.showFeedback(button.dataset.studentNote || 'Chức năng đang phát triển.');
    }
  });

})();
