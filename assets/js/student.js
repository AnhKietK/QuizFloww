/*
 * QuizFlow — Tương tác và Sidebar dùng chung cho Sinh viên (Sơn)
 * Nạp sau ui.js và trước JavaScript của từng trang sinh viên.
 * aside[data-student-sidebar] tự động dựng menu, avatar, tip và icon SVG.
 * data-current-page chọn mục hiện tại trong menu ("dashboard", "lobby", "result", v.v.).
 */
(() => {
  'use strict';

  const sidebar = document.querySelector('[data-student-sidebar]');
  if (!sidebar) {
    return;
  }

  const workspace = sidebar.querySelector('[data-sidebar-workspace]');
  const user = sidebar.querySelector('[data-sidebar-user]');
  const template = document.createElement('template');
  template.innerHTML = `
    <a class="sidebar-brand" href="../../index.html">
      <span class="brand-mark"><svg fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><use href="#student-icon-bolt"/></svg></span>QuizFlow
    </a>
    <span class="badge student-role-badge">◇ SINH VIÊN</span>
    <div data-workspace-slot></div>
    <p class="sidebar-nav-label">KHÔNG GIAN CỦA BẠN</p>
    <nav class="sidebar-nav" aria-label="Menu sinh viên">
      <a class="sidebar-nav-item" href="dashboard.html" data-student-page="dashboard"><svg class="icon" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><use href="#student-icon-grid"/></svg>Tổng quan &amp; sảnh thi</a>
      <a class="sidebar-nav-item" href="exam-lobby.html" data-student-page="lobby"><svg class="icon" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><use href="#student-icon-document"/></svg>Sảnh chờ thi</a>
      <a class="sidebar-nav-item" href="exam-result.html" data-student-page="result"><svg class="icon" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><use href="#student-icon-chart"/></svg>Kết quả &amp; lịch sử thi</a>
    </nav>
    <div class="sidebar-bottom">
      <section class="notice student-sidebar-tip" aria-labelledby="student-tip-title">
        <strong id="student-tip-title">⚡ Giữ nhịp tập trung</strong>
        <p>Kiểm tra thời gian thực tế trước khi bắt đầu. Mỗi đề thi chỉ có 01 lượt thi duy nhất.</p>
      </section>
      <a class="sidebar-nav-item" href="../auth/auth-profile.html"><svg class="icon" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><use href="#student-icon-user"/></svg>Hồ sơ cá nhân</a>
      <a class="sidebar-nav-item" href="../auth/auth-profile.html"><svg class="icon" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><use href="#student-icon-logout"/></svg>Đăng xuất</a>
      <div data-user-slot></div>
    </div>`;

  if (workspace) {
    template.content.querySelector('[data-workspace-slot]').replaceWith(workspace);
  }
  if (user) {
    template.content.querySelector('[data-user-slot]').replaceWith(user);
  }
  sidebar.replaceChildren(template.content);

  const currentPage = sidebar.dataset.currentPage;
  sidebar.querySelectorAll('[data-student-page]').forEach((item) => {
    if (item.dataset.studentPage === currentPage) {
      item.setAttribute('aria-current', 'page');
    }
  });

  // Sprite biểu tượng SVG dùng chung cho phân hệ sinh viên
  const icons = document.createElement('template');
  icons.innerHTML = `
    <svg class="visually-hidden" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs>
      <symbol id="student-icon-bolt" viewBox="0 0 24 24"><path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"/></symbol>
      <symbol id="student-icon-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></symbol>
      <symbol id="student-icon-folder" viewBox="0 0 24 24"><path d="M3 7V4h7l2 3h9v14H3V7Zm0 3h18"/></symbol>
      <symbol id="student-icon-document" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6m-6 5h6m-6 5h4"/></symbol>
      <symbol id="student-icon-chart" viewBox="0 0 24 24"><path d="M2 12h5l3-9 4 18 3-9h5"/></symbol>
      <symbol id="student-icon-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/></symbol>
      <symbol id="student-icon-logout" viewBox="0 0 24 24"><path d="M9 4H4v16h5m5-13 5 5-5 5M8 12h13"/></symbol>
      <symbol id="student-icon-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></symbol>
      <symbol id="student-icon-check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></symbol>
      <symbol id="student-icon-shield" viewBox="0 0 24 24"><path d="m12 2 8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5Z"/><path d="m8 12 3 3 5-6"/></symbol>
      <symbol id="student-icon-lock" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/></symbol>
      <symbol id="student-icon-key" viewBox="0 0 24 24"><path d="m21 2-2 2m-3 3-4.5 4.5a5 5 0 1 0 2 2L16 11l2-2-2-2 3-3 2 2Z"/></symbol>
      <symbol id="student-icon-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></symbol>
      <symbol id="student-icon-search" viewBox="0 0 24 24"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></symbol>
      <symbol id="student-icon-bell" viewBox="0 0 24 24"><path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 8H3c0-1 3-1 3-8Zm4 11h4"/></symbol>
      <symbol id="student-icon-eye" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></symbol>
      <symbol id="student-icon-eye-off" viewBox="0 0 24 24"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M1 1l22 22M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 7 11 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 1 12s4 7 11 7c2.04 0 3.9-.59 5.49-1.61"/></symbol>
    </defs></svg>`;
  document.body.prepend(icons.content);

  // Tiện ích thông báo cho phân hệ sinh viên
  function showFeedback(message, failed = false) {
    if (window.QuizFlowUI && typeof window.QuizFlowUI.showToast === 'function') {
      window.QuizFlowUI.showToast(message, { failed });
    }
  }

  window.QuizFlowStudent = Object.freeze({ showFeedback });
})();
