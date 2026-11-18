/*
 * QuizFlow — Xử lý tương tác màn hình Đăng nhập, Đăng ký & Hồ sơ (F01)
 * Hỗ trợ chuyển tab, toggle xem mật khẩu và kiểm tra hợp lệ phía client.
 */
(() => {
  'use strict';

  // Khởi tạo các phần tử DOM
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formAuth = document.getElementById('auth-form');
  const formPassword = document.getElementById('password-form');
  const authTitle = document.getElementById('auth-title');
  const authDesc = document.getElementById('auth-desc');
  const submitBtn = document.getElementById('auth-submit-btn');
  const switchLink = document.getElementById('auth-switch-link');
  const switchPrompt = document.getElementById('auth-switch-prompt');

  // Các trường đăng ký riêng
  const fieldFullName = document.getElementById('field-fullname');
  const fieldStudentCode = document.getElementById('field-student-code');
  const fieldConfirmPassword = document.getElementById('field-confirm-password');
  const labelUsername = document.getElementById('label-username');
  const inputUsername = document.getElementById('input-username');

  let currentMode = 'register'; // 'register' hoặc 'login'

  function setMode(mode) {
    if (mode === currentMode) return;
    currentMode = mode;
    const isRegister = mode === 'register';

    // Cập nhật trạng thái nút tab
    if (tabRegister) tabRegister.setAttribute('aria-pressed', isRegister ? 'true' : 'false');
    if (tabLogin) tabLogin.setAttribute('aria-pressed', isRegister ? 'false' : 'true');

    // Ẩn/hiện các trường riêng
    if (fieldFullName) fieldFullName.hidden = !isRegister;
    if (fieldConfirmPassword) fieldConfirmPassword.hidden = !isRegister;

    if (isRegister) {
      if (authTitle) authTitle.textContent = 'Bắt đầu hành trình của bạn.';
      if (authDesc) authDesc.textContent = 'Tạo tài khoản sinh viên để tham gia lớp học và kỳ thi.';
      if (labelUsername) labelUsername.textContent = 'Tên đăng nhập';
      if (inputUsername) inputUsername.placeholder = 'VD: son.nguyen';
      if (fieldStudentCode) fieldStudentCode.hidden = false;
      if (submitBtn) submitBtn.textContent = 'Tạo tài khoản sinh viên →';
      if (switchPrompt) switchPrompt.textContent = 'Đã có tài khoản? ';
      if (switchLink) {
        switchLink.querySelector('strong').textContent = 'Đăng nhập ngay';
        switchLink.dataset.targetMode = 'login';
      }
    } else {
      if (authTitle) authTitle.textContent = 'Chào mừng bạn trở lại.';
      if (authDesc) authDesc.textContent = 'Đăng nhập để vào phòng thi và xem điểm số của bạn.';
      if (labelUsername) labelUsername.textContent = 'Tên đăng nhập hoặc Mã sinh viên';
      if (inputUsername) inputUsername.placeholder = 'VD: son.nguyen hoặc SV2026001';
      if (fieldStudentCode) fieldStudentCode.hidden = true;
      if (submitBtn) submitBtn.textContent = 'Đăng nhập vào QuizFlow →';
      if (switchPrompt) switchPrompt.textContent = 'Chưa có tài khoản? ';
      if (switchLink) {
        switchLink.querySelector('strong').textContent = 'Đăng ký sinh viên ngay';
        switchLink.dataset.targetMode = 'register';
      }
    }

    // Reset các viền báo lỗi
    formAuth.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
    window.QuizFlowMotion?.animateChange(formAuth);
  }

  // Sự kiện chuyển tab
  if (tabLogin) {
    tabLogin.addEventListener('click', () => setMode('login'));
  }
  if (tabRegister) {
    tabRegister.addEventListener('click', () => setMode('register'));
  }
  if (switchLink) {
    switchLink.addEventListener('click', (e) => {
      e.preventDefault();
      setMode(switchLink.dataset.targetMode || 'login');
    });
  }

  // Bật/tắt xem mật khẩu
  document.querySelectorAll('[data-toggle-password]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.auth-input-wrapper')?.querySelector('input');
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.setAttribute('aria-label', isPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
      const useEl = btn.querySelector('use');
      if (useEl) {
        useEl.setAttribute('href', isPassword ? '#student-icon-eye-off' : '#student-icon-eye');
      }
    });
  });

  // Tiện ích hiển thị thông báo
  function notify(msg, failed = false) {
    if (window.QuizFlowUI && typeof window.QuizFlowUI.showToast === 'function') {
      window.QuizFlowUI.showToast(msg, { failed });
    } else {
      alert(msg);
    }
  }

  // Xử lý gửi form Đăng nhập / Đăng ký
  if (formAuth) {
    formAuth.addEventListener('submit', (e) => {
      e.preventDefault();

      const username = inputUsername.value.trim();
      const password = document.getElementById('input-password').value;

      if (currentMode === 'register') {
        const fullname = document.getElementById('input-fullname').value.trim();
        const studentCode = document.getElementById('input-student-code').value.trim();
        const confirmPassword = document.getElementById('input-confirm-password').value;

        if (!fullname) {
          notify('Vui lòng nhập họ và tên của bạn.', true);
          document.getElementById('input-fullname').focus();
          document.getElementById('input-fullname').setAttribute('aria-invalid', 'true');
          return;
        }

        if (!username) {
          notify('Vui lòng nhập tên đăng nhập.', true);
          inputUsername.focus();
          inputUsername.setAttribute('aria-invalid', 'true');
          return;
        }

        if (!studentCode) {
          notify('Mã sinh viên là bắt buộc để tham gia lớp học.', true);
          document.getElementById('input-student-code').focus();
          document.getElementById('input-student-code').setAttribute('aria-invalid', 'true');
          return;
        }

        if (password.length < 8) {
          notify('Mật khẩu bảo mật phải có tối thiểu 8 ký tự.', true);
          document.getElementById('input-password').focus();
          document.getElementById('input-password').setAttribute('aria-invalid', 'true');
          return;
        }

        if (password !== confirmPassword) {
          notify('Mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại.', true);
          document.getElementById('input-confirm-password').focus();
          document.getElementById('input-confirm-password').setAttribute('aria-invalid', 'true');
          return;
        }

        notify('✓ Tạo tài khoản sinh viên thành công! Đang chuyển đến trang chủ...');
        setTimeout(() => {
          window.location.href = '../student/dashboard.html';
        }, 1200);

      } else {
        // Mode đăng nhập
        if (!username) {
          notify('Vui lòng nhập tên đăng nhập hoặc mã sinh viên.', true);
          inputUsername.focus();
          inputUsername.setAttribute('aria-invalid', 'true');
          return;
        }

        if (!password) {
          notify('Vui lòng nhập mật khẩu.', true);
          document.getElementById('input-password').focus();
          document.getElementById('input-password').setAttribute('aria-invalid', 'true');
          return;
        }

        notify('✓ Đăng nhập thành công! Chào mừng bạn trở lại.');
        setTimeout(() => {
          window.location.href = '../student/dashboard.html';
        }, 1000);
      }
    });
  }

  // Xử lý gửi form Đổi mật khẩu
  if (formPassword) {
    formPassword.addEventListener('submit', (e) => {
      e.preventDefault();

      const oldPass = document.getElementById('input-old-password').value;
      const newPass = document.getElementById('input-new-password').value;
      const confirmNewPass = document.getElementById('input-confirm-new-password').value;

      if (!oldPass) {
        notify('Vui lòng nhập mật khẩu hiện tại.', true);
        document.getElementById('input-old-password').focus();
        document.getElementById('input-old-password').setAttribute('aria-invalid', 'true');
        return;
      }

      if (newPass.length < 8) {
        notify('Mật khẩu mới phải có tối thiểu 8 ký tự.', true);
        document.getElementById('input-new-password').focus();
        document.getElementById('input-new-password').setAttribute('aria-invalid', 'true');
        return;
      }

      if (newPass === oldPass) {
        notify('Mật khẩu mới không được trùng với mật khẩu hiện tại.', true);
        document.getElementById('input-new-password').focus();
        document.getElementById('input-new-password').setAttribute('aria-invalid', 'true');
        return;
      }

      if (newPass !== confirmNewPass) {
        notify('Xác nhận mật khẩu mới không khớp.', true);
        document.getElementById('input-confirm-new-password').focus();
        document.getElementById('input-confirm-new-password').setAttribute('aria-invalid', 'true');
        return;
      }

      formPassword.reset();
      formPassword.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
      notify('✓ Đổi mật khẩu thành công! Các phiên đăng nhập cũ đã được thu hồi an toàn.');
    });
  }

  // Hỗ trợ trợ giúp
  document.querySelectorAll('[data-auth-help]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      notify('Bộ phận kỹ thuật QuizFlow luôn sẵn sàng hỗ trợ tại phòng IT hoặc qua email support@quizflow.edu.vn.');
    });
  });

})();
