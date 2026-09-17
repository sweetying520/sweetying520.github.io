(function () {
  'use strict';
  const dateElement = document.getElementById('timeDate');
  const timeElement = document.getElementById('times');
  if (!dateElement || !timeElement) return;
  const start = new Date('2022-09-05T20:11:15+08:00').getTime();
  const pad = value => String(value).padStart(2, '0');
  function update() {
    const seconds = Math.max(0, Math.floor((Date.now() - start) / 1000));
    dateElement.textContent = `本站已运行 ${Math.floor(seconds / 86400)} 天`;
    timeElement.textContent = `${pad(Math.floor(seconds / 3600) % 24)} 小时 ${pad(Math.floor(seconds / 60) % 60)} 分 ${pad(seconds % 60)} 秒`;
  }
  update();
  setInterval(update, 1000);
})();
