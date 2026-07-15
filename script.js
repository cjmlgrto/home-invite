var svg = document.getElementById('drawing-svg');
var drawingInput = document.getElementById('drawing');
var clearBtn = document.getElementById('clear-btn');
var canvasPlaceholder = document.getElementById('canvas-placeholder');
var form = document.getElementById('rsvp-form');
var currentPath = null;
var drawing = false;

function svgVars() {
  var style = getComputedStyle(document.documentElement);
  return {
    color: style.getPropertyValue('--stroke-color').trim(),
    width: style.getPropertyValue('--stroke-width').trim()
  };
}

function pointToSvg(evt) {
  var rect = svg.getBoundingClientRect();
  var scaleX = 300 / rect.width;
  var scaleY = 300 / rect.height;
  var x = (evt.clientX - rect.left) * scaleX;
  var y = (evt.clientY - rect.top) * scaleY;
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

function serialize() {
  drawingInput.value = svg.outerHTML;
}

function playPlaceholderAnimation() {
  var paths = canvasPlaceholder.querySelectorAll('path');
  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    var length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    if (path.getAnimations) {
      path.getAnimations().forEach(function (anim) { anim.cancel(); });
    }
    path.animate(
      [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
      { duration: 3000, delay: i * 35, easing: 'ease-in-out', fill: 'forwards' }
    );
  }
}

svg.addEventListener('pointerdown', function (evt) {
  evt.preventDefault();
  drawing = true;
  svg.setPointerCapture(evt.pointerId);
  canvasPlaceholder.classList.add('is-hidden');
  var vars = svgVars();
  var p = pointToSvg(evt);
  currentPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  currentPath.setAttribute('d', 'M' + p[0] + ' ' + p[1]);
  currentPath.setAttribute('stroke', vars.color);
  currentPath.setAttribute('stroke-width', vars.width);
  currentPath.setAttribute('fill', 'none');
  currentPath.setAttribute('stroke-linecap', 'round');
  currentPath.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(currentPath);
});

svg.addEventListener('pointermove', function (evt) {
  if (!drawing || !currentPath) return;
  evt.preventDefault();
  var p = pointToSvg(evt);
  var d = currentPath.getAttribute('d');
  currentPath.setAttribute('d', d + ' L' + p[0] + ' ' + p[1]);
});

function endStroke(evt) {
  if (!drawing) return;
  evt.preventDefault();
  drawing = false;
  currentPath = null;
  serialize();
}

svg.addEventListener('pointerup', endStroke);
svg.addEventListener('pointercancel', endStroke);
svg.addEventListener('pointerleave', endStroke);

clearBtn.addEventListener('click', function () {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  canvasPlaceholder.classList.remove('is-hidden');
  playPlaceholderAnimation();
  serialize();
});

form.addEventListener('submit', function () {
  serialize();
});

playPlaceholderAnimation();
