export class UIState {
  SetLoading(containerId, message = 'Cargando…') {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `<span class="ui-loading" role="status" aria-live="polite">
      <svg class="spinner" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4" stroke-dashoffset="10"/>
      </svg>
      ${message}
    </span>`;
  }

  SetSuccess(containerId, message) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `<span class="ui-success" role="status" aria-live="polite">${message}</span>`;
    setTimeout(() => { el.innerHTML = ''; }, 2000);
  }

  SetError(containerId, message, onRetry = null) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const retryBtn = onRetry
      ? `<button class="btn-retry" onclick="(${onRetry.toString()})()">Reintentar</button>`
      : '';
    el.innerHTML = `<span class="ui-error" role="alert" aria-live="assertive">${message}${retryBtn}</span>`;
  }

  Clear(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = '';
  }
}
