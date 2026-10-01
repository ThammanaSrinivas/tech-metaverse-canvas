// Feeds the tile spotlight (.zen-tile::after in index.css): the pointer position inside the tile
// under it, as --mx/--my. One passive listener for the whole page, at most once per frame.
export function mountSpotlight() {
  if (!matchMedia('(hover: hover)').matches) return () => {};
  let frame = 0;
  let last: PointerEvent | null = null;
  const apply = () => {
    frame = 0;
    const tile = (last?.target as Element | null)?.closest?.<HTMLElement>('.zen-tile');
    if (!tile || !last) return;
    const r = tile.getBoundingClientRect();
    tile.style.setProperty('--mx', `${last.clientX - r.left}px`);
    tile.style.setProperty('--my', `${last.clientY - r.top}px`);
  };
  const onMove = (e: PointerEvent) => {
    last = e;
    if (!frame) frame = requestAnimationFrame(apply);
  };
  document.addEventListener('pointermove', onMove, { passive: true });
  return () => {
    document.removeEventListener('pointermove', onMove);
    cancelAnimationFrame(frame);
  };
}
