import { describe, expect, it, vi } from 'vitest';
import { installEarlyTapQueue } from '@/lib/early-tap-queue';

const markReady = (el: Element, onClick: () => void) => {
  (el as unknown as Record<string, unknown>)['__reactProps$test'] = {};
  el.addEventListener('click', onClick);
};

describe('early tap queue', () => {
  it('repeats one tap made before a menu button is ready, exactly once', () => {
    vi.useFakeTimers();
    installEarlyTapQueue();
    document.body.innerHTML = '<button data-toggle="dropdown">LESSON NOTES</button>';
    const button = document.querySelector('button')!;
    button.click();
    button.click();
    const opened = vi.fn();
    markReady(button, opened);
    vi.advanceTimersByTime(200);
    expect(opened).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('only repeats the latest tap when switching menus early', () => {
    vi.useFakeTimers();
    installEarlyTapQueue();
    document.body.innerHTML = '<button data-toggle="dropdown">A</button><button data-toggle="dropdown">B</button>';
    const [first, second] = Array.from(document.querySelectorAll('button'));
    first.click();
    second.click();
    const a = vi.fn(); const b = vi.fn();
    markReady(first, a); markReady(second, b);
    vi.advanceTimersByTime(200);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('never intercepts real links', () => {
    installEarlyTapQueue();
    document.body.innerHTML = '<a href="/p6.html">Go</a>';
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    document.querySelector('a')!.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
