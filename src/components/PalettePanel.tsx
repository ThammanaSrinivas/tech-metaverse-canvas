import React, { useEffect, useState } from 'react';
import { Check, ClipboardCopy, Link2, Palette as PaletteIcon, RotateCcw, Wand2, X } from 'lucide-react';
import { PALETTES, type Palette } from '@/theme/palettes';
import { applyPalette, resetPalette, shareLink, useBrandTheme } from '@/theme/runtime';
import { contrastReport } from '@/theme/tokens';
import { isHex, luminance, normalizeHex, toHsl } from '@/theme/color';

// Palette lab: try palettes on the real page. Shown on localhost, or on the live site with ?lab
// (for design reviews); loaded as its own chunk so regular visitors never download it.

const ROLES: { key: keyof Omit<Palette, 'name'>; label: string; hint: string }[] = [
  { key: 'light', label: 'Light', hint: 'page background' },
  { key: 'dark', label: 'Dark', hint: 'text + dark sections' },
  { key: 'primary', label: 'Primary', hint: 'buttons, links, accents' },
  { key: 'secondary', label: 'Secondary', hint: 'soft tints, chips' },
  { key: 'highlight', label: 'Highlight', hint: 'rare pop' },
];

/**
 * Paste anything with hex codes in it (a Coolors URL, CSV, a list) and get roles assigned:
 * lightest → light, darkest → dark, then by saturation: most saturated → primary,
 * next → highlight, the rest → secondary.
 */
export function autoAssign(text: string): Omit<Palette, 'name'> | null {
  const hexes = [...new Set((text.match(/#?\b[0-9a-f]{6}\b/gi) ?? []).map(normalizeHex))];
  if (hexes.length < 5) return null;
  const byLum = [...hexes].sort((a, b) => luminance(b) - luminance(a));
  const light = byLum[0];
  const dark = byLum[byLum.length - 1];
  const rest = hexes.filter((h) => h !== light && h !== dark).sort((a, b) => toHsl(b)[1] - toHsl(a)[1]);
  return { light, dark, primary: rest[0], highlight: rest[1], secondary: rest[2] };
}

const PalettePanel: React.FC = () => {
  const theme = useBrandTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Palette>(theme.palette);
  const [paste, setPaste] = useState('');
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  useEffect(() => setDraft(theme.palette), [theme.palette]);

  const set = (p: Palette) => {
    setDraft(p);
    applyPalette(p, true);
  };
  const setRole = (key: keyof Omit<Palette, 'name'>, v: string) => {
    const next = { ...draft, name: 'Custom', [key]: v };
    setDraft(next);
    if (isHex(v)) applyPalette({ ...next, [key]: normalizeHex(v) }, true);
  };
  const onPaste = () => {
    const roles = autoAssign(paste);
    if (roles) set({ name: 'Custom', ...roles });
  };
  const copy = async (what: 'code' | 'link') => {
    const p = theme.palette;
    await navigator.clipboard.writeText(
      what === 'link'
        ? shareLink(p)
        : `{ name: '${p.name}', light: '${p.light}', dark: '${p.dark}', primary: '${p.primary}', secondary: '${p.secondary}', highlight: '${p.highlight}' },`
    );
    setCopied(what);
    setTimeout(() => setCopied(null), 1500);
  };

  const report = contrastReport(theme);
  const adjusted = theme.light.primary !== theme.palette.primary;

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-40 flex h-12 items-center gap-2 rounded-full border bg-card px-4 font-mono text-xs uppercase tracking-[0.1em] shadow-lg"
      >
        <PaletteIcon className="h-4 w-4 text-primary" /> palette · {theme.palette.name}
      </button>
    );

  return (
    <div className="fixed bottom-5 left-5 z-50 max-h-[80vh] w-[340px] overflow-y-auto rounded-[22px] border bg-popover p-4 text-sm shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <p className="zen-label text-muted-foreground">Palette lab · preview only</p>
        <button onClick={() => setOpen(false)} aria-label="Close palette panel" className="rounded-md p-1 hover:bg-secondary">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {PALETTES.map((p) => (
          <button
            key={p.name}
            onClick={() => set(p)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
              theme.palette.name === p.name ? 'border-primary text-primary' : 'hover:border-primary/50'
            }`}
          >
            <span className="flex">
              {[p.dark, p.primary, p.secondary, p.highlight].map((c) => (
                <span key={c} className="-ml-1 h-3 w-3 rounded-full border border-background first:ml-0" style={{ background: c }} />
              ))}
            </span>
            {p.name}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {ROLES.map(({ key, label, hint }) => (
          <label key={key} className="flex items-center gap-3">
            <input
              type="color"
              value={isHex(draft[key]) ? normalizeHex(draft[key]) : '#000000'}
              onChange={(e) => setRole(key, e.target.value.toUpperCase())}
              className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border bg-transparent"
            />
            <span className="w-24 shrink-0">
              <span className="block font-medium">{label}</span>
              <span className="block text-xs text-muted-foreground">{hint}</span>
            </span>
            <input
              value={draft[key]}
              onChange={(e) => setRole(key, e.target.value)}
              spellCheck={false}
              className={`w-full rounded-lg border bg-card px-2 py-1.5 font-mono text-xs uppercase ${isHex(draft[key]) ? '' : 'border-destructive'}`}
            />
          </label>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">Changes only affect your browser. Share link sends this exact palette.</p>

      <div className="mt-4 flex gap-2">
        <input
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          placeholder="paste 5 hex codes or a coolors link"
          className="w-full rounded-lg border bg-card px-2 py-1.5 font-mono text-xs"
        />
        <button onClick={onPaste} title="Auto-assign roles" className="flex shrink-0 items-center gap-1 rounded-lg border px-2 hover:border-primary">
          <Wand2 className="h-3.5 w-3.5" /> use
        </button>
      </div>

      <div className="mt-4 rounded-xl bg-secondary/60 p-3">
        <p className="zen-label mb-2 text-muted-foreground">Contrast (AA = 4.5)</p>
        {report.map((r) => (
          <p key={r.label} className="flex justify-between font-mono text-xs">
            <span>{r.label}</span>
            <span className={r.ratio >= 4.5 ? 'text-primary' : 'text-destructive'}>
              {r.ratio.toFixed(2)} {r.ratio >= 4.5 ? '✓' : '✗'}
            </span>
          </p>
        ))}
        {adjusted && (
          <p className="mt-2 text-xs text-muted-foreground">
            Primary text auto-shaded to <span className="font-mono">{theme.light.primary}</span> on light (raw colour kept for fills).
          </p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={() => copy('link')} title="Link that opens this exact palette" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-3 py-2 font-semibold text-primary-foreground">
          {copied === 'link' ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />} {copied === 'link' ? 'Copied' : 'Share link'}
        </button>
        <button onClick={() => copy('code')} title="Copy as a palettes.ts entry" className="flex items-center gap-1 rounded-full border px-3 py-2 hover:border-primary">
          {copied === 'code' ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
        </button>
        <button onClick={resetPalette} title="Back to ACTIVE_PALETTE" className="flex items-center gap-1 rounded-full border px-3 py-2 hover:border-primary">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PalettePanel;
