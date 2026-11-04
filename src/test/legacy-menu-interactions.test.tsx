import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LegacyPage } from '@/components/legacy-page';
import type { LegacyPageData } from '@/lib/legacy-pages';

vi.mock('@/components/document-gallery', () => ({ DocumentGallery: () => null }));
const data: LegacyPageData = { title: 'Primary One', description: '', template: 'test', styles: 'styles', items: [], mode: 'static', missingData: null, links: [] };
const fragments = { styles: '', test: `<div><div class="btn-group"><button data-toggle="dropdown">Lesson notes</button><ul class="dropdown-menu"><li><a href="/PrimaryOneReadingLessonNotes.html">Reading notes</a></li></ul></div><div class="btn-group"><button data-toggle="dropdown">Schemes of work</button><ul class="dropdown-menu"><li><a href="/PrimaryOneMTCSchemesofWork.html">MTC schemes</a></li></ul></div><a class="africaVotesChat" href="#">Chat</a><div id="africavotes-chat"><a class="close-chat" href="#">Close</a><textarea id="chat-input"></textarea></div><p>Outside menus</p></div>` };
afterEach(cleanup);
function setup() { render(<LegacyPage data={data} fragments={fragments} />); return { notes: screen.getByRole('button', { name: 'Lesson notes' }), schemes: screen.getByRole('button', { name: 'Schemes of work' }) }; }
describe('Class resource menu interaction rules', () => {
  it('opens with one click and closes with the next', () => {
    const { notes } = setup(); fireEvent.click(notes);
    expect(notes).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById(notes.getAttribute('aria-controls') ?? '')).not.toHaveAttribute('hidden');
    fireEvent.click(notes); expect(notes).toHaveAttribute('aria-expanded', 'false');
  });
  it('closes lesson notes when schemes of work opens', () => {
    const { notes, schemes } = setup(); fireEvent.click(notes); fireEvent.click(schemes);
    expect(notes).toHaveAttribute('aria-expanded', 'false'); expect(schemes).toHaveAttribute('aria-expanded', 'true');
  });
  it('dismisses on outside pointer interaction', () => {
    const { notes } = setup(); fireEvent.click(notes); fireEvent.pointerDown(screen.getByText('Outside menus'));
    expect(notes).toHaveAttribute('aria-expanded', 'false');
  });
  it('dismisses on focus leaving the menu', () => {
    const { notes } = setup(); fireEvent.click(notes); act(() => screen.getByRole('button', { name: 'Show Chat' }).focus());
    expect(notes).toHaveAttribute('aria-expanded', 'false');
  });
  it('dismisses on Escape and restores focus to the trigger', () => {
    const { notes } = setup(); fireEvent.click(notes); fireEvent.keyDown(document, { key: 'Escape' });
    expect(notes).toHaveAttribute('aria-expanded', 'false'); expect(notes).toHaveFocus();
  });
  it('dismisses when a resource is selected', () => {
    const { notes } = setup(); fireEvent.click(notes);
    const link = screen.getByRole('menuitem', { name: 'Reading notes' });
    link.addEventListener('click', event => event.preventDefault()); fireEvent.click(link);
    expect(notes).toHaveAttribute('aria-expanded', 'false');
  });
  it('closes the menu when WhatsApp opens and focuses the message', () => {
    const { notes } = setup(); fireEvent.click(notes); fireEvent.click(screen.getByRole('button', { name: 'Show Chat' }));
    expect(notes).toHaveAttribute('aria-expanded', 'false'); expect(screen.getByRole('dialog')).toHaveClass('legacy-chat-open'); expect(screen.getByRole('textbox', { name: 'Message' })).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' }); expect(screen.getByRole('button', { name: 'Show Chat' })).toHaveFocus();
  });
});