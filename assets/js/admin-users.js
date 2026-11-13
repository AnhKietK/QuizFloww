/* Tìm/lọc tài khoản và xác nhận thao tác quản trị. Nạp sau ui.js. */
(() => {
  'use strict';

  const rows = Array.from(document.querySelectorAll('[data-user-row]'));
  const search = document.getElementById('user-search');
  const filters = document.getElementById('user-filters');
  const dialog = document.getElementById('user-confirm');
  const confirmButton = document.getElementById('confirm-user-action');
  const feedback = document.getElementById('admin-feedback');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const rowAnimations = new Map();
  let pendingAction;

  const actions = {
    grant: {
      title: 'Xác nhận cấp quyền giáo viên',
      description: 'Bạn đang cấp quyền giáo viên cho tài khoản dưới đây.',
      label: 'Cấp quyền giáo viên',
      confirm: 'Xác nhận cấp quyền',
      statusClass: 'status--accent',
      icon: 'icon-switch',
      warning: 'Tài khoản sẽ chuyển sang vai trò giáo viên. Quyền của phiên đăng nhập cũ sẽ được kiểm tra lại theo vai trò mới.'
    },
    revoke: {
      title: 'Xác nhận thu hồi quyền giáo viên',
      description: 'Bạn đang chuyển tài khoản dưới đây về vai trò sinh viên.',
      label: 'Thu hồi quyền giáo viên',
      confirm: 'Xác nhận thu hồi',
      statusClass: 'status--warning',
      icon: 'icon-switch',
      warning: 'Tài khoản sẽ chuyển sang vai trò sinh viên. Môn học, lớp và đề thi đã tạo vẫn thuộc chủ sở hữu cũ.'
    },
    lock: {
      title: 'Xác nhận khóa tài khoản',
      description: 'Bạn đang khóa quyền truy cập của tài khoản dưới đây.',
      label: 'Khóa tài khoản',
      confirm: 'Xác nhận khóa',
      statusClass: 'status--danger',
      icon: 'icon-lock',
      warning: 'Tài khoản sẽ bị khóa quyền truy cập. Lượt thi đã bắt đầu vẫn giữ hạn nộp ban đầu và được xử lý khi hết hạn.'
    },
    unlock: {
      title: 'Xác nhận mở khóa tài khoản',
      description: 'Bạn đang khôi phục quyền truy cập của tài khoản dưới đây.',
      label: 'Mở khóa tài khoản',
      confirm: 'Xác nhận mở khóa',
      statusClass: 'status--success',
      icon: 'icon-check',
      warning: 'Tài khoản sẽ được khôi phục quyền truy cập theo vai trò hiện tại. Hạn nộp của lượt thi cũ được giữ nguyên.'
    }
  };

  function normalizeSearch(text) {
    return text.trim().toLocaleLowerCase('vi').normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  }

  // Mỗi lượt lọc hủy chuyển động cũ trước khi áp dụng kết quả mới nhất.
  function clearRowMotion(row) {
    row.classList.remove('admin-row-updating');
    row.style.removeProperty('--row-shift');
    row.style.removeProperty('--row-opacity');
  }

  function stopRowAnimations() {
    rowAnimations.forEach((animation, row) => {
      animation.cancel();
      clearRowMotion(row);
    });
    rowAnimations.clear();
  }

  function animateRows(previousPositions) {
    const visibleRows = rows.filter((row) => !row.hidden);
    const changed = visibleRows.length !== previousPositions.size
      || visibleRows.some((row) => !previousPositions.has(row));
    if (!changed) {
      return;
    }

    // Đọc vị trí đích cùng một lượt trước khi gắn animation cho các hàng.
    const positions = visibleRows.map((row) => ({ row, top: row.getBoundingClientRect().top }));
    positions.forEach(({ row, top }) => {
      const previous = previousPositions.get(row);
      if (previous !== undefined) {
        row.style.setProperty('--row-shift', `${previous - top}px`);
        row.style.setProperty('--row-opacity', '0.8');
      }
      row.classList.add('admin-row-updating');
      const animation = row.getAnimations().find((item) => item.animationName === 'admin-row-update');
      if (!animation) {
        clearRowMotion(row);
        return;
      }
      rowAnimations.set(row, animation);
      const cleanup = () => {
        if (rowAnimations.get(row) === animation) {
          clearRowMotion(row);
          rowAnimations.delete(row);
        }
      };
      animation.finished.then(cleanup, cleanup);
    });
  }

  function filterUsers(animate = false) {
    const previousPositions = animate && !motionPreference.matches
      ? new Map(rows.filter((row) => !row.hidden).map((row) => [row, row.getBoundingClientRect().top]))
      : null;
    stopRowAnimations();
    const query = normalizeSearch(search.value);
    const role = filters.querySelector('[data-user-filter="role"] [aria-pressed="true"]').dataset.value;
    const status = filters.querySelector('[data-user-filter="status"] [aria-pressed="true"]').dataset.value;
    let visible = 0;

    rows.forEach((row) => {
      const identity = Array.from(row.querySelectorAll('[data-username], [data-fullname], [data-student-id]'))
        .map((cell) => cell.textContent).join(' ');
      const matches = normalizeSearch(identity).includes(query)
        && (role === 'all' || row.dataset.userRole === role)
        && (status === 'all' || row.dataset.userStatus === status);
      row.hidden = !matches;
      if (matches) {
        visible += 1;
      }
    });

    document.getElementById('user-result-count').textContent = String(visible).padStart(2, '0');
    document.getElementById('user-empty').hidden = visible !== 0;
    document.getElementById('user-result-summary').textContent =
      `Hiển thị ${visible} trong ${rows.length} tài khoản`;
    if (previousPositions) {
      animateRows(previousPositions);
    }
  }

  function showFeedback(message) {
    window.QuizFlowUI.showToast(message, { element: feedback });
  }

  function canManage(row, action) {
    if (!row || !['student', 'teacher'].includes(row.dataset.userRole)) {
      return false;
    }
    const role = row.dataset.userRole;
    const status = row.dataset.userStatus;
    return (action === 'grant' && role === 'student')
      || (action === 'revoke' && role === 'teacher')
      || (action === 'lock' && status === 'active')
      || (action === 'unlock' && status === 'locked');
  }

  function prepareConfirmation(row, action) {
    const config = actions[action];
    const username = row.querySelector('[data-username]').textContent.trim();
    const studentId = row.querySelector('[data-student-id]').textContent.trim();
    const locked = row.dataset.userStatus === 'locked';
    pendingAction = { row, action, username };

    document.getElementById('user-confirm-title').textContent = config.title;
    document.getElementById('user-confirm-description').textContent = config.description;
    document.getElementById('confirm-target-name').textContent = row.querySelector('[data-fullname]').textContent;
    document.getElementById('confirm-target-avatar').textContent = row.querySelector('.avatar').textContent;
    document.getElementById('confirm-target-account').textContent =
      studentId === '—' ? username : `${username} · ${studentId}`;
    document.getElementById('confirm-target-role').textContent = row.querySelector('[data-role-label]').textContent;

    const currentStatus = document.getElementById('confirm-target-status');
    currentStatus.className = `status ${locked ? 'status--danger' : 'status--success'}`;
    currentStatus.querySelector('use').setAttribute('href', locked ? '#icon-lock' : '#icon-check');
    currentStatus.querySelector('[data-status-label]').textContent = locked ? 'Đã khóa' : 'Hoạt động';

    const intent = document.getElementById('confirm-intent');
    intent.className = `status ${config.statusClass}`;
    intent.querySelector('use').setAttribute('href', `#${config.icon}`);
    intent.querySelector('[data-intent-label]').textContent = config.label;
    document.getElementById('user-confirm-warning').textContent = config.warning;
    confirmButton.textContent = config.confirm;
    confirmButton.className = `btn ${action === 'lock' ? 'btn--danger' : 'btn--primary'}`;
  }

  search.addEventListener('input', () => filterUsers(true));
  filters.addEventListener('change', () => filterUsers(true));
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) {
      stopRowAnimations();
    }
  });

  document.getElementById('reset-user-filters').addEventListener('click', () => {
    search.value = '';
    filters.querySelectorAll('[data-segment]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.value === 'all'));
    });
    filterUsers(true);
    search.focus();
  });

  // Chuẩn bị nội dung trước khi ui.js mở dialog ở giai đoạn nổi bọt.
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const trigger = event.target.closest('[data-user-action]');
    if (!trigger) {
      return;
    }

    const row = trigger.closest('[data-user-row]');
    const action = trigger.dataset.userAction;
    if (trigger.disabled || !canManage(row, action)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    prepareConfirmation(row, action);
  }, true);

  confirmButton.addEventListener('click', async () => {
    if (!dialog.open || !pendingAction || !canManage(pendingAction.row, pendingAction.action)) {
      return;
    }
    const message = `Đã xác nhận thao tác “${actions[pendingAction.action].label}” cho ${pendingAction.username}.`;
    pendingAction = null;
    if (await window.QuizFlowUI.closeDialog(dialog, 'confirm')) {
      showFeedback(message);
    }
  });

  document.querySelectorAll('[data-admin-note]').forEach((button) => {
    button.addEventListener('click', () => showFeedback(button.dataset.adminNote));
  });

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k'
      && !document.querySelector('dialog[open]')) {
      event.preventDefault();
      search.focus();
    }
  });

  filterUsers();
})();
