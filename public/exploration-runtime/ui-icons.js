/* Generated from lucide-react by scripts/generate-exploration-icons.mjs. */
(function () {
var icons = {"Play":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-play\" aria-hidden=\"true\" focusable=\"false\"><polygon points=\"6 3 20 12 6 21 6 3\"></polygon></svg>","Pause":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-pause\" aria-hidden=\"true\" focusable=\"false\"><rect x=\"14\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"></rect><rect x=\"6\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"></rect></svg>","RotateCcw":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-rotate-ccw\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"></path><path d=\"M3 3v5h5\"></path></svg>","Info":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-info\" aria-hidden=\"true\" focusable=\"false\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 16v-4\"></path><path d=\"M12 8h.01\"></path></svg>","ArrowUpRight":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-arrow-up-right\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M7 7h10v10\"></path><path d=\"M7 17 17 7\"></path></svg>","Plus":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-plus\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 12h14\"></path><path d=\"M12 5v14\"></path></svg>","Minus":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-minus\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 12h14\"></path></svg>"};
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

})();
