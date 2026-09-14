(() => {
  const form = document.getElementById('photoRequestForm');
  const statusBox = document.getElementById('formStatus');
  const button = form.querySelector('button[type="submit"]');
  const endpoint = "https://script.google.com/macros/s/AKfycbx2uLRJLUXhf2mDQIM81vNmMEoelO8mWR7mizcIdfX7ggTEZLwhir5N-5PB2msSTuLbnQ/exec";
  let sending = false;
  const clean = value => String(value || '').trim();
  const formatDate = value => value ? value.split('-').reverse().join('.') : 'Не указана';
  function status(text, state) {
    statusBox.hidden = false;
    statusBox.textContent = text;
    statusBox.dataset.state = state;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    const data = new FormData(form);
    if (!clean(data.get('clientName')) || !clean(data.get('phone'))) {
      status('Укажите имя и номер телефона.', 'error');
      return;
    }
    const payload = {
      type: 'request',
      clientName: clean(data.get('clientName')),
      phone: clean(data.get('phone')),
      messenger: clean(data.get('messenger')) || 'Не указан',
      shootType: clean(data.get('shootType')) || 'Не указан',
      shootDate: formatDate(clean(data.get('shootDate'))),
      comment: clean(data.get('comment')) || 'Без комментария',
      createdAt: new Date().toLocaleString('ru-RU')
    };
    sending = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status('Отправляю заявку…', 'pending');
    try {
      // Preserve the original Apps Script transport and payload contract.
      // An opaque no-cors response cannot confirm Telegram delivery.
      await fetch(endpoint, {
        method: 'POST', mode: 'no-cors',
        headers: {'Content-Type': 'text/plain;charset=utf-8'},
        body: JSON.stringify(payload)
      });
      status('Заявка передана на обработку. Если ответа не будет, напишите мне напрямую в Telegram.', 'sent');
      form.reset();
    } catch (error) {
      status('Не удалось отправить заявку. Данные сохранены в форме — попробуйте ещё раз или напишите мне в Telegram.', 'error');
    } finally {
      sending = false;
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
})();
