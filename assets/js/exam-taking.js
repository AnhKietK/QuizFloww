/*
 * QuizFlow — Tương tác Phòng thi trực tuyến (F08, F09, F10)
 * Quản lý 20 câu hỏi, phím tắt A-D/mũi tên, đồng hồ đếm ngược, tự động lưu và nộp bài.
 */
(() => {
  'use strict';

  // 1. Dữ liệu mẫu 20 câu hỏi Lập trình Web
  const questions = [
    {
      id: 1,
      text: 'Giao thức nào được sử dụng phổ biến nhất để truyền tải siêu văn bản an toàn trên mạng Internet?',
      options: ['HTTP', 'HTTPS', 'FTP', 'SMTP'],
      selected: 1 // B (HTTPS)
    },
    {
      id: 2,
      text: 'Thẻ HTML5 ngữ nghĩa nào thường được dùng để chứa phần điều hướng liên kết chính của trang web?',
      options: ['<header>', '<section>', '<nav>', '<aside>'],
      selected: 2 // C (<nav>)
    },
    {
      id: 3,
      text: 'Trong CSS Box Model, thành phần nào nằm giữa padding và margin?',
      options: ['Border (Đường viền)', 'Content (Nội dung)', 'Outline (Đường nét ngoài)', 'Box-shadow'],
      selected: 0 // A (Border)
    },
    {
      id: 4,
      text: 'Phương thức HTTP nào thường được sử dụng để gửi dữ liệu từ biểu mẫu lên máy chủ nhằm tạo mới tài nguyên?',
      options: ['GET', 'POST', 'DELETE', 'HEAD'],
      selected: 1 // B (POST) - Đúng câu hỏi trong ảnh thiết kế
    },
    {
      id: 5,
      text: 'Mã trạng thái HTTP nào biểu thị tài nguyên được yêu cầu không tìm thấy trên máy chủ?',
      options: ['200 OK', '403 Forbidden', '404 Not Found', '500 Internal Server Error'],
      selected: 2 // C (404 Not Found)
    },
    {
      id: 6,
      text: 'Thuộc tính CSS nào cho phép thiết lập bố cục dạng lưới 2 chiều cho một khối phần tử?',
      options: ['display: flex', 'display: grid', 'display: block', 'display: table'],
      selected: 1 // B (display: grid)
    },
    {
      id: 7,
      text: 'Trong JavaScript ES6, từ khóa nào cho phép khai báo biến có phạm vi khối (block scope) và không thể gán lại giá trị?',
      options: ['var', 'let', 'const', 'static'],
      selected: 2 // C (const)
    },
    {
      id: 8,
      text: 'Hàm nào trong JavaScript được dùng để chuyển đổi một chuỗi văn bản định dạng JSON thành đối tượng JavaScript?',
      options: ['JSON.stringify()', 'JSON.parse()', 'JSON.object()', 'JSON.toObject()'],
      selected: null // Chưa làm (đúng theo thiết kế)
    },
    {
      id: 9,
      text: 'Đối tượng BOM nào trong trình duyệt cung cấp thông tin về URL hiện tại và cho phép chuyển hướng trang?',
      options: ['window.navigator', 'window.screen', 'window.history', 'window.location'],
      selected: 3 // D (window.location)
    },
    {
      id: 10,
      text: 'Trong kiến trúc ứng dụng Web, cookie được lưu trữ chủ yếu ở đâu?',
      options: ['Trên Database máy chủ', 'Tại trình duyệt của máy khách (Client)', 'Trong RAM máy chủ', 'Trong file cấu hình web.xml'],
      selected: 1 // B (Trình duyệt máy khách)
    },
    {
      id: 11,
      text: 'Thuộc tính nào của thẻ <input> quyết định dữ liệu không được gửi lên máy chủ và không cho người dùng tương tác?',
      options: ['readonly', 'disabled', 'hidden', 'required'],
      selected: 1 // B (disabled)
    },
    {
      id: 12,
      text: 'Kỹ thuật nào cho phép trình duyệt gửi yêu cầu không đồng bộ đến máy chủ mà không cần tải lại toàn bộ trang?',
      options: ['Synchronous Request', 'AJAX / Fetch API', 'Static Rendering', 'Form POST thông thường'],
      selected: 1 // B (AJAX / Fetch API)
    },
    {
      id: 13,
      text: 'Trong Java Servlet, phương thức vòng đời nào được gọi duy nhất một lần khi Servlet được khởi tạo?',
      options: ['service()', 'doGet()', 'init()', 'destroy()'],
      selected: 2 // C (init())
    },
    {
      id: 14,
      text: 'Phạm vi (scope) nào trong ứng dụng web Java có thời gian tồn tại gắn liền với một phiên làm việc của người dùng?',
      options: ['Request Scope', 'Session Scope', 'Application Scope', 'Page Scope'],
      selected: 1 // B (Session Scope)
    },
    {
      id: 15,
      text: 'Khái niệm REST trong thiết kế Web API là viết tắt của cụm từ nào?',
      options: [
        'Representational State Transfer',
        'Remote Execution Server Task',
        'Real-time Encoding System Technology',
        'Relational Entity Security Transport'
      ],
      selected: null // Chưa làm (đúng theo thiết kế)
    },
    {
      id: 16,
      text: 'Đơn vị CSS nào dưới đây là đơn vị tương đối phụ thuộc vào kích thước phông chữ của phần tử gốc (root)?',
      options: ['em', 'rem', 'px', 'vh'],
      selected: 1 // B (rem)
    },
    {
      id: 17,
      text: 'Sự kiện JavaScript nào được kích hoạt ngay khi cấu trúc cây DOM được nạp xong mà không cần chờ hình ảnh tải hết?',
      options: ['window.onload', 'DOMContentLoaded', 'document.onready', 'load'],
      selected: 1 // B (DOMContentLoaded)
    },
    {
      id: 18,
      text: 'Thuộc tính HTML nào dùng để liên kết thẻ <label> với ô nhập <input> nhằm hỗ trợ trợ năng và người đọc màn hình?',
      options: ['name', 'id', 'for', 'aria-label'],
      selected: 2 // C (for)
    },
    {
      id: 19,
      text: 'Media feature nào trong CSS được dùng để phát hiện người dùng đã bật chế độ hạn chế hiệu ứng chuyển động trong hệ điều hành?',
      options: [
        'prefers-color-scheme',
        'prefers-contrast',
        'prefers-reduced-motion',
        'pointer: fine'
      ],
      selected: 2 // C (prefers-reduced-motion)
    },
    {
      id: 20,
      text: 'Trong kiến trúc Web MVC, thành phần nào chịu trách nhiệm tiếp nhận yêu cầu, gọi xử lý nghiệp vụ và điều hướng dữ liệu?',
      options: ['Model', 'View', 'Controller', 'Database'],
      selected: null // Chưa làm (đúng theo thiết kế)
    }
  ];

  // Trạng thái phiên thi
  let currentIndex = 3; // Câu 4 (index 3)
  let remainingSeconds = 14 * 60 + 28; // 14:28
  let timerInterval = null;
  let isSubmitting = false;

  // DOM elements
  const hudTimer = document.getElementById('hud-timer');
  const hudProgressFill = document.getElementById('hud-progress-fill');
  const hudProgressText = document.getElementById('hud-progress-text');
  const hudSaveStatus = document.getElementById('hud-save-status');
  const hudSaveText = document.getElementById('hud-save-text');

  const questionIndexBadge = document.getElementById('question-index-badge');
  const questionText = document.getElementById('question-text');
  const optionsList = document.getElementById('options-list');
  const questionPagination = document.getElementById('question-pagination-indicator');
  const btnPrev = document.getElementById('btn-prev-question');
  const btnNext = document.getElementById('btn-next-question');
  const btnClearChoice = document.getElementById('btn-clear-choice');

  const paletteGridDesktop = document.getElementById('palette-grid-desktop');
  const paletteGridDrawer = document.getElementById('palette-grid-drawer');
  const palettePercentage = document.getElementById('palette-percentage');
  const unansweredWarning = document.getElementById('palette-unanswered-warning');
  const unansweredWarningText = document.getElementById('unanswered-warning-text');
  const mobileTogglePaletteBtn = document.getElementById('btn-mobile-palette-toggle');

  const dialogConfirmSubmit = document.getElementById('dialog-confirm-submit');
  const modalSubmitSummary = document.getElementById('modal-submit-summary');
  const btnConfirmSubmit = document.getElementById('btn-confirm-submit');
  const dialogTimeout = document.getElementById('dialog-timeout');

  // Format MM:SS
  function formatClock(secs) {
    if (secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // Cập nhật trạng thái lưu (F09)
  function setSaveState(state) {
    if (!hudSaveStatus || !hudSaveText) return;
    hudSaveStatus.className = 'hud-save-pill';

    if (state === 'synced') {
      hudSaveStatus.classList.add('status--success');
      hudSaveStatus.innerHTML = '<span class="icon" aria-hidden="true">✓</span><span>Đã lưu lên máy chủ</span>';
    } else if (state === 'saving') {
      hudSaveStatus.classList.add('status--warning');
      hudSaveStatus.innerHTML = '<span class="icon" aria-hidden="true">⟳</span><span>Đang lưu thay đổi...</span>';
    } else if (state === 'disconnected') {
      hudSaveStatus.classList.add('status--danger');
      hudSaveStatus.innerHTML = '<span class="icon" aria-hidden="true">⚠</span><span>Mất kết nối — Chưa lưu</span>';
    } else if (state === 'conflict') {
      hudSaveStatus.classList.add('status--danger');
      hudSaveStatus.innerHTML = '<span class="icon" aria-hidden="true">⛔</span><span>Xung đột phiên bản — Tải lại</span>';
    }
  }

  // Tính toán số câu đã làm và danh sách chưa làm
  function getAnswersStats() {
    let answeredCount = 0;
    const unansweredNumbers = [];

    questions.forEach((q, idx) => {
      if (q.selected !== null) {
        answeredCount++;
      } else {
        unansweredNumbers.push(String(idx + 1).padStart(2, '0'));
      }
    });

    return { answeredCount, unansweredNumbers };
  }

  // Render câu hỏi hiện tại
  function renderQuestion() {
    const q = questions[currentIndex];
    const qNumStr = String(currentIndex + 1).padStart(2, '0');

    if (questionIndexBadge) questionIndexBadge.textContent = `CÂU HỎI ${qNumStr} / 20`;
    if (questionText) questionText.textContent = q.text;
    if (questionPagination) questionPagination.textContent = `${qNumStr} / 20`;

    // Cập nhật nút Prev/Next
    if (btnPrev) btnPrev.disabled = currentIndex === 0;
    if (btnNext) btnNext.disabled = currentIndex === questions.length - 1;

    // Render 4 đáp án
    if (optionsList) {
      optionsList.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];

      q.options.forEach((optText, optIdx) => {
        const isSelected = q.selected === optIdx;
        const letter = letters[optIdx];

        const item = document.createElement('button');
        item.type = 'button';
        item.className = `option-item ${isSelected ? 'is-selected' : ''}`;
        item.setAttribute('role', 'radio');
        item.setAttribute('aria-checked', isSelected ? 'true' : 'false');
        item.dataset.optionIndex = optIdx;

        item.innerHTML = `
          <div class="option-left-content">
            <span class="option-key-badge">[${letter}]</span>
            <span class="option-label">${optText}</span>
          </div>
          <span class="option-indicator" aria-hidden="true"></span>
        `;

        item.addEventListener('click', () => {
          selectOption(optIdx);
        });

        optionsList.appendChild(item);
      });
    }

    renderPalette();
  }

  // Chọn đáp án
  function selectOption(optIndex) {
    if (isSubmitting) return;
    const q = questions[currentIndex];
    q.selected = optIndex;

    // Mô phỏng tự động lưu (F09)
    setSaveState('saving');
    setTimeout(() => {
      setSaveState('synced');
    }, 450);

    renderQuestion();
  }

  // Bỏ chọn đáp án
  if (btnClearChoice) {
    btnClearChoice.addEventListener('click', () => {
      if (isSubmitting) return;
      questions[currentIndex].selected = null;

      setSaveState('saving');
      setTimeout(() => {
        setSaveState('synced');
      }, 400);

      renderQuestion();
      window.QuizFlowStudent.showFeedback('Đã bỏ chọn đáp án câu ' + String(currentIndex + 1).padStart(2, '0'));
    });
  }

  // Chuyển câu hỏi
  function goToQuestion(newIndex) {
    if (newIndex === currentIndex || newIndex < 0 || newIndex >= questions.length) return;
    currentIndex = newIndex;
    renderQuestion();
    window.QuizFlowMotion?.animateChange(questionText);
    window.QuizFlowMotion?.animateChange(optionsList);
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => goToQuestion(currentIndex - 1));
  }
  if (btnNext) {
    btnNext.addEventListener('click', () => goToQuestion(currentIndex + 1));
  }

  // Render bảng điều hướng 20 câu hỏi
  function renderPaletteGrid(container) {
    if (!container) return;
    container.innerHTML = '';

    questions.forEach((q, idx) => {
      const qNum = String(idx + 1).padStart(2, '0');
      const isCurrent = idx === currentIndex;
      const isAnswered = q.selected !== null;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'palette-btn';
      if (isAnswered) btn.classList.add('is-answered');
      if (isCurrent) btn.classList.add('is-current');

      btn.setAttribute('aria-label', `Câu hỏi ${qNum}: ${isAnswered ? 'Đã trả lời' : 'Chưa trả lời'}${isCurrent ? ' (Đang xem)' : ''}`);

      btn.innerHTML = `
        <span>${qNum}</span>
        ${isAnswered ? '<span class="palette-check-mark" aria-hidden="true">✓</span>' : ''}
      `;

      btn.addEventListener('click', () => {
        goToQuestion(idx);
        // Nếu đang mở drawer trên mobile thì đóng lại sau khi chọn câu
        const drawer = document.getElementById('drawer-palette');
        if (drawer && drawer.open && window.QuizFlowUI) {
          window.QuizFlowUI.closeDialog(drawer);
        }
      });

      container.appendChild(btn);
    });
  }

  function renderPalette() {
    renderPaletteGrid(paletteGridDesktop);
    renderPaletteGrid(paletteGridDrawer);

    const { answeredCount, unansweredNumbers } = getAnswersStats();
    const percent = Math.round((answeredCount / questions.length) * 100);

    // Cập nhật tiến độ trên HUD
    if (hudProgressFill) {
      hudProgressFill.style.width = `${percent}%`;
      hudProgressFill.parentElement.setAttribute('aria-valuenow', String(percent));
    }
    if (hudProgressText) hudProgressText.textContent = `Đã làm ${answeredCount}/${questions.length} câu`;
    if (palettePercentage) palettePercentage.textContent = `${percent}%`;

    // Cập nhật cảnh báo câu chưa làm
    if (unansweredWarning && unansweredWarningText) {
      if (unansweredNumbers.length > 0) {
        unansweredWarning.hidden = false;
        unansweredWarningText.textContent = `⚠ Còn ${String(unansweredNumbers.length).padStart(2, '0')} câu chưa trả lời: ${unansweredNumbers.join(', ')}.`;
      } else {
        unansweredWarning.hidden = true;
      }
    }

    // Cập nhật nút mở ngăn kéo trên mobile
    if (mobileTogglePaletteBtn) {
      mobileTogglePaletteBtn.innerHTML = `
        <span class="icon" aria-hidden="true">▦</span>
        <span>Danh sách 20 câu (${answeredCount}/20 đã làm · ${percent}%)</span>
      `;
    }
  }

  // 2. Đồng hồ đếm ngược chạy thật
  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (isSubmitting) return;
      if (remainingSeconds > 0) {
        remainingSeconds--;
        if (hudTimer) hudTimer.textContent = formatClock(remainingSeconds);
      } else {
        clearInterval(timerInterval);
        handleTimeout();
      }
    }, 1000);
  }

  // Xử lý hết giờ (F10 - TIMEOUT)
  function handleTimeout() {
    isSubmitting = true;
    if (dialogTimeout && typeof dialogTimeout.showModal === 'function') {
      dialogTimeout.showModal();
    } else {
      alert('Đã hết giờ làm bài! Hệ thống đang chuyển đến trang kết quả.');
      window.location.href = 'exam-result.html';
    }
  }

  // 3. Phím tắt A-D và mũi tên (F08)
  window.addEventListener('keydown', (e) => {
    // Không nhận phím tắt nếu đang gõ vào input hoặc modal đang mở
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
      return;
    }
    if (document.querySelector('dialog[open]')) {
      return;
    }

    const key = e.key.toUpperCase();
    if (key === 'A' || key === '1') {
      e.preventDefault();
      selectOption(0);
    } else if (key === 'B' || key === '2') {
      e.preventDefault();
      selectOption(1);
    } else if (key === 'C' || key === '3') {
      e.preventDefault();
      selectOption(2);
    } else if (key === 'D' || key === '4') {
      e.preventDefault();
      selectOption(3);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToQuestion(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToQuestion(currentIndex + 1);
    }
  });

  // 4. Xác nhận nộp bài sớm (F10 - MANUAL)
  const btnOpenSubmit = document.getElementById('btn-open-submit-dialog');
  if (btnOpenSubmit) {
    btnOpenSubmit.addEventListener('click', () => {
      const { answeredCount, unansweredNumbers } = getAnswersStats();

      if (modalSubmitSummary) {
        if (unansweredNumbers.length > 0) {
          modalSubmitSummary.className = 'notice notice--warning';
          modalSubmitSummary.innerHTML = `
            <svg class="icon" aria-hidden="true"><use href="#student-icon-bell"/></svg>
            <div>
              <strong>Bạn còn ${String(unansweredNumbers.length).padStart(2, '0')} câu chưa trả lời (${unansweredNumbers.join(', ')}).</strong>
              <p>Xác nhận lưu các lựa chọn hiện tại và chốt điểm bài thi? Bạn sẽ không thể sửa đổi sau khi nộp.</p>
            </div>
          `;
        } else {
          modalSubmitSummary.className = 'notice';
          modalSubmitSummary.innerHTML = `
            <svg class="icon" aria-hidden="true"><use href="#student-icon-check"/></svg>
            <div>
              <strong>Bạn đã trả lời đầy đủ 20/20 câu hỏi!</strong>
              <p>Xác nhận nộp bài và kết thúc lượt thi?</p>
            </div>
          `;
        }
      }
    });
  }

  if (btnConfirmSubmit) {
    btnConfirmSubmit.addEventListener('click', () => {
      isSubmitting = true;
      clearInterval(timerInterval);
      window.QuizFlowStudent.showFeedback('✓ Nộp bài thành công! Đang chuyển đến kết quả...');
      setTimeout(() => {
        window.location.href = 'exam-result.html';
      }, 700);
    });
  }

  // 5. Nút xem thử các trạng thái lưu đồng bộ máy chủ (F09 Demo)
  document.querySelectorAll('[data-sync-state]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const st = btn.dataset.syncState;
      setSaveState(st);

      const msgs = {
        'synced': 'Trạng thái: Đã lưu lên máy chủ (✓)',
        'saving': 'Trạng thái: Đang lưu thay đổi... (⟳)',
        'disconnected': 'Trạng thái: Mất kết nối — Chưa lưu (⚠)',
        'conflict': 'Trạng thái: Xung đột phiên bản — Cần tải lại trang (⛔)'
      };
      window.QuizFlowStudent.showFeedback(msgs[st] || 'Đã đổi trạng thái lưu.');
    });
  });

  // Khởi động
  renderQuestion();
  startTimer();

})();
