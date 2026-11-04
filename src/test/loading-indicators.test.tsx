import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NavigationLoader } from '@/components/logo-loader';

const routerState = vi.hoisted(() => ({ status: 'idle', location: { href: '/' } }));
vi.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (state: typeof routerState) => unknown }) => select(routerState),
}));

beforeEach(() => { vi.useFakeTimers(); routerState.status = 'idle'; });
afterEach(() => { cleanup(); vi.useRealTimers(); });

it('does not show a page spinner for a navigation that finishes immediately', () => {
  routerState.status = 'pending';
  const view = render(<NavigationLoader />);
  expect(screen.queryByRole('status')).toBeNull();
  routerState.status = 'idle';
  view.rerender(<NavigationLoader />);
  act(() => { vi.advanceTimersByTime(1000); });
  expect(screen.queryByRole('status')).toBeNull();
});

it('shows a spinner only for unfinished navigation and removes it immediately when ready', () => {
  routerState.status = 'pending';
  const view = render(<NavigationLoader />);
  act(() => { vi.advanceTimersByTime(150); });
  expect(screen.queryByRole('status')).not.toBeNull();
  routerState.status = 'idle';
  view.rerender(<NavigationLoader />);
  expect(screen.queryByRole('status')).toBeNull();
});