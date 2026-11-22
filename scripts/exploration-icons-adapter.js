// Presentation adapter only. Never touch model values, formulas or canvas content.
function adapt(control) {
  var text = control.textContent.trim(), name = null, label = text;
  if (control.matches('button.ph-help') && text === '?') { name = 'Info'; label = ''; }
  else if (control.matches('button.sky-zoom-button') && (text === '+' || text === '−')) { name = text === '+' ? 'Plus' : 'Minus'; label = ''; }
  else if (control.matches('button') && /^(▶|Ⅱ|↻)\s/.test(text)) {
    name = text[0] === '▶' ? 'Play' : text[0] === 'Ⅱ' ? 'Pause' : 'RotateCcw';
    label = text.slice(1).trim();
  } else if (control.matches('a') && / ↗$/.test(text)) { name = 'ArrowUpRight'; label = text.slice(0, -2); }
  if (!name) return;
  var template = document.createElement('template');
  template.innerHTML = icons[name];
  var svg = template.content.firstElementChild;
  control.replaceChildren(svg, document.createTextNode(label ? ' ' + label : ''));
}
function scan() { document.querySelectorAll('button,a').forEach(adapt); }
var iconObserver;
document.addEventListener('DOMContentLoaded', function () {
  scan();
  iconObserver = new MutationObserver(scan);
  iconObserver.observe(document.body, {childList:true,subtree:true,characterData:true});
});
window.addEventListener('pagehide', function (event) { if (!event.persisted && iconObserver) iconObserver.disconnect(); });
