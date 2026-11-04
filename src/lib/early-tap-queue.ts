/**
 * Static pages appear before their JavaScript is ready. A tap on a menu button during
 * that window used to be lost, so people had to tap several times. This tiny script runs
 * inline in the page head, remembers the latest tap on a not-yet-ready control, and
 * repeats it once that control becomes interactive. Real links are never intercepted.
 */
export function installEarlyTapQueue() {
  var w = window as unknown as { __ftEarlyTap?: boolean };
  if (w.__ftEarlyTap) return;
  w.__ftEarlyTap = true;
  var SELECTOR = '[data-toggle],button,[role="button"],a[href="#"]';
  var pending: { el: Element; index: number; text: string; started: number } | null = null;
  var ready = function (el: Element) {
    for (var key in el) if (key.indexOf('__reactProps$') === 0) return true;
    return false;
  };
  var locate = function (item: { el: Element; index: number; text: string }) {
    if (item.el.isConnected) return item.el;
    var candidate = document.querySelectorAll(SELECTOR)[item.index];
    return candidate && candidate.textContent === item.text ? candidate : null;
  };
  var replay = function () {
    if (!pending) return;
    var target = locate(pending);
    if (target && ready(target)) {
      pending = null;
      // Let the framework finish attaching handlers before repeating the tap.
      setTimeout(function () { (target as HTMLElement).click(); }, 30);
      return;
    }
    if (Date.now() - pending.started > 20000) { pending = null; return; }
    setTimeout(replay, 50);
  };
  document.addEventListener('click', function (event) {
    var origin = event.target as Element | null;
    if (!origin || !origin.closest) return;
    var control = origin.closest(SELECTOR);
    if (!control || ready(control)) return;
    event.preventDefault();
    event.stopPropagation();
    var waiting = pending !== null;
    // Only the latest tap counts, so repeated taps cannot open and then close a menu.
    pending = { el: control, index: Array.prototype.indexOf.call(document.querySelectorAll(SELECTOR), control), text: control.textContent || '', started: Date.now() };
    if (!waiting) replay();
  }, true);
}

export const earlyTapQueueScript = `(${installEarlyTapQueue.toString()})();`;
