/*
 * QuizFlow — Tương tác Kết quả & Đối chiếu đáp án (F11)
 * Hoạt ảnh vòng tròn điểm số, bộ chuyển đổi xem thử và nạp dữ liệu đối chiếu an toàn.
 */
(() => {
  'use strict';

  // 1. Dữ liệu chi tiết 20 câu hỏi (Chỉ được nạp vào DOM khi đã công bố)
  const reviewQuestions = [
    {
      id: 1,
      text: 'Giao thức nào được sử dụng phổ biến nhất để truyền tải siêu văn bản an toàn trên mạng Internet?',
      userChoice: '[B] HTTPS',
      correctChoice: '[B] HTTPS',
      isCorrect: true
    },
    {
      id: 2,
      text: 'Thẻ HTML5 ngữ nghĩa nào thường được dùng để chứa phần điều hướng liên kết chính của trang web?',
      userChoice: '[C] <nav>',
      correctChoice: '[C] <nav>',
      isCorrect: true
    },
    {
      id: 3,
      text: 'Trong CSS Box Model, thành phần nào nằm giữa padding và margin?',
      userChoice: '[A] Border (Đường viền)',
      correctChoice: '[A] Border (Đường viền)',
      isCorrect: true
    },
    {
      id: 4,
      text: 'Phương thức HTTP nào thường được sử dụng để gửi dữ liệu từ biểu mẫu lên máy chủ nhằm tạo mới tài nguyên?',
      userChoice: '[B] POST',
      correctChoice: '[B] POST',
      isCorrect: true
    },
    {
      id: 5,
      text: 'Mã trạng thái HTTP nào biểu thị tài nguyên được yêu cầu không tìm thấy trên máy chủ?',
      userChoice: '[C] 404 Not Found',
      correctChoice: '[C] 404 Not Found',
      isCorrect: true
    },
    {
      id: 6,
      text: 'Thuộc tính CSS nào cho phép thiết lập bố cục dạng lưới 2 chiều cho một khối phần tử?',
      userChoice: '[B] display: grid',
      correctChoice: '[B] display: grid',
      isCorrect: true
    },
    {
      id: 7,
      text: 'Trong JavaScript ES6, từ khóa nào cho phép khai báo biến có phạm vi khối (block scope) và không thể gán lại giá trị?',
      userChoice: '[C] const',
      correctChoice: '[C] const',
      isCorrect: true
    },
    {
      id: 8,
      text: 'Hàm nào trong JavaScript được dùng để chuyển đổi một chuỗi văn bản định dạng JSON thành đối tượng JavaScript?',
      userChoice: '(Bỏ trống — Không chọn)',
      correctChoice: '[B] JSON.parse()',
      isCorrect: false
    },
    {
      id: 9,
      text: 'Đối tượng BOM nào trong trình duyệt cung cấp thông tin về URL hiện tại và cho phép chuyển hướng trang?',
      userChoice: '[D] window.location',
      correctChoice: '[D] window.location',
      isCorrect: true
    },
    {
      id: 10,
      text: 'Trong kiến trúc ứng dụng Web, cookie được lưu trữ chủ yếu ở đâu?',
      userChoice: '[B] Tại trình duyệt của máy khách (Client)',
      correctChoice: '[B] Tại trình duyệt của máy khách (Client)',
      isCorrect: true
    },
    {
      id: 11,
      text: 'Thuộc tính nào của thẻ <input> quyết định dữ liệu không được gửi lên máy chủ và không cho người dùng tương tác?',
      userChoice: '[B] disabled',
      correctChoice: '[B] disabled',
      isCorrect: true
    },
    {
      id: 12,
      text: 'Kỹ thuật nào cho phép trình duyệt gửi yêu cầu không đồng bộ đến máy chủ mà không cần tải lại toàn bộ trang?',
      userChoice: '[B] AJAX / Fetch API',
      correctChoice: '[B] AJAX / Fetch API',
      isCorrect: true
    },
    {
      id: 13,
      text: 'Trong Java Servlet, phương thức vòng đời nào được gọi duy nhất một lần khi Servlet được khởi tạo?',
      userChoice: '[A] service()',
      correctChoice: '[C] init()',
      isCorrect: false
    },
    {
      id: 14,
      text: 'Phạm vi (scope) nào trong ứng dụng web Java có thời gian tồn tại gắn liền với một phiên làm việc của người dùng?',
      userChoice: '[B] Session Scope',
      correctChoice: '[B] Session Scope',
      isCorrect: true
    },
    {
      id: 15,
      text: 'Khái niệm REST trong thiết kế Web API là viết tắt của cụm từ nào?',
      userChoice: '(Bỏ trống — Không chọn)',
      correctChoice: '[A] Representational State Transfer',
      isCorrect: false
    },
    {
      id: 16,
      text: 'Đơn vị CSS nào dưới đây là đơn vị tương đối phụ thuộc vào kích thước phông chữ của phần tử gốc (root)?',
      userChoice: '[B] rem',
      correctChoice: '[B] rem',
      isCorrect: true
    },
    {
      id: 17,
      text: 'Sự kiện JavaScript nào được kích hoạt ngay khi cấu trúc cây DOM được nạp xong mà không cần chờ hình ảnh tải hết?',
      userChoice: '[B] DOMContentLoaded',
      correctChoice: '[B] DOMContentLoaded',
      isCorrect: true
    },
    {
      id: 18,
      text: 'Thuộc tính HTML nào dùng để liên kết thẻ <label> với ô nhập <input> nhằm hỗ trợ trợ năng và người đọc màn hình?',
      userChoice: '[C] for',
      correctChoice: '[C] for',
      isCorrect: true
    },
    {
      id: 19,
      text: 'Media feature nào trong CSS được dùng để phát hiện người dùng đã bật chế độ hạn chế hiệu ứng chuyển động trong hệ điều hành?',
      userChoice: '[C] prefers-reduced-motion',
      correctChoice: '[C] prefers-reduced-motion',
      isCorrect: true
    },
    {
      id: 20,
      text: 'Trong kiến trúc Web MVC, thành phần nào chịu trách nhiệm tiếp nhận yêu cầu, gọi xử lý nghiệp vụ và điều hướng dữ liệu?',
      userChoice: '(Bỏ trống — Không chọn)',
      correctChoice: '[C] Controller',
      isCorrect: false
    }
  ];

  // DOM elements
  const scoreNumber = document.getElementById('score-number');
  const scoreGaugeMeter = document.getElementById('score-gauge-meter');
  const vaultLockedCard = document.getElementById('vault-locked-card');
  const reviewQuestionsContainer = document.getElementById('review-questions-container');
  const reviewLockPill = document.getElementById('review-lock-pill');
  const demoButtons = document.querySelectorAll('[data-result-state]');

  // 2. Hiệu ứng chạy số điểm và vòng tròn SVG
  function animateScore() {
    const targetScore = 8.00;
    const motion = window.QuizFlowMotion;
    const duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur-count'));
    const startTime = performance.now();

    function finishScore() {
      scoreGaugeMeter?.classList.remove('is-animating');
      if (scoreNumber) scoreNumber.textContent = '8,00';
    }

    if (motion?.reducedMotion || !Number.isFinite(duration)) {
      finishScore();
      return;
    }

    function updateCounter(currentTime) {
      if (motion?.reducedMotion) {
        finishScore();
        return;
      }
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = easeProgress * targetScore;

      if (scoreNumber) {
        // Định dạng dấu phẩy tiếng Việt thang điểm 10: "8,00"
        scoreNumber.textContent = currentVal.toFixed(2).replace('.', ',');
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        finishScore();
      }
    }

    scoreGaugeMeter?.classList.add('is-animating');
    if (scoreNumber) scoreNumber.textContent = '0,00';
    requestAnimationFrame(updateCounter);
  }

  // 3. Render 20 câu đối chiếu (CHỈ GỌI KHI CÔNG BỐ ĐÁP ÁN)
  function renderPublishedReview() {
    if (!reviewQuestionsContainer) return;
    reviewQuestionsContainer.innerHTML = '';

    const list = document.createElement('div');
    list.className = 'review-questions-list anim-fade-up';

    reviewQuestions.forEach((q) => {
      const qNumStr = String(q.id).padStart(2, '0');
      const card = document.createElement('article');
      card.className = `review-question-card ${q.isCorrect ? 'is-correct' : 'is-incorrect'}`;

      card.innerHTML = `
        <div class="review-question-header">
          <span class="badge text-mono">CÂU HỎI ${qNumStr} / 20</span>
          ${
            q.isCorrect
              ? '<span class="status status--success"><span aria-hidden="true">✓</span>Chính xác (+0,50đ)</span>'
              : '<span class="status status--danger"><span aria-hidden="true">✕</span>Chưa chính xác (0,00đ)</span>'
          }
        </div>
        <h3 class="review-question-title">${q.text}</h3>
        <div class="review-choices-grid">
          <div class="review-choice-box user-choice">
            <strong>Lựa chọn của bạn</strong>
            <span>${q.userChoice}</span>
          </div>
          <div class="review-choice-box correct-choice">
            <strong>Đáp án chuẩn của đề</strong>
            <span>${q.correctChoice}</span>
          </div>
        </div>
      `;

      list.appendChild(card);
    });

    reviewQuestionsContainer.appendChild(list);
  }

  // 4. Chuyển đổi giữa 2 trạng thái xem thử
  function applyResultState(state, announce = true) {
    demoButtons.forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.dataset.resultState === state ? 'true' : 'false');
    });

    if (state === 'locked') {
      // Trạng thái 1: Khóa (Không đưa đáp án đúng vào HTML)
      if (vaultLockedCard) vaultLockedCard.hidden = false;
      if (reviewQuestionsContainer) reviewQuestionsContainer.innerHTML = '';
      if (reviewLockPill) {
        reviewLockPill.className = 'status';
        reviewLockPill.innerHTML = '<span aria-hidden="true">🔒</span>Đáp án đang được bảo mật';
      }
      if (announce) {
        window.QuizFlowMotion?.animateChange(vaultLockedCard);
        window.QuizFlowStudent.showFeedback('Đang xem trạng thái minh họa: Đáp án được bảo mật.');
      }

    } else if (state === 'published') {
      // Trạng thái 2: Đã công bố (Nạp 20 câu đối chiếu)
      if (vaultLockedCard) vaultLockedCard.hidden = true;
      renderPublishedReview();
      if (reviewLockPill) {
        reviewLockPill.className = 'status status--success';
        reviewLockPill.innerHTML = '<span aria-hidden="true">✓</span>Đã mở đối chiếu toàn bộ';
      }
      window.QuizFlowStudent.showFeedback('Trạng thái 2: Đề đã đóng và GV đã bật công bố (đã nạp 20 câu đối chiếu).');
    }
  }

  demoButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      applyResultState(btn.dataset.resultState);
    });
  });

  // Khởi động
  animateScore();
  applyResultState('locked', false); // Mặc định ở trạng thái khóa bảo mật

})();
