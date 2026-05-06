import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider, useApp } from '../../context/AppContext';
import { BINS as STATIC_BINS } from '../../data/bins';

function Probe() {
  const { bins, alerts, connected, frames } = useApp();
  return (
    <div>
      <span data-testid="bin-count">{bins.length}</span>
      <span data-testid="alert-count">{alerts.length}</span>
      <span data-testid="connected">{connected ? 'yes' : 'no'}</span>
      <span data-testid="frame-count">{frames.length}</span>
    </div>
  );
}

function wrap(ui) {
  return render(<MemoryRouter><AppProvider>{ui}</AppProvider></MemoryRouter>);
}

describe('AppContext — initial state', () => {
  it('loads static bin data before WS connects', () => {
    wrap(<Probe />);
    expect(screen.getByTestId('bin-count').textContent).toBe(String(STATIC_BINS.length));
  });

  it('starts as disconnected', () => {
    wrap(<Probe />);
    expect(screen.getByTestId('connected').textContent).toBe('no');
  });
});

describe('AppContext — WebSocket messages', () => {
  it('marks connected after WS opens', async () => {
    wrap(<Probe />);
    // MockWebSocket auto-opens on next tick
    await waitFor(() => {
      expect(screen.getByTestId('connected').textContent).toBe('yes');
    });
  });

  it('handles init message and updates bins', async () => {
    wrap(<Probe />);
    const ws = global.MockWebSocket.instances[0];
    await act(async () => {
      ws.receive({
        type: 'init',
        data: { bins: STATIC_BINS.slice(0, 3), alerts: [] },
      });
    });
    expect(screen.getByTestId('bin-count').textContent).toBe('3');
  });

  it('handles bin_update message', async () => {
    wrap(<Probe />);
    const ws = global.MockWebSocket.instances[0];
    await act(async () => {
      ws.receive({ type: 'bin_update', data: { ...STATIC_BINS[0], fill: 99 } });
    });
    // Bin count stays same, but fill updated (probe only shows count)
    expect(screen.getByTestId('bin-count').textContent).toBe(String(STATIC_BINS.length));
  });

  it('handles alert message and increments alert count', async () => {
    wrap(<Probe />);
    const ws = global.MockWebSocket.instances[0];
    await act(async () => {
      ws.receive({ type: 'alert', data: { id: 1, bin: 'HS-001', type: 'OVERFLOW', msg: 'test', sev: 'crit', age: 'now' } });
    });
    await waitFor(() => {
      expect(Number(screen.getByTestId('alert-count').textContent)).toBeGreaterThan(0);
    });
  });

  it('handles frame message', async () => {
    wrap(<Probe />);
    const ws = global.MockWebSocket.instances[0];
    await act(async () => {
      ws.receive({ type: 'frame', data: { id: 1, dir: 'UART→TCP', hex: 'E9 09', decoded: 'test', ts: 'now' } });
    });
    expect(screen.getByTestId('frame-count').textContent).toBe('1');
  });
});

describe('AppContext — useApp guard', () => {
  it('throws when used outside AppProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<MemoryRouter><Probe /></MemoryRouter>)).toThrow();
    spy.mockRestore();
  });
});
