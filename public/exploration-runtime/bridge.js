/* Layout and lifecycle bridge only. Model code is copied unchanged. */
(function () {
  'use strict';
  var disposed = false, failed = false, ready = false, cleanup = null, observer = null, frame = 0, interacted = false;
  function send(type, extra) {
    if (window.parent === window || !document.body) return;
    window.parent.postMessage(Object.assign({ type: type, slug: document.body.dataset.slug }, extra || {}), location.origin);
  }
  function resize() {
    if (disposed || frame) return;
    frame = requestAnimationFrame(function () {
      frame = 0;
      send('exploration:resize', { height: Math.ceil(document.body.getBoundingClientRect().height) });
    });
  }
  function failure() {
    if (failed) return;
    failed = true;
    ready = false;
    send('exploration:error');
  }
  window.addEventListener('error', failure);
  window.addEventListener('unhandledrejection', failure);
  function interaction(event, action) {
    if (interacted || !event.isTrusted || failed || disposed) return;
    interacted = true;
    send('exploration:interaction', { action: action });
  }
  document.addEventListener('click', function (event) {
    var target = event.target.closest && event.target.closest('button,canvas');
    if (target) interaction(event, target.tagName === 'CANVAS' ? 'inspect' : 'control');
  });
  document.addEventListener('input', function (event) {
    if (event.target.matches('input[type="range"]')) interaction(event, 'adjust');
  });
  document.addEventListener('change', function (event) {
    if (event.target.matches('select')) interaction(event, 'select');
    else if (event.target.matches('input[type="checkbox"],input[type="radio"]')) interaction(event, 'control');
  });
  document.addEventListener('keydown', function (event) {
    if (event.target.tagName === 'CANVAS' && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter',' ','i','I'].indexOf(event.key) !== -1) interaction(event, 'inspect');
  });
  document.addEventListener('DOMContentLoaded', function () {
    var body = document.body, scene = document.getElementById('scene');
    try {
      var family = body.dataset.family, mode = body.dataset.mode;
      if (family === 'world') cleanup = window.WorldExhibits.mount(mode, scene);
      else if (family === 'sky') cleanup = window.SkyExhibits.mount(mode, scene);
      else if (family === 'lab') cleanup = window.PhysicsLabs.mount(mode, scene);
      else if (family !== 'clock' && family !== 'evolution') throw new Error('Unknown visualisation');
      if (!scene.querySelector('canvas')) throw new Error('No visualisation was created');
      if (failed) return;
      observer = new ResizeObserver(resize);
      observer.observe(body);
      window.addEventListener('resize', resize);
      ready = true;
      send('exploration:ready');
      resize();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
    } catch (error) {
      failure();
      scene.innerHTML = '<p class="frame-fallback">This visualisation could not start. The explanation and sources are available on the parent page.</p>';
      console.error(error);
    }
  });
  window.addEventListener('message', function (event) {
    if (disposed || event.origin !== location.origin || event.source !== window.parent) return;
    if (event.data && event.data.type === 'exploration:measure') {
      if (failed) send('exploration:error');
      else if (ready) { send('exploration:ready'); resize(); }
    }
  });
  window.addEventListener('pageshow', function (event) {
    if (event.persisted && ready && !failed) { send('exploration:ready'); resize(); }
  });
  window.addEventListener('pagehide', function (event) {
    // Back/forward caching freezes this document rather than disposing it.
    if (event.persisted) return;
    disposed = true;
    if (frame) cancelAnimationFrame(frame);
    if (observer) observer.disconnect();
    if (cleanup) cleanup();
  });
})();
