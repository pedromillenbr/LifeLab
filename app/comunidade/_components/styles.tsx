'use client'

// All Community styles in one place. Scoped under `.com-*` to avoid
// leaking into the rest of the app. Reuses the existing LifeLab tokens
// (--green, --color-bg-*, --font-mono, etc.) — NO new color palettes.

export function CommunityStyles() {
  return (
    <style>{`
      .com-root {
        --com-bd: var(--color-border);
        --com-bd-h: rgba(255,255,255,0.18);
        --com-bg-card: rgba(255,255,255,0.04);
        --com-bg-elev: rgba(255,255,255,0.07);
        --com-t1: var(--color-text-main);
        --com-t2: var(--color-text-muted);
        --com-t3: var(--color-text-subtle);
        --com-t-dis: rgba(255,255,255,0.15);
        --green: var(--color-primary);
        --green-glow: var(--color-primary-glow);
        --green-g07: rgba(var(--color-primary-rgb), 0.07);
        --green-g12: rgba(var(--color-primary-rgb), 0.12);
        --green-g20: rgba(var(--color-primary-rgb), 0.20);
        --green-g30: rgba(var(--color-primary-rgb), 0.30);
        --metal-gold: #eab308;
        --metal-silver: #c8c8d0;

        max-width: 880px;
        margin: 0 auto;
        padding: 24px 20px 80px;
        color: var(--com-t1);
        position: relative;
      }
      @media (min-width: 768px) {
        .com-root { padding: 32px 28px 96px; }
      }

      /* ── Loading ─────────────────────────────────────────────── */
      .com-loading {
        display: flex; align-items: center; justify-content: center;
        min-height: 60vh;
      }
      .com-loading-spinner {
        width: 32px; height: 32px;
        border: 2.5px solid var(--green-g30);
        border-top-color: var(--green);
        border-radius: 50%;
        animation: com-spin 0.7s linear infinite;
      }
      @keyframes com-spin { to { transform: rotate(360deg); } }
      .spin { animation: com-spin 0.8s linear infinite; }

      /* ── Header ──────────────────────────────────────────────── */
      .com-page-header { margin-bottom: 20px; }
      .com-eyebrow {
        font-size: 10px; font-weight: 600; letter-spacing: 0.09em;
        text-transform: uppercase; color: var(--com-t3);
        display: flex; align-items: center; gap: 6px; margin-bottom: 6px;
      }
      .com-eyebrow-dot {
        width: 4px; height: 4px; border-radius: 50%;
        background: var(--green);
        box-shadow: 0 0 8px var(--green-glow);
      }
      .com-subtitle {
        font-size: 13px; color: var(--com-t2); margin-top: 4px;
        font-style: italic; font-weight: 300;
      }

      /* ── Onboarding gate (blur background) ───────────────────── */
      .com-blur {
        position: absolute; inset: 0;
        backdrop-filter: blur(6px);
        background: rgba(11,12,16,0.55);
        z-index: 5;
        pointer-events: none;
      }
      .com-onboard-overlay {
        position: fixed; inset: 0; z-index: 50;
        background: rgba(11,12,16,0.85);
        backdrop-filter: blur(12px);
        display: flex; align-items: center; justify-content: center;
        padding: 20px;
        animation: com-fade .25s ease both;
      }
      @keyframes com-fade { from { opacity: 0; } to { opacity: 1; } }
      .com-onboard-card {
        background:
          radial-gradient(120% 80% at 0% 0%, rgba(255,255,255,0.05), transparent 55%),
          linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015));
        border: 1px solid var(--green-g30);
        border-radius: 18px;
        padding: 28px 24px;
        max-width: 420px; width: 100%;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.06),
          0 24px 64px rgba(0,0,0,0.7),
          0 0 32px var(--green-glow);
        animation: com-modal-in .28s cubic-bezier(.22,.68,0,1.2) both;
      }
      @keyframes com-modal-in {
        from { opacity: 0; transform: scale(0.96) translateY(10px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      .com-onboard-eyebrow {
        font-size: 10px; font-weight: 600; letter-spacing: 0.09em;
        text-transform: uppercase; color: var(--com-t3);
        display: flex; align-items: center; gap: 6px; margin-bottom: 10px;
      }
      .com-onboard-title {
        font-family: var(--font-body);
        font-size: 22px; font-weight: 800;
        letter-spacing: -0.5px; line-height: 1.15;
        color: var(--com-t1);
        margin: 0 0 8px;
      }
      .com-onboard-sub {
        font-size: 13px; color: var(--com-t2); line-height: 1.5;
        margin-bottom: 18px;
      }
      .com-onboard-preview {
        display: flex; align-items: center; gap: 14px;
        padding: 14px;
        background: rgba(0,0,0,0.25);
        border: 1px solid var(--com-bd);
        border-radius: 12px;
        margin-bottom: 16px;
      }
      .com-onboard-preview-name {
        font-size: 16px; font-weight: 700; color: var(--com-t1);
        letter-spacing: -0.3px;
      }
      .com-onboard-preview-meta {
        font-size: 11px; color: var(--com-t3);
        font-family: var(--font-mono); margin-top: 2px;
      }
      .com-onboard-input-wrap {
        position: relative; margin-bottom: 8px;
      }
      .com-onboard-input {
        width: 100%; padding: 11px 100px 11px 14px;
        background: rgba(0,0,0,0.30);
        border: 1px solid var(--com-bd);
        border-radius: 10px;
        color: var(--com-t1);
        font-size: 15px; font-family: var(--font-mono);
        outline: none; letter-spacing: -0.01em;
        transition: border-color .15s, box-shadow .15s;
      }
      .com-onboard-input:focus {
        border-color: var(--green-g30);
        box-shadow: 0 0 0 3px var(--green-g07);
      }
      .com-onboard-status {
        position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
        font-size: 11px; font-family: var(--font-mono);
        display: inline-flex; align-items: center; gap: 5px;
        color: var(--com-t3);
      }
      .com-onboard-status-available { color: var(--green); }
      .com-onboard-status-taken     { color: #f87171; }
      .com-onboard-status-invalid   { color: #fbbf24; }
      .com-onboard-status-error     { color: #f87171; }
      .com-onboard-error {
        font-size: 11px; color: #f87171; margin-bottom: 10px;
      }
      .com-onboard-cta {
        width: 100%; margin-top: 14px; padding: 12px;
        background: linear-gradient(180deg, var(--color-primary-light), var(--green));
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 10px;
        color: #000; font-size: 14px; font-weight: 700;
        cursor: pointer; font-family: var(--font-body);
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        transition: all .15s ease;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.30),
          inset 0 -1px 0 rgba(0,0,0,0.15),
          0 0 0 rgba(34,197,94,0);
      }
      .com-onboard-cta:hover:not(:disabled) {
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.35),
          0 0 24px var(--green-glow);
      }
      .com-onboard-cta:disabled {
        background: rgba(255,255,255,0.06);
        color: var(--com-t-dis);
        cursor: not-allowed;
        box-shadow: none;
      }
      .com-onboard-foot {
        font-size: 11px; color: var(--com-t3); text-align: center;
        margin-top: 14px; font-style: italic;
      }

      /* ── Tabs ────────────────────────────────────────────────── */
      .com-tabs {
        display: flex; gap: 4px; padding: 4px;
        background: rgba(0,0,0,0.25);
        border: 1px solid var(--com-bd);
        border-radius: 12px;
        margin-bottom: 18px;
      }
      .com-tab {
        flex: 1; padding: 10px 14px; border-radius: 8px;
        background: transparent; border: none;
        font-size: 12px; font-weight: 600;
        color: var(--com-t3); cursor: pointer;
        font-family: var(--font-body); letter-spacing: 0.02em;
        display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        transition: all .15s ease;
      }
      .com-tab:hover { color: var(--com-t1); }
      .com-tab.active {
        background: var(--green-g12);
        color: var(--green);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.06),
          0 0 14px var(--green-glow);
      }

      .com-subtabs {
        display: inline-flex; gap: 2px;
        background: rgba(0,0,0,0.20);
        border: 1px solid var(--com-bd);
        border-radius: 9px;
        padding: 3px;
        margin-bottom: 16px;
      }
      .com-subtab {
        padding: 6px 14px; border-radius: 7px;
        background: transparent; border: none;
        font-size: 11px; font-weight: 600;
        color: var(--com-t3); cursor: pointer;
        font-family: var(--font-body);
        letter-spacing: 0.04em;
        text-transform: uppercase;
        transition: all .12s;
      }
      .com-subtab:hover { color: var(--com-t1); }
      .com-subtab.active {
        background: var(--green-g12);
        color: var(--green);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
      }
      .com-subtab-secondary { font-weight: 500; opacity: 0.85; }
      .com-subtab-secondary.active { opacity: 1; }

      /* ── Season strip ────────────────────────────────────────── */
      .com-season-strip {
        display: flex; align-items: center; justify-content: space-between;
        padding: 12px 16px; margin-bottom: 14px;
        background:
          radial-gradient(120% 80% at 0% 50%, var(--green-g07), transparent 70%),
          linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.10));
        border: 1px solid var(--green-g30);
        border-radius: 12px;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.05),
          0 0 18px var(--green-glow);
      }
      .com-season-strip-left {
        display: inline-flex; align-items: center; gap: 8px;
        color: var(--green);
        font-size: 11px; font-weight: 600;
        letter-spacing: 0.08em; text-transform: uppercase;
      }
      .com-season-strip-clock {
        font-family: var(--font-mono);
        font-size: 18px; font-weight: 700;
        color: var(--com-t1);
        letter-spacing: -0.02em;
        display: inline-flex; align-items: baseline; gap: 4px;
        text-shadow: 0 0 14px var(--green-glow);
      }
      .com-clock-num {
        background: rgba(0,0,0,0.40);
        border: 1px solid var(--com-bd);
        border-radius: 6px;
        padding: 2px 8px;
        min-width: 32px; text-align: center;
      }
      .com-clock-sep {
        font-size: 10px; color: var(--com-t3);
        margin: 0 2px; text-transform: uppercase;
      }

      /* ── Taunt banner ────────────────────────────────────────── */
      .com-taunt {
        display: flex; align-items: center; gap: 8px;
        padding: 10px 14px; margin-bottom: 14px;
        background: rgba(248,113,113,0.06);
        border: 1px solid rgba(248,113,113,0.22);
        border-radius: 10px;
        font-size: 12px; color: rgba(254,226,226,0.92);
        font-weight: 500;
        animation: com-fade .35s ease both;
      }
      .com-taunt.sev-mid {
        background: rgba(251,191,36,0.06);
        border-color: rgba(251,191,36,0.22);
        color: rgba(254,243,199,0.92);
      }
      .com-taunt.sev-high {
        background: rgba(248,113,113,0.10);
        border-color: rgba(248,113,113,0.32);
        box-shadow: 0 0 16px rgba(248,113,113,0.15);
      }

      /* ── Your card ───────────────────────────────────────────── */
      .com-you-card {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-areas:
          'portrait meta'
          'progress progress';
        gap: 14px;
        padding: 16px;
        background:
          radial-gradient(110% 70% at 0% 0%, rgba(255,255,255,0.05), transparent 55%),
          linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.18));
        border: 1px solid var(--green-g30);
        border-radius: 14px;
        margin-bottom: 16px;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.05),
          inset 0 -1px 0 rgba(0,0,0,0.30),
          0 8px 24px rgba(0,0,0,0.40),
          0 0 24px var(--green-glow);
      }
      @media (min-width: 640px) {
        .com-you-card {
          grid-template-columns: auto 1fr auto;
          grid-template-areas: 'portrait meta progress';
          align-items: center;
          gap: 18px;
        }
      }
      .com-you-portrait { grid-area: portrait; }
      .com-you-meta {
        grid-area: meta;
        display: flex; flex-direction: column; gap: 4px;
        min-width: 0;
      }
      .com-you-name {
        font-size: 15px; font-weight: 700; color: var(--com-t1);
        letter-spacing: -0.3px;
      }
      .com-you-position {
        font-size: 12px; color: var(--com-t3);
        font-family: var(--font-mono);
        display: inline-flex; align-items: center; gap: 4px;
      }
      .com-you-position strong { color: var(--green); font-weight: 700; }
      .com-you-sep { color: var(--com-t-dis); margin: 0 2px; }
      .com-you-xp { color: var(--com-t2); }
      .com-you-progress {
        grid-area: progress;
        min-width: 180px;
      }
      .com-you-progress-label {
        font-size: 10px; font-weight: 600;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: var(--com-t3); margin-bottom: 5px;
      }
      .com-you-progress-label strong { color: var(--green); }
      .com-you-progress-bar {
        height: 5px; border-radius: 3px;
        background: rgba(0,0,0,0.45);
        overflow: hidden;
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.6);
      }
      .com-you-progress-fill {
        height: 100%; border-radius: 3px;
        background: linear-gradient(90deg, var(--green), var(--color-primary-light));
        box-shadow: 0 0 10px var(--green-glow);
        transition: width .55s cubic-bezier(0.4,0,0.2,1);
      }

      /* ── Podium ──────────────────────────────────────────────── */
      .com-podium {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 18px;
      }
      @media (max-width: 540px) {
        .com-podium { grid-template-columns: 1fr; }
      }
      .com-podium-card {
        position: relative;
        display: flex; flex-direction: column; align-items: center; gap: 6px;
        padding: 18px 14px 16px;
        background:
          radial-gradient(110% 70% at 50% 0%, rgba(255,255,255,0.06), transparent 55%),
          linear-gradient(180deg, rgba(255,255,255,0.035), rgba(0,0,0,0.15));
        border: 1px solid var(--com-bd);
        border-radius: 14px;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.05),
          inset 0 -1px 0 rgba(0,0,0,0.30),
          0 8px 24px rgba(0,0,0,0.40);
        overflow: hidden;
      }
      .com-podium-card.is-you {
        border-color: var(--green-g30);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.06),
          0 12px 32px rgba(0,0,0,0.55),
          0 0 28px var(--green-glow);
      }
      .com-podium-card.pos-1 {
        border-color: rgba(250,204,21,0.32);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.07),
          0 12px 32px rgba(0,0,0,0.55),
          0 0 32px rgba(250,204,21,0.30);
      }
      .com-podium-card.pos-1::before {
        content: ''; position: absolute; inset: 0; pointer-events: none;
        background: radial-gradient(120% 80% at 50% 0%, rgba(250,204,21,0.10), transparent 55%);
      }
      .com-podium-card.pos-2 {
        border-color: rgba(200,200,208,0.30);
      }
      .com-podium-card.pos-3 {
        border-color: rgba(184,151,90,0.32);
      }
      .com-podium-card > * { position: relative; z-index: 1; }
      .com-podium-rank {
        font-size: 10px; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: var(--com-t3);
        display: inline-flex; align-items: center; gap: 5px;
        padding: 3px 10px;
        background: rgba(0,0,0,0.40);
        border: 1px solid var(--com-bd);
        border-radius: 9999px;
      }
      .com-podium-card.pos-1 .com-podium-rank { color: #facc15; border-color: rgba(250,204,21,0.30); }
      .com-podium-card.pos-2 .com-podium-rank { color: #c8c8d0; border-color: rgba(200,200,208,0.30); }
      .com-podium-card.pos-3 .com-podium-rank { color: #b8975a; border-color: rgba(184,151,90,0.30); }
      .com-podium-name {
        font-size: 14px; font-weight: 700; color: var(--com-t1);
        letter-spacing: -0.3px; text-align: center;
        max-width: 100%;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .com-podium-xp {
        font-family: var(--font-mono);
        font-size: 16px; font-weight: 700;
        color: var(--green);
        letter-spacing: -0.02em;
        text-shadow: 0 0 14px var(--green-glow);
      }
      .com-podium-card.pos-1 .com-podium-xp { color: #facc15; text-shadow: 0 0 18px rgba(250,204,21,0.50); }
      .com-podium-xp-unit { color: var(--com-t3); font-weight: 400; font-size: 11px; }

      /* ── Rank list ───────────────────────────────────────────── */
      .com-rank-list {
        display: flex; flex-direction: column; gap: 6px;
      }
      .com-rank-row {
        display: grid;
        grid-template-columns: 50px 36px 1fr auto;
        gap: 10px; align-items: center;
        padding: 10px 12px;
        background:
          linear-gradient(180deg, rgba(255,255,255,0.025), rgba(0,0,0,0.10));
        border: 1px solid var(--com-bd);
        border-radius: 10px;
        transition: border-color .15s, transform .15s, box-shadow .15s;
      }
      .com-rank-row:hover {
        border-color: var(--com-bd-h);
        transform: translateX(2px);
      }
      .com-rank-row.is-you {
        border-color: var(--green-g30);
        background:
          linear-gradient(180deg, var(--green-g07), rgba(0,0,0,0.10));
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.06),
          0 0 20px var(--green-glow);
      }
      .com-rank-pos {
        display: flex; align-items: center; gap: 4px;
      }
      .com-rank-pos-num {
        font-family: var(--font-mono);
        font-size: 14px; font-weight: 700;
        color: var(--com-t2);
        letter-spacing: -0.02em;
        min-width: 26px;
      }
      .com-rank-row.is-you .com-rank-pos-num { color: var(--green); }
      .com-rank-movement {
        display: inline-flex; align-items: center;
        color: var(--com-t-dis);
      }
      .com-rank-movement .up   { color: var(--green); }
      .com-rank-movement .down { color: #f87171; }

      .com-rank-name {
        display: flex; flex-direction: column; gap: 4px;
        min-width: 0;
      }
      .com-rank-name-text {
        font-size: 13px; font-weight: 600; color: var(--com-t1);
        letter-spacing: -0.2px;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .com-rank-meta {
        display: flex; flex-direction: column; align-items: flex-end; gap: 3px;
        flex-shrink: 0;
      }
      .com-rank-xp {
        font-family: var(--font-mono);
        font-size: 13px; font-weight: 700;
        color: var(--com-t1);
        letter-spacing: -0.02em;
      }
      .com-rank-xp-unit { color: var(--com-t3); font-weight: 400; font-size: 10px; }
      .com-rank-streak {
        display: inline-flex; align-items: center; gap: 3px;
        font-size: 10px; font-family: var(--font-mono);
        color: #fbbf24;
      }
      .com-rank-streak svg { color: #fb923c; }

      .com-rank-marker {
        margin: 18px 0 6px;
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 10px; font-weight: 700;
        letter-spacing: 0.10em; text-transform: uppercase;
        color: var(--green);
      }
      .com-rank-marker svg { color: var(--green); }

      .com-jump-to-you {
        position: sticky; bottom: 16px;
        margin: 16px auto 0;
        display: flex; align-items: center; gap: 6px;
        padding: 8px 14px;
        background: var(--green-g12);
        border: 1px solid var(--green-g30);
        color: var(--green);
        font-size: 11px; font-weight: 600;
        font-family: var(--font-body);
        letter-spacing: 0.04em; text-transform: uppercase;
        border-radius: 9999px;
        cursor: pointer;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 0 18px var(--green-glow);
      }
      .com-jump-to-you:hover {
        background: var(--green-g20);
      }

      /* ── Skeletons ───────────────────────────────────────────── */
      .com-skel-list { display: flex; flex-direction: column; gap: 6px; }
      .com-skel-row {
        height: 56px; border-radius: 10px;
        background: linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.06), rgba(255,255,255,0.03));
        background-size: 200% 100%;
        animation: com-skel 1.4s ease-in-out infinite;
      }
      @keyframes com-skel {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .com-empty {
        text-align: center; padding: 48px 20px;
        color: var(--com-t2);
      }
      .com-empty svg { color: var(--com-t-dis); margin-bottom: 10px; }
      .com-empty h3 {
        font-size: 16px; font-weight: 700; color: var(--com-t1);
        margin-bottom: 6px;
      }
      .com-empty p { font-size: 13px; color: var(--com-t2); max-width: 360px; margin: 0 auto; }

      /* ── Hall of Elite ───────────────────────────────────────── */
      .com-hall-tabs {
        display: flex; gap: 6px; flex-wrap: wrap;
        margin-bottom: 16px;
      }
      .com-hall-tab {
        padding: 7px 12px; border-radius: 9999px;
        background: rgba(0,0,0,0.25);
        border: 1px solid var(--com-bd);
        color: var(--com-t3);
        font-size: 11px; font-weight: 600;
        font-family: var(--font-body);
        cursor: pointer;
        display: inline-flex; align-items: center; gap: 5px;
        transition: all .12s;
      }
      .com-hall-tab:hover { color: var(--com-t1); border-color: var(--com-bd-h); }
      .com-hall-tab.active {
        background: var(--green-g12);
        border-color: var(--green-g30);
        color: var(--green);
        box-shadow: 0 0 14px var(--green-glow);
      }

      .com-hall-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 14px;
      }
      .com-hall-skel {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 14px;
      }
      .com-hall-skel-card {
        height: 280px; border-radius: 14px;
        background: linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.06), rgba(255,255,255,0.03));
        background-size: 200% 100%;
        animation: com-skel 1.4s ease-in-out infinite;
      }
      .com-hall-empty { grid-column: 1 / -1; }

      /* ── Elite card (collectible) ────────────────────────────── */
      .com-elite-card {
        position: relative;
        border-radius: 14px;
        padding: 1px; /* metallic frame border */
        background: linear-gradient(135deg, var(--metal), color-mix(in srgb, var(--metal) 30%, #0b0c10));
        box-shadow:
          0 12px 36px rgba(0,0,0,0.55),
          0 0 28px var(--metal-glow);
        transition: transform .25s ease, box-shadow .25s ease;
        overflow: hidden;
      }
      .com-elite-card:hover {
        transform: translateY(-3px);
        box-shadow:
          0 16px 44px rgba(0,0,0,0.65),
          0 0 36px var(--metal-glow);
      }
      .com-elite-frame {
        position: absolute; inset: 0; border-radius: 14px;
        pointer-events: none;
        background: linear-gradient(135deg,
          rgba(255,255,255,0.10) 0%,
          transparent 30%,
          transparent 70%,
          rgba(255,255,255,0.08) 100%);
        mix-blend-mode: overlay;
      }
      .com-elite-inner {
        position: relative;
        background:
          radial-gradient(140% 90% at 50% 0%, rgba(255,255,255,0.04), transparent 60%),
          linear-gradient(180deg, #14171c 0%, #0b0c10 100%);
        border-radius: 13px;
        padding: 16px 14px 14px;
        display: flex; flex-direction: column; align-items: center;
        gap: 8px;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.05),
          inset 0 -1px 0 rgba(0,0,0,0.30);
        min-height: 280px;
      }
      .com-elite-card.is-mythic .com-elite-inner::before {
        content: ''; position: absolute; inset: 0;
        border-radius: 13px;
        pointer-events: none;
        background: radial-gradient(80% 60% at 50% 30%, rgba(250,204,21,0.10), transparent 60%);
        animation: com-mythic-pulse 4s ease-in-out infinite;
      }
      @keyframes com-mythic-pulse {
        0%, 100% { opacity: 0.55; }
        50%      { opacity: 1; }
      }
      .com-elite-top {
        display: flex; align-items: center; justify-content: space-between;
        width: 100%;
        font-size: 9px; font-weight: 700;
        letter-spacing: 0.10em; text-transform: uppercase;
      }
      .com-elite-rank {
        display: inline-flex; align-items: center; gap: 4px;
        color: var(--metal);
        background: rgba(0,0,0,0.40);
        border: 1px solid color-mix(in srgb, var(--metal) 30%, transparent);
        border-radius: 9999px; padding: 3px 8px;
      }
      .com-elite-caption {
        color: var(--metal);
        opacity: 0.80;
        font-family: var(--font-mono);
        font-weight: 600;
      }
      .com-elite-portrait {
        position: relative;
        margin-top: 4px;
      }
      .com-elite-aura {
        position: absolute; inset: -8px; pointer-events: none;
        border-radius: 50%;
        background: radial-gradient(circle, var(--metal-glow), transparent 70%);
        animation: com-aura 3s ease-in-out infinite;
      }
      @keyframes com-aura {
        0%, 100% { opacity: 0.55; transform: scale(1); }
        50%      { opacity: 0.95; transform: scale(1.08); }
      }
      .com-elite-name {
        font-size: 15px; font-weight: 800; color: var(--com-t1);
        letter-spacing: -0.3px; text-align: center;
        max-width: 100%;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .com-elite-division {
        font-size: 10px; font-weight: 600;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: var(--metal);
        text-align: center;
      }
      .com-elite-stats {
        display: flex; gap: 16px; width: 100%;
        justify-content: space-around;
        padding: 10px 0;
        border-top: 1px solid rgba(255,255,255,0.06);
        border-bottom: 1px solid rgba(255,255,255,0.06);
        margin-top: 6px;
      }
      .com-elite-stat {
        display: flex; flex-direction: column; align-items: center; gap: 2px;
      }
      .com-elite-stat-label {
        font-size: 9px; color: var(--com-t3);
        letter-spacing: 0.10em; text-transform: uppercase;
      }
      .com-elite-stat-val {
        font-family: var(--font-mono);
        font-size: 14px; font-weight: 700;
        color: var(--com-t1);
        letter-spacing: -0.02em;
        display: inline-flex; align-items: center; gap: 4px;
      }
      .com-elite-stat-val svg { color: #fb923c; }
      .com-elite-tagline {
        font-size: 10px; font-style: italic;
        color: var(--com-t3); text-align: center;
        margin-top: auto;
      }
      .com-elite-card.is-top1 .com-elite-name {
        text-shadow: 0 0 14px var(--metal-glow);
      }

      /* ── Friends placeholder ─────────────────────────────────── */
      .com-friends-empty {
        text-align: center; padding: 40px 20px;
        max-width: 480px; margin: 0 auto;
      }
      .com-friends-icon {
        width: 56px; height: 56px;
        margin: 0 auto 16px;
        display: flex; align-items: center; justify-content: center;
        background: var(--green-g07);
        border: 1px solid var(--green-g30);
        border-radius: 50%;
        color: var(--green);
        box-shadow: 0 0 24px var(--green-glow);
      }
      .com-friends-empty h3 {
        font-size: 18px; font-weight: 700; color: var(--com-t1);
        margin-bottom: 8px; letter-spacing: -0.3px;
      }
      .com-friends-empty p {
        font-size: 13px; color: var(--com-t2); margin-bottom: 18px;
        line-height: 1.5;
      }
      .com-friends-features {
        list-style: none; padding: 0; margin: 0;
        display: flex; flex-direction: column; gap: 8px;
        text-align: left;
      }
      .com-friends-features li {
        display: flex; align-items: center; gap: 8px;
        padding: 10px 14px;
        background: var(--com-bg-card);
        border: 1px solid var(--com-bd);
        border-radius: 9px;
        font-size: 12px; color: var(--com-t2);
      }
      .com-friends-features svg { color: var(--green); flex-shrink: 0; }

      /* ── Season-end modal ────────────────────────────────────── */
      .com-season-overlay {
        position: fixed; inset: 0; z-index: 60;
        background: rgba(11,12,16,0.90);
        backdrop-filter: blur(14px);
        display: flex; align-items: center; justify-content: center;
        padding: 20px;
        animation: com-fade .25s ease both;
      }
      .com-season-card {
        position: relative;
        background:
          radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.05), transparent 55%),
          linear-gradient(180deg, #14171c 0%, #0b0c10 100%);
        border: 1px solid var(--com-bd);
        border-radius: 18px;
        padding: 28px 22px;
        max-width: 420px; width: 100%;
        text-align: center;
        box-shadow: 0 28px 80px rgba(0,0,0,0.80);
        animation: com-modal-in .35s cubic-bezier(.22,.68,0,1.2) both;
      }
      .com-season-card.is-podium {
        border-color: rgba(250,204,21,0.30);
        box-shadow: 0 28px 80px rgba(0,0,0,0.80), 0 0 48px rgba(250,204,21,0.30);
      }
      .com-season-card.is-top10 {
        border-color: var(--green-g30);
        box-shadow: 0 28px 80px rgba(0,0,0,0.80), 0 0 48px var(--green-glow);
      }
      .com-season-close {
        position: absolute; top: 12px; right: 12px;
        width: 26px; height: 26px;
        background: rgba(0,0,0,0.40);
        border: 1px solid var(--com-bd);
        border-radius: 6px;
        color: var(--com-t3);
        cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center;
        transition: all .12s;
      }
      .com-season-close:hover { color: var(--com-t1); border-color: var(--com-bd-h); }
      .com-season-eyebrow {
        font-size: 10px; font-weight: 700;
        letter-spacing: 0.12em; text-transform: uppercase;
        color: var(--com-t3); margin-bottom: 8px;
      }
      .com-season-title {
        font-family: var(--font-body);
        font-size: 28px; font-weight: 800;
        color: var(--com-t1);
        letter-spacing: -1px;
        display: inline-flex; align-items: center; gap: 8px;
        margin-bottom: 18px;
      }
      .com-season-card.is-podium .com-season-title { color: #facc15; text-shadow: 0 0 18px rgba(250,204,21,0.45); }
      .com-season-portrait { margin: 0 auto 10px; display: inline-block; }
      .com-season-name {
        font-size: 18px; font-weight: 700; color: var(--com-t1);
        letter-spacing: -0.4px; margin-bottom: 6px;
      }
      .com-season-stats {
        display: grid; grid-template-columns: 1fr 1fr;
        gap: 10px; margin: 18px 0;
      }
      .com-season-stat {
        padding: 12px;
        background: rgba(0,0,0,0.30);
        border: 1px solid var(--com-bd);
        border-radius: 10px;
      }
      .com-season-stat-label {
        font-size: 10px; color: var(--com-t3);
        letter-spacing: 0.08em; text-transform: uppercase;
        margin-bottom: 4px;
      }
      .com-season-stat-val {
        font-family: var(--font-mono);
        font-size: 22px; font-weight: 700;
        color: var(--com-t1);
        letter-spacing: -0.03em;
      }
      .com-season-msg {
        font-size: 13px; font-style: italic;
        color: var(--com-t2);
        line-height: 1.5; margin-bottom: 18px;
      }
      .com-season-cta {
        width: 100%; padding: 12px;
        background: linear-gradient(180deg, var(--color-primary-light), var(--green));
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 10px;
        color: #000; font-size: 14px; font-weight: 700;
        cursor: pointer; font-family: var(--font-body);
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.30),
          0 0 24px var(--green-glow);
      }
      .com-season-cta:hover {
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.35),
          0 0 32px var(--green-glow);
      }

      /* ── Pane wrapper ────────────────────────────────────────── */
      .com-pane { animation: com-fade .25s ease both; }
    `}</style>
  )
}
