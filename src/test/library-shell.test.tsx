import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LibraryShell } from '@/components/library-shell';

const location = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('@tanstack/react-router', () => ({
  useLocation: ({ select }: { select: (value: typeof location) => string }) => select(location),
}));

afterEach(() => { cleanup(); vi.restoreAllMocks(); location.pathname = '/'; });

describe('Shared class navigation', () => {
  it('closes the previous section on the first click of another section', () => {
    render(<LibraryShell>Page content</LibraryShell>);
    const nursery = screen.getByRole('button', { name: 'Nursery Section' });
    const primary = screen.getByRole('button', { name: 'Primary Section' });
    fireEvent.click(nursery);
    fireEvent.click(primary);
    expect(nursery).toHaveAttribute('aria-expanded', 'false');
    expect(primary).toHaveAttribute('aria-expanded', 'true');
  });

  it('switches nested menus without closing their parent and discards old descendants', () => {
    render(<LibraryShell>Page content</LibraryShell>);
    const nursery = screen.getByRole('button', { name: 'Nursery Section' });
    fireEvent.click(nursery);
    const baby = screen.getByRole('button', { name: 'Baby Class' });
    const middle = screen.getByRole('button', { name: 'Middle Class' });
    fireEvent.click(baby);
    fireEvent.click(screen.getByRole('button', { name: 'Past Papers' }));
    fireEvent.click(middle);
    expect(baby).toHaveAttribute('aria-expanded', 'false');
    expect(middle).toHaveAttribute('aria-expanded', 'true');
    expect(nursery).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(baby);
    expect(screen.getByRole('button', { name: 'Past Papers' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('lets an active branch close and reopen with one click each', () => {
    location.pathname = '/BabyAllLessonNotes.html';
    render(<LibraryShell>Page content</LibraryShell>);
    const nursery = screen.getByRole('button', { name: 'Nursery Section' });
    for (let index = 0; index < 3; index += 1) {
      fireEvent.click(nursery);
      expect(nursery).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(nursery);
      expect(nursery).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('button', { name: 'Baby Class' })).toHaveAttribute('aria-expanded', 'false');
    }
  });

  it('closes the selected branch immediately, including a current-page link', () => {
    location.pathname = '/BabyAllLessonNotes.html';
    render(<LibraryShell>Page content</LibraryShell>);
    fireEvent.click(screen.getByRole('link', { name: 'All Lesson Notes' }));
    expect(screen.getByRole('button', { name: 'Nursery Section' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('collapses and reopens the desktop class menu', () => {
    render(<LibraryShell>Page content</LibraryShell>);
    const toggle = screen.getByRole('button', { name: 'Toggle class menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes the phone menu on Escape and returns focus to its toggle', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(query => ({
      matches: true, media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    }));
    render(<LibraryShell>Page content</LibraryShell>);
    const toggle = screen.getByRole('button', { name: 'Toggle class menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('closes an open phone menu when the page changes', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(query => ({
      matches: true, media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    }));
    const view = render(<LibraryShell>Page one</LibraryShell>);
    const toggle = screen.getByRole('button', { name: 'Toggle class menu' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    location.pathname = '/PrimaryFiveEnglishLessonNotes.html';
    view.rerender(<LibraryShell>Page two</LibraryShell>);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});