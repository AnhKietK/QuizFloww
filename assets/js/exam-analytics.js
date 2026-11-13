/* KPI và CSV được tính từ các dòng trong HTML theo bộ lọc hiện tại. */
(() => {
  'use strict';
  const { normalizeSearch, showFeedback } = window.QuizFlowTeacher;
  const rows = Array.from(document.querySelectorAll('[data-result-row]'));
  const search = document.getElementById('result-search');
  const classFilter = document.getElementById('result-class');
  const stateFilter = document.getElementById('result-state');
  const scenario = document.getElementById('exam-scenario');
  const publish = document.getElementById('publish-answers');
  const stateLabels = { complete: 'Hoàn tất', progress: 'Đang làm', unstarted: 'Chưa thi' };
  const stateClasses = { complete: 'success', progress: 'warning', unstarted: 'accent' };
  const reasonLabels = { MANUAL: 'Nộp sớm', TIMEOUT: 'Hết giờ' };
  const text = (row, field) => row.querySelector(`[data-field="${field}"]`).textContent.trim();
  const score = row => Number(row.dataset.correct) / Number(row.dataset.total) * 10;
  const format = value => (Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2).replace('.', ',');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const metrics = [
    { source: document.getElementById('kpi-total'), format: value => String(Math.round(value)) },
    { source: document.getElementById('kpi-complete'), format: value => String(Math.round(value)) },
    { source: document.getElementById('kpi-average'), format }
  ].map((metric) => ({
    ...metric,
    wrapper: metric.source.closest('.analytics-count'),
    visual: metric.source.parentElement.querySelector('.analytics-count-visual')
  }));
  const resultsPanel = document.querySelector('[aria-labelledby="results-title"]');
  let countVersion = 0;
  let countFrame = 0;
  let countClock;
  let rowObserver;

  // Giá trị thật cập nhật ngay; mỗi lần đổi bộ lọc kết thúc lượt đếm cũ.
  function stopCounts() {
    countVersion += 1;
    window.cancelAnimationFrame(countFrame);
    countFrame = 0;
    const clock = countClock;
    countClock = null;
    clock?.cancel();
    metrics.forEach((metric) => {
      metric.wrapper.classList.remove('is-counting', 'analytics-count-running');
      metric.visual.textContent = '';
    });
  }

  function updateKpis(values) {
    if (metrics.every((metric, index) => metric.value === values[index])) return;
    stopCounts();
    metrics.forEach((metric, index) => {
      metric.value = values[index];
      metric.source.textContent = metric.value === null ? '—' : metric.format(metric.value);
      metric.wrapper.classList.toggle('has-value', metric.value !== null);
    });
    const counting = metrics.filter((metric) => metric.value !== null && metric.value > 0);
    if (motionPreference.matches || !counting.length) return;
    const style = getComputedStyle(document.documentElement);
    const time = style.getPropertyValue('--dur-count').trim();
    const duration = Number.parseFloat(time) * (time.endsWith('ms') ? 1 : 1000);
    if (!Number.isFinite(duration) || duration <= 0) return;
    const easing = style.getPropertyValue('--ease-out').trim();
    const version = countVersion;
    counting.forEach((metric) => {
      metric.visual.textContent = metric.format(0);
      metric.wrapper.classList.add('is-counting');
    });

    // Chờ thẻ vào trang xong để người xem thấy đủ lượt đếm từ 0.
    countFrame = window.requestAnimationFrame(() => {
      countFrame = window.requestAnimationFrame(() => {
        countFrame = 0;
        if (version !== countVersion) return;
        const parents = new Set(counting.map((metric) => metric.source.closest('.glass-card')));
        const entrances = Array.from(parents).flatMap((card) => card.getAnimations()
          .filter((animation) => animation.animationName === 'motion-fade-up'));
        Promise.allSettled(entrances.map((animation) => animation.finished)).then(() => {
          if (version !== countVersion) return;
          // Đồng hồ không gắn DOM dùng easing gốc của trình duyệt, cùng biến CSS.
          const effect = new KeyframeEffect(null, [{ opacity: 0 }, { opacity: 1 }], {
            duration, easing, fill: 'both'
          });
          const clock = new Animation(effect, document.timeline);
          countClock = clock;
          counting.forEach((metric) => metric.wrapper.classList.add('analytics-count-running'));
          function renderCount() {
            if (version !== countVersion) return;
            const progress = Math.max(0, Math.min(1, effect.getComputedTiming().progress || 0));
            counting.forEach((metric) => {
              metric.visual.textContent = metric.format(metric.value * progress);
            });
            if (progress < 1) countFrame = window.requestAnimationFrame(renderCount);
            else stopCounts();
          }
          clock.play();
          clock.finished.then(() => {
            if (version === countVersion) stopCounts();
          }, () => {});
          countFrame = window.requestAnimationFrame(renderCount);
        });
      });
    });
  }

  function finishRow(row) {
    rowObserver?.unobserve(row);
    row.dataset.motionResult = 'entered';
    row.classList.remove('analytics-row-pending', 'anim-fade-up', 'anim-stagger');
    row.style.removeProperty('--i');
  }

  // Hàng hiện một lần, sau thẻ chứa bảng; focus sẽ bỏ qua phần chờ.
  function revealRows(entries) {
    const entering = entries.filter((entry) => entry.isIntersecting
      && entry.target.dataset.motionResult === 'pending');
    const entrances = resultsPanel.getAnimations()
      .filter((animation) => animation.animationName === 'motion-fade-up');
    Promise.allSettled(entrances.map((animation) => animation.finished)).then(() => {
      entering.forEach((entry, index) => {
        const row = entry.target;
        if (row.dataset.motionResult !== 'pending' || row.hidden) return;
        if (motionPreference.matches) {
          finishRow(row);
          return;
        }
        rowObserver.unobserve(row);
        row.dataset.motionResult = 'entered';
        row.style.setProperty('--i', String(index));
        row.classList.remove('analytics-row-pending');
        row.classList.add('anim-stagger', 'anim-fade-up');
        const animation = row.getAnimations().find((item) => item.animationName === 'motion-fade-up');
        if (animation) animation.finished.then(() => finishRow(row), () => finishRow(row));
        else finishRow(row);
      });
    });
  }

  function filterResults() {
    const query = normalizeSearch(search.value);
    rows.forEach((row) => {
      row.hidden = !normalizeSearch(`${text(row, 'id')} ${text(row, 'name')}`).includes(query)
        || (classFilter.value !== 'all' && !row.dataset.classes.split(' ').includes(classFilter.value))
        || (stateFilter.value !== 'all' && row.dataset.state !== stateFilter.value);
    });
    const visible = rows.filter(row => !row.hidden);
    const finished = visible.filter(row => row.dataset.state === 'complete');
    updateKpis([
      visible.length,
      finished.length,
      finished.length ? finished.reduce((sum, row) => sum + score(row), 0) / finished.length : null
    ]);
    document.getElementById('kpi-denominator').textContent = `/ ${visible.length}`;
    document.getElementById('result-count').textContent = String(visible.length).padStart(2, '0');
    document.getElementById('result-summary').textContent = `Hiển thị ${visible.length} sinh viên`;
    document.getElementById('result-empty').hidden = visible.length !== 0;
    const bins = [0, 0, 0, 0, 0];
    finished.forEach(row => { bins[Math.min(4, Math.floor(score(row) / 2))] += 1; });
    document.querySelectorAll('[data-score-bin]').forEach((bar, index) => {
      bar.className = `analytics-bar analytics-bar--${bins[index]}`;
      bar.parentElement.setAttribute('aria-label', `${index * 2}–${index * 2 + 2} điểm: ${bins[index]} lượt`);
    });
    const ratio = visible.length ? finished.length / visible.length * 100 : 0;
    document.getElementById('completion-rate').textContent = `${ratio.toFixed(1).replace('.', ',')}%`;
    const progress = document.getElementById('completion-progress');
    progress.max = visible.length || 1;
    progress.value = finished.length;
  }

  function renderScenario() {
    const closed = scenario.value === 'closed';
    document.getElementById('exam-state-label').textContent = closed ? 'Đã đóng (09:00)' : 'Đang mở (08:40)';
    document.getElementById('exam-state-badge').className = `status status--${closed ? 'danger' : 'success'}`;
    document.getElementById('exam-state-badge').dataset.state = closed ? 'closed' : 'open';
    publish.disabled = !closed;
    publish.setAttribute('aria-checked', 'false');
    publish.querySelector('[data-toggle-state]').textContent = 'Đã tắt';
    publish.querySelector('[data-toggle-icon]').textContent = '○';
    document.getElementById('publish-help').textContent = closed
      ? 'Đề đã đóng · Có thể bật công bố đáp án.' : 'Đề đang mở · Chỉ bật công bố đáp án sau giờ đóng.';
    rows.forEach((row) => {
      const timedOut = row.dataset.baseState === 'progress' && closed;
      row.dataset.state = timedOut ? 'complete' : row.dataset.baseState;
      if (row.dataset.baseState === 'progress') {
        row.dataset.correct = timedOut ? row.dataset.timeoutCorrect : '';
        row.dataset.reason = timedOut ? 'TIMEOUT' : '';
        const end = row.querySelector('[data-field="end"]');
        end.dateTime = timedOut ? row.dataset.timeoutAt : '';
        end.textContent = timedOut ? '09:00:00' : '';
      }
      const state = row.querySelector('[data-field="state"]');
      state.className = `status status--${stateClasses[row.dataset.state]}`;
      state.querySelector('[data-state-label]').textContent = stateLabels[row.dataset.state];
      state.querySelector('[data-state-icon]').textContent = row.dataset.state === 'complete' ? '✓' : row.dataset.state === 'progress' ? '◐' : '○';
      row.querySelector('[data-field="correct"]').textContent = row.dataset.state === 'complete' ? `${row.dataset.correct}/${row.dataset.total}` : '';
      row.querySelector('[data-field="score"]').textContent = row.dataset.state === 'complete' ? format(score(row)) : '';
      row.querySelector('[data-field="reason"]').textContent = reasonLabels[row.dataset.reason] || '';
      row.querySelector('[data-field="reason"]').hidden = !row.dataset.reason;
      row.querySelector('[data-result-detail]').disabled = row.dataset.state !== 'complete';
    });
    filterResults();
  }

  function csvCell(value) {
    let safe = String(value);
    if (/^[\s\uFEFF]*[=+\-@]|^[\t\r\n]/.test(safe)) safe = `'${safe}`;
    return `"${safe.replaceAll('"', '""')}"`;
  }

  document.getElementById('export-results').addEventListener('click', () => {
    const data = [['Mã SV', 'Họ tên', 'Lớp', 'Trạng thái', 'Số câu đúng', 'Tổng câu', 'Điểm', 'Bắt đầu', 'Kết thúc', 'Lý do']];
    rows.filter(row => !row.hidden).forEach((row) => {
      const finished = row.dataset.state === 'complete';
      data.push([
        text(row, 'id'), text(row, 'name'), row.dataset.classes.split(' ').join('; '), stateLabels[row.dataset.state],
        finished ? row.dataset.correct : '', row.dataset.total, text(row, 'score'),
        row.querySelector('[data-field="start"]').dateTime, row.querySelector('[data-field="end"]').dateTime, row.dataset.reason
      ]);
    });
    try {
      const csv = '\uFEFF' + data.map(line => line.map(csvCell).join(',')).join('\r\n') + '\r\n';
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `bang-diem-ex-2026-01-${classFilter.value}-${stateFilter.value}.csv`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showFeedback(`Đã tạo CSV gồm ${data.length - 1} sinh viên theo bộ lọc.`);
    } catch {
      showFeedback('! Không thể tạo tệp CSV. Vui lòng thử lại.');
    }
  });
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('#publish-answers') && scenario.value !== 'closed') {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const button = event.target.closest('[data-result-detail]');
    if (!button || button.disabled) return;
    const row = button.closest('[data-result-row]');
    document.getElementById('detail-name').textContent = `${text(row, 'name')} · ${text(row, 'id')}`;
    document.getElementById('detail-score').textContent = `${text(row, 'score')} / 10`;
    document.getElementById('detail-correct').textContent = text(row, 'correct');
    document.getElementById('detail-classes').textContent = row.dataset.classes.split(' ').join(' · ');
    document.getElementById('detail-reason').textContent = reasonLabels[row.dataset.reason];
  }, true);
  search.addEventListener('input', filterResults);
  classFilter.addEventListener('change', filterResults);
  stateFilter.addEventListener('change', filterResults);
  scenario.addEventListener('change', renderScenario);
  resultsPanel.addEventListener('focusin', (event) => {
    const row = event.target.closest('[data-result-row]');
    if (row) finishRow(row);
  });
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) {
      stopCounts();
      rowObserver?.disconnect();
      rows.forEach(finishRow);
    }
  });
  document.getElementById('reset-results').addEventListener('click', () => {
    search.value = '';
    classFilter.value = 'all';
    stateFilter.value = 'all';
    filterResults();
  });
  renderScenario();
  if (!motionPreference.matches && 'IntersectionObserver' in window) {
    rowObserver = new IntersectionObserver(revealRows, { rootMargin: '0px 0px -24px 0px', threshold: 0 });
    rows.forEach((row) => {
      row.dataset.motionResult = 'pending';
      row.classList.add('analytics-row-pending');
      rowObserver.observe(row);
    });
  } else {
    rows.forEach(finishRow);
  }
})();
