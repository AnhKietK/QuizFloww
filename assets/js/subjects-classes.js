/* Lọc môn/lớp, kiểm tra biểu mẫu và xác nhận thao tác thành viên. */
(() => {
  'use strict';

  const { showFeedback, normalizeSearch } = window.QuizFlowTeacher;
  const subjects = Array.from(document.querySelectorAll('[data-subject-card]'));
  const classes = Array.from(document.querySelectorAll('[data-class-card]'));
  const members = Array.from(document.querySelectorAll('[data-member]'));
  const classSearch = document.getElementById('class-search');
  const memberSearch = document.getElementById('member-search');
  const classForm = document.getElementById('class-form');
  const subjectForm = document.getElementById('subject-form');
  const drawer = document.getElementById('members-drawer');
  const removePanel = document.getElementById('remove-member-confirm');
  let selectedSubject = 'web';
  let editingSubject;
  let activeClass;
  let pendingMember;

  function filterClasses() {
    const query = normalizeSearch(classSearch.value);
    let count = 0;
    classes.forEach((card) => {
      const matches = card.dataset.subjectId === selectedSubject
        && normalizeSearch(`${card.dataset.classTitle} ${card.dataset.classCode}`).includes(query);
      card.hidden = !matches;
      if (matches) {
        count += 1;
      }
    });
    document.getElementById('class-count').textContent = `${String(count).padStart(2, '0')} lớp học`;
    document.getElementById('class-empty').hidden = count !== 0;
  }

  function selectSubject(id) {
    const selected = subjects.find((subject) => subject.dataset.subjectId === id);
    if (!selected) {
      return;
    }
    selectedSubject = id;
    subjects.forEach((subject) => {
      const active = subject === selected;
      subject.dataset.active = String(active);
      subject.querySelector('[data-select-subject]').setAttribute('aria-pressed', String(active));
      subject.querySelector('[data-subject-selected]').hidden = !active;
    });
    document.getElementById('selected-subject').textContent = selected.querySelector('[data-subject-name]').textContent;
    classSearch.value = '';
    filterClasses();
  }

  function clearFormErrors(form) {
    form.querySelectorAll('[aria-invalid]').forEach((field) => field.removeAttribute('aria-invalid'));
    form.querySelectorAll('.field-error').forEach((error) => {
      error.hidden = true;
    });
  }

  function validateTextField(field, maxLength, required) {
    const value = field.value.trim();
    const label = field.labels[0].textContent.trim();
    let message = '';
    if (required && !value) {
      message = `Vui lòng nhập ${label.toLocaleLowerCase('vi')}.`;
    } else if (value.length > maxLength) {
      message = `${label} chỉ được tối đa ${maxLength} ký tự.`;
    }
    const error = field.closest('.field').querySelector('.field-error');
    error.querySelector('[data-error-message]').textContent = message;
    error.hidden = !message;
    field.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  }

  function hideRemoveConfirmation(restoreFocus = false) {
    const member = pendingMember;
    pendingMember = null;
    removePanel.hidden = true;
    if (restoreFocus && member && !member.hidden && drawer.open) {
      member.querySelector('[data-remove-member]').focus({ preventScroll: true });
    }
  }

  function filterMembers() {
    if (!activeClass) {
      return;
    }
    const query = normalizeSearch(memberSearch.value);
    let count = 0;
    members.forEach((member) => {
      const belongsToClass = member.dataset.memberClasses.split(' ').includes(activeClass.dataset.classId);
      const matches = belongsToClass && normalizeSearch(
        `${member.querySelector('[data-member-name]').textContent} ${member.querySelector('[data-member-id]').textContent}`
      ).includes(query);
      member.hidden = !matches;
      if (matches) {
        count += 1;
      }
    });
    document.getElementById('member-empty').hidden = count !== 0;
    document.getElementById('member-summary').textContent =
      `Hiển thị ${count} thành viên / ${activeClass.dataset.memberCount} sinh viên.`;
  }

  function prepareMembers(card) {
    activeClass = card;
    document.getElementById('drawer-class-name').textContent = card.dataset.classTitle;
    document.getElementById('drawer-class-code').textContent = card.dataset.classCode;
    document.getElementById('drawer-copy-code').dataset.copy = card.dataset.classCode;
    document.getElementById('drawer-copy-code').setAttribute('aria-label', `Sao chép mã lớp ${card.dataset.classCode}`);
    document.getElementById('drawer-member-count').textContent = `${card.dataset.memberCount} sinh viên`;
    memberSearch.value = '';
    hideRemoveConfirmation();
    filterMembers();
  }

  // Cập nhật nội dung trước khi ui.js mở modal/drawer.
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const button = event.target.closest('[data-create-class], [data-create-subject], [data-edit-subject], [data-open-members]');
    if (!button || button.disabled) {
      return;
    }
    if (button.hasAttribute('data-create-class')) {
      classForm.reset();
      clearFormErrors(classForm);
      document.getElementById('class-subject').value = selectedSubject;
    } else if (button.hasAttribute('data-create-subject') || button.hasAttribute('data-edit-subject')) {
      subjectForm.reset();
      clearFormErrors(subjectForm);
      editingSubject = subjects.find((subject) => subject.dataset.subjectId === button.dataset.editSubject);
      document.getElementById('subject-dialog-title').textContent = editingSubject ? 'Chỉnh sửa môn học' : 'Tạo môn học mới';
      document.getElementById('subject-submit').textContent = editingSubject ? 'Lưu thay đổi' : 'Tạo môn học';
      if (editingSubject) {
        document.getElementById('subject-name').value = editingSubject.querySelector('[data-subject-name]').textContent;
        document.getElementById('subject-description').value = editingSubject.dataset.subjectDescription;
      }
    } else if (button.hasAttribute('data-open-members')) {
      prepareMembers(button.closest('[data-class-card]'));
    }
  }, true);

  document.querySelectorAll('[data-select-subject]').forEach((button) => {
    button.addEventListener('click', () => selectSubject(button.dataset.selectSubject));
  });
  classSearch.addEventListener('input', filterClasses);
  document.getElementById('clear-class-search').addEventListener('click', () => {
    classSearch.value = '';
    filterClasses();
    classSearch.focus();
  });

  [classForm, subjectForm].forEach((form) => {
    form.addEventListener('input', () => clearFormErrors(form));
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = form.querySelector('[data-name-field]');
      const description = form.querySelector('textarea');
      const nameValid = validateTextField(name, 200, true);
      const descriptionValid = validateTextField(description, 1000, false);
      let subjectValid = true;
      if (form === classForm) {
        const select = document.getElementById('class-subject');
        subjectValid = subjects.some((subject) => subject.dataset.subjectId === select.value);
        select.setAttribute('aria-invalid', String(!subjectValid));
        document.getElementById('class-subject-error').hidden = subjectValid;
      }
      if (!nameValid || !descriptionValid || !subjectValid) {
        form.querySelector('[aria-invalid="true"]').focus();
        return;
      }
      const action = form === classForm ? 'tạo lớp học' : editingSubject ? 'cập nhật môn học' : 'tạo môn học';
      const message = `Đã xác nhận ${action} “${name.value.trim()}”.`;
      if (await window.QuizFlowUI.closeDialog(form.closest('dialog'), 'confirm')) {
        showFeedback(message);
      }
    });
  });

  memberSearch.addEventListener('input', () => {
    hideRemoveConfirmation();
    filterMembers();
  });
  document.querySelectorAll('[data-remove-member]').forEach((button) => {
    button.addEventListener('click', () => {
      pendingMember = button.closest('[data-member]');
      document.getElementById('remove-member-target').textContent =
        `${pendingMember.querySelector('[data-member-name]').textContent} · ${pendingMember.querySelector('[data-member-id]').textContent}`;
      removePanel.hidden = false;
      document.getElementById('cancel-member-removal').focus();
    });
  });
  document.getElementById('cancel-member-removal').addEventListener('click', () => hideRemoveConfirmation(true));
  document.getElementById('confirm-member-removal').addEventListener('click', () => {
    if (!drawer.open || !pendingMember || pendingMember.hidden || !activeClass) {
      return;
    }
    showFeedback(`Đã xác nhận xóa ${pendingMember.querySelector('[data-member-name]').textContent} khỏi ${activeClass.dataset.classTitle}.`);
    hideRemoveConfirmation(true);
  });

  filterClasses();
})();
