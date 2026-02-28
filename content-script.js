// Toggle visibility of divs with class starting with main__player-aside___
console.log('fanzone_killer content script loaded');

let hidden = true;
let toggleBtn = null; // reference to the Fanzone toggle button

function updateVisibility() {
  const all = document.querySelectorAll('[class^="main__player-aside___"]');
  // ignore elements that exist but are effectively empty (no text/children)
  const elements = Array.from(all).filter(el => {
    // trim whitespace to avoid blank text nodes
    if (el.textContent.trim()) return true;
    return el.children.length > 0;
  });

  // show or hide the button depending on whether any non-empty fanzone elements are present
  if (toggleBtn) {
    toggleBtn.style.display = elements.length ? '' : 'none';
  }

  elements.forEach(el => {
    el.style.display = hidden ? 'none' : '';
  });
}

function createToggleButton() {
  // make sure the button exists in current document
  let existing = document.getElementById('fz-toggle');
  if (existing) {
    // if the element is present but may be hidden, log its style
    console.log('toggle button already exists', existing, getComputedStyle(existing));
    toggleBtn = existing; // keep reference
    return;
  }

  const btn = document.createElement('button');
  btn.id = 'fz-toggle';

  const span = document.createElement('span');
  span.textContent = hidden ? 'Fanzone' : 'Hide';
  // rotate text 180deg to invert orientation
  span.style.display = 'inline-block';
  span.style.transform = 'rotate(180deg)';
  btn.appendChild(span);

  // reset all inherited styles to avoid page CSS interference
  btn.style.all = 'unset';
  btn.style.position = 'fixed';
  btn.style.top = '50%';
  btn.style.right = '0';
  // we'll rotate the entire button so text reads bottom-to-right
  btn.style.transform = 'translateY(-50%) rotate(90deg)';
  btn.style.transformOrigin = 'center';
  btn.style.zIndex = 2147483647; // maximum

  // size to fit "Fanzone" only and then lock width
  btn.style.width = 'auto';
  btn.style.height = 'auto';
  btn.style.minWidth = '30px';
  btn.style.minHeight = '30px';
  btn.style.display = 'flex';
  btn.style.alignItems = 'center';
  btn.style.justifyContent = 'center';
  btn.style.fontSize = '16px';
  btn.style.fontWeight = 'bold';
  btn.style.lineHeight = '1';
  btn.style.padding = '5px 10px';
  btn.style.background = '#ff5722';
  btn.style.color = '#fff';
  btn.style.border = '2px solid #000';
  btn.style.borderRadius = '4px 0 0 4px';
  btn.style.cursor = 'pointer';

  // reset writing mode in case
  btn.style.writingMode = '';
  btn.style.textOrientation = '';

  toggleBtn = btn; // cache reference for visibility updates

  // subtle hover effect
  btn.addEventListener('mouseenter', () => {
    btn.style.background = '#e64a19';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background = '#ff5722';
  });

  let draggingMoved = false;
  // after creating button we can calculate proper fixed width based on Fanzone
  document.body.appendChild(btn);
  const fixed = btn.offsetWidth;
  btn.style.width = fixed + 'px';
  console.log('toggle button created', btn);

  btn.addEventListener('click', () => {
    if (draggingMoved) {
      // reset flag and do not toggle when the button was dragged
      draggingMoved = false;
      return;
    }
    hidden = !hidden;
    span.textContent = hidden ? 'Fanzone' : 'Hide';
    updateVisibility();
  });
  document.body.appendChild(btn);
  console.log('toggle button created', btn);

  // make button draggable vertically
  let isDragging = false;
  let startY = 0;
  let startTop = 0;

  btn.addEventListener('mousedown', e => {
    isDragging = true;
    startY = e.clientY;
    // compute current top in px
    const rect = btn.getBoundingClientRect();
    startTop = rect.top;
    // prevent text selection
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dy = e.clientY - startY;
    if (Math.abs(dy) > 3) {
      draggingMoved = true;
    }
    let newTop = startTop + dy;
    // constrain within viewport
    const maxTop = window.innerHeight - btn.offsetHeight;
    if (newTop < 0) newTop = 0;
    if (newTop > maxTop) newTop = maxTop;
    btn.style.top = newTop + 'px';
    btn.style.transform = 'translateY(0) rotate(90deg)'; // reset during drag
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      // restore transform for rotation
      btn.style.transform = 'translateY(-50%) rotate(90deg)';
      // note: do not clear draggingMoved here, let click handler handle it
    }
  });
}

function init() {
  createToggleButton();
  updateVisibility();

  // Watch for dynamic changes and reapply visibility
  const observer = new MutationObserver(() => {
    // ensure the toggle button hasn't been removed by the page
    createToggleButton();
    updateVisibility();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
