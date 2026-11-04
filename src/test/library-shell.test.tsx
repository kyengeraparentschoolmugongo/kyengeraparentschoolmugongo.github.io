import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LibraryShell } from '@/components/library-shell';

const location = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('@tanstack/react-router', () => ({
  useLocation: ({ select }: { select: (value: typeof location) => string }) => select(location),
}));

afterEach(() => { cleanup(); vi.restoreAllMocks(); location.pathname = '/'; });

describe('Shared class navigation', () => {
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