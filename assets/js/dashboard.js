/*
 * QuizFlow — Tương tác Trang chủ Sinh viên (F07, F17)
 * Xử lý tham gia lớp bằng mã, tìm kiếm đề thi và chuyển đổi trạng thái xem thử.
 */
(() => {
  'use strict';

  // 1. Xử lý Form Tham gia lớp học (F17)
  const formJoinClass = document.getElementById('form-join-class');
  const inputClassCode = document.getElementById('input-class-code');
  const classesContainer = document.getElementById('classes-container');
  const classCountBadge = document.getElementById('class-count-badge');
  const classesEmptyView = document.getElementById('classes-empty-view');

  // Danh sách các lớp đã tham gia ban đầu
  const joinedClasses = new Set(['QF-892A', 'QF-1C7D']);

  if (formJoinClass && inputClassCode) {
    // Tự động viết hoa mã khi gõ
    inputClassCode.addEventListener('input', () => {
      inputClassCode.value = inputClassCode.value.toUpperCase();
      inputClassCode.removeAttribute('aria-invalid');
    });

    formJoinClass.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = inputClassCode.value.trim().toUpperCase();

      // Kiểm tra định dạng QF-XXXX
      const pattern = /^QF-[A-Z0-9]{4}$/;
      if (!pattern.test(code)) {
        inputClassCode.setAttribute('aria-invalid', 'true');
        inputClassCode.focus();
        window.QuizFlowStudent.showFeedback('Mã lớp không hợp lệ. Định dạng chuẩn: QF-XXXX (VD: QF-892A)', true);
        return;
      }

      // Kiểm tra xem đã tham gia chưa
      if (joinedClasses.has(code)) {
        window.QuizFlowStudent.showFeedback(`Bạn đã là thành viên của lớp [${code}] rồi!`, true);
        return;
      }

      // Thêm lớp mới thành công
      joinedClasses.add(code);
      window.QuizFlowStudent.showFeedback(`✓ Tham gia lớp học [${code}] thành công!`);
      inputClassCode.value = '';

      // Thêm thẻ lớp mới vào giao diện
      if (classesContainer) {
        const newCard = document.createElement('article');
        newCard.className = 'glass-card class-card anim-scale-in';
        newCard.innerHTML = `
          <div class="class-card-top">
            <span class="badge text-mono">${code}</span>
            <span class="status status--success"><span aria-hidden="true">●</span>Đang tham gia</span>
          </div>
          <h3>Lớp học mới — Nhóm chuyên đề</h3>
          <p class="class-card-teacher">GV. Bộ môn CNTT · Học kỳ I / 2026–2027</p>
          <div class="class-card-footer">
            <span class="class-card-members">👥 01 Sinh viên</span>
            <button class="btn btn--small" type="button" data-student-note="Lớp vừa tham gia. Giáo viên chưa giao đề thi mới.">Xem chi tiết</button>
          </div>
        `;
        classesContainer.prepend(newCard);
      }

      // Cập nhật số lượng lớp
      if (classCountBadge) {
        classCountBadge.textContent = `${String(joinedClasses.size).padStart(2, '0')} lớp học`;
      }

      // Ẩn trạng thái rỗng nếu đang mở
      if (classesEmptyView) classesEmptyView.hidden = true;
      if (classesContainer) classesContainer.hidden = false;
    });
  }

  // 2. Xử lý Form Tìm đề thi bằng mã (F07)
  const formSearchExam = document.getElementById('form-search-exam');
  const inputExamCode = document.getElementById('input-exam-code');

  if (formSearchExam && inputExamCode) {
    inputExamCode.addEventListener('input', () => {
      inputExamCode.value = inputExamCode.value.toUpperCase();
      inputExamCode.removeAttribute('aria-invalid');
    });

    formSearchExam.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = inputExamCode.value.trim().toUpperCase();

      // Kiểm tra định dạng EX-YYYY-NN
      const pattern = /^EX-\d{4}-\d{2}$/;
      if (!pattern.test(code)) {
        inputExamCode.setAttribute('aria-invalid', 'true');
        inputExamCode.focus();
        window.QuizFlowStudent.showFeedback('Mã đề thi không hợp lệ. Định dạng chuẩn: EX-YYYY-NN (VD: EX-2026-01)', true);
        return;
      }

      // Các mã đề mẫu
      if (code === 'EX-2026-01') {
        window.QuizFlowStudent.showFeedback('✓ Tìm thấy đề thi [EX-2026-01]! Đang chuyển vào sảnh chờ thi...');
        setTimeout(() => {
          window.location.href = 'exam-lobby.html';
        }, 900);
      } else if (code === 'EX-2026-02') {
        window.QuizFlowStudent.showFeedback('Đề thi [EX-2026-02] sẽ mở lúc 14:00 ngày 15/11/2026. Chưa đến giờ thi.');
      } else if (code === 'EX-2026-03') {
        window.QuizFlowStudent.showFeedback('Đề thi [EX-2026-03] đã kết thúc. Đang mở trang kết quả...');
        setTimeout(() => {
          window.location.href = 'exam-result.html';
        }, 900);
      } else {
        window.QuizFlowStudent.showFeedback(`Không tìm thấy đề thi với mã [${code}] hoặc đề chưa được công bố.`, true);
      }
    });
  }

  // 3. Bộ chuyển trạng thái xem thử giao diện (Demo State Switcher)
  const btnToggleEmpty = document.getElementById('btn-toggle-empty-state');
  if (btnToggleEmpty && classesContainer && classesEmptyView) {
    btnToggleEmpty.addEventListener('click', () => {
      const isCurrentlyEmpty = !classesEmptyView.hidden;
      classesEmptyView.hidden = isCurrentlyEmpty;
      classesContainer.hidden = !isCurrentlyEmpty;

      btnToggleEmpty.textContent = isCurrentlyEmpty
        ? 'Chuyển xem: Danh sách rỗng (0 lớp)'
        : 'Chuyển xem: Đã có lớp (Đầy đủ)';

      window.QuizFlowStudent.showFeedback(
        isCurrentlyEmpty
          ? 'Đang xem trạng thái: Đã tham gia 02 lớp học.'
          : 'Đang xem trạng thái: Sinh viên chưa tham gia lớp nào (Empty state).'
      );
    });
  }

  // 4. Lắng nghe các nút có data-student-note
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-student-note]');
    if (button) {
      window.QuizFlowStudent.showFeedback(button.dataset.studentNote || 'Chức năng đang mở rộng.');
    }
  });

})();
