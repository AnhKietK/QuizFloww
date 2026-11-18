/*
 * Sidebar giáo viên dùng chung, hoạt động khi mở HTML trực tiếp.
 * Nạp sau ui.js và trước JavaScript của trang.
 * aside[data-teacher-sidebar] chứa dữ liệu trường/tài khoản ngay trong HTML.
 * data-current-page chọn mục hiện tại trong menu.
 * Vùng phản hồi dùng #teacher-feedback và [data-feedback-message] trong HTML.
 * QuizFlowTeacher cung cấp phản hồi và chuẩn hóa tìm kiếm cho các trang GV.
 */
(() => {
  'use strict';

  const sidebar = document.querySelector('[data-teacher-sidebar]');
  if (!sidebar) {
    return;
  }

  const workspace = sidebar.querySelector('[data-sidebar-workspace]');
  const user = sidebar.querySelector('[data-sidebar-user]');
  const template = document.createElement('template');
  template.innerHTML = `
    <a class="sidebar-brand" href="../../index.html">
      <span class="brand-mark"><svg fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><use href="#teacher-icon-bolt"/></svg></span>QuizFlow
    </a>
    <div data-workspace-slot></div>
    <p class="sidebar-nav-label">KHÔNG GIAN GIÁO VIÊN</p>
    <nav class="sidebar-nav" aria-label="Menu giáo viên">
      <a class="sidebar-nav-item" href="../../index.html"><svg class="icon" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><use href="#teacher-icon-grid"/></svg>Tổng quan</a>
      <a class="sidebar-nav-item" href="subjects-classes.html" data-teacher-page="subjects-classes"><svg class="icon" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><use href="#teacher-icon-folder"/></svg>Môn học &amp; lớp học</a>
      <a class="sidebar-nav-item" href="question-bank.html" data-teacher-page="question-bank"><svg class="icon" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><use href="#teacher-icon-copy"/></svg>Ngân hàng câu hỏi</a>
      <a class="sidebar-nav-item" href="exam-builder.html" data-teacher-page="exam-builder"><svg class="icon" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><use href="#teacher-icon-document"/></svg>Đề thi của tôi</a>
      <a class="sidebar-nav-item" href="exam-analytics.html" data-teacher-page="exam-analytics"><svg class="icon" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><use href="#teacher-icon-chart"/></svg>Kết quả &amp; thống kê</a>
    </nav>
    <div class="sidebar-bottom">
      <section class="notice teacher-sidebar-tip" aria-labelledby="teacher-tip-title">
        <strong id="teacher-tip-title">◇ Kết nối lớp học, mở tri thức.</strong>
        <p>Chia sẻ mã lớp để sinh viên tham gia. Mọi lớp học luôn gắn với một môn học cố định.</p>
      </section>
      <button class="sidebar-nav-item" type="button" data-teacher-note><svg class="icon" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><use href="#teacher-icon-user"/></svg>Hồ sơ cá nhân</button>
      <button class="sidebar-nav-item" type="button" data-teacher-note><svg class="icon" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><use href="#teacher-icon-logout"/></svg>Đăng xuất</button>
      <div data-user-slot></div>
    </div>`;
  template.content.querySelector('[data-workspace-slot]').replaceWith(workspace);
  template.content.querySelector('[data-user-slot]').replaceWith(user);
  sidebar.replaceChildren(template.content);
  sidebar.querySelectorAll('[data-teacher-page]').forEach((item) => {
    if (item.dataset.teacherPage === sidebar.dataset.currentPage) {
      item.setAttribute('aria-current', 'page');
    }
  });

  // Các biểu tượng giao diện dùng chung, độc lập với dữ liệu của từng trang.
  const icons = document.createElement('template');
  icons.innerHTML = `
    <svg class="visually-hidden" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs>
      <symbol id="teacher-icon-bolt" viewBox="0 0 24 24"><path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"/></symbol>
      <symbol id="teacher-icon-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></symbol>
      <symbol id="teacher-icon-folder" viewBox="0 0 24 24"><path d="M3 7V4h7l2 3h9v14H3V7Zm0 3h18"/></symbol>
      <symbol id="teacher-icon-copy" viewBox="0 0 24 24"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 5V3H3v13h2"/></symbol>
      <symbol id="teacher-icon-document" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6m-6 5h6m-6 5h4"/></symbol>
      <symbol id="teacher-icon-chart" viewBox="0 0 24 24"><path d="M2 12h5l3-9 4 18 3-9h5"/></symbol>
      <symbol id="teacher-icon-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/></symbol>
      <symbol id="teacher-icon-logout" viewBox="0 0 24 24"><path d="M9 4H4v16h5m5-13 5 5-5 5M8 12h13"/></symbol>
      <symbol id="teacher-icon-bell" viewBox="0 0 24 24"><path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 8H3c0-1 3-1 3-8Zm4 11h4"/></symbol>
      <symbol id="teacher-icon-code" viewBox="0 0 24 24"><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-16-2 20"/></symbol>
      <symbol id="teacher-icon-database" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/></symbol>
      <symbol id="teacher-icon-shield" viewBox="0 0 24 24"><path d="m12 2 8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5Z"/><path d="m8 12 3 3 5-6"/></symbol>
      <symbol id="teacher-icon-edit" viewBox="0 0 24 24"><path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14Z"/></symbol>
      <symbol id="teacher-icon-search" viewBox="0 0 24 24"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></symbol>
      <symbol id="teacher-icon-check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></symbol>
      <symbol id="teacher-icon-lock" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/></symbol>
      <symbol id="teacher-icon-close" viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6"/></symbol>
      <symbol id="teacher-icon-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v1m0 3v6"/></symbol>
    </defs></svg>`;
  document.body.prepend(icons.content);

  const feedback = document.getElementById('teacher-feedback');
  feedback.classList.add('teacher-feedback');
  function showFeedback(message) {
    window.QuizFlowUI.showToast(message, { element: feedback, failed: message.trim().startsWith('!') });
  }

  function normalizeSearch(text) {
    return text.trim().toLocaleLowerCase('vi').normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  }

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const button = event.target.closest('[data-teacher-note]');
    if (button && !button.disabled && button.getAttribute('aria-current') !== 'page') {
      showFeedback(button.dataset.teacherNote || `${button.textContent.trim()} · Chức năng chưa sẵn sàng.`);
    }
  });

  window.QuizFlowTeacher = Object.freeze({ showFeedback, normalizeSearch });
})();
