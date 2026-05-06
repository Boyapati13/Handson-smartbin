import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../../components/StatusBadge';
import FillBar     from '../../components/FillBar';
import ArcGauge   from '../../components/ArcGauge';

// ── StatusBadge ──────────────────────────────────────────────────────────────
describe('StatusBadge', () => {
  it.each([
    ['online',  'Online'],
    ['full',    'Full'],
    ['warning', 'Warning'],
    ['fault',   'Fault'],
    ['offline', 'Offline'],
  ])('renders "%s" label for status %s', (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('renders "Unknown" for unrecognised status', () => {
    render(<StatusBadge status="banana" />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('applies pulsing animation for warning status', () => {
    const { container } = render(<StatusBadge status="warning" />);
    const dot = container.querySelector('span > span');
    expect(dot.style.animation).toContain('breathe');
  });

  it('has no animation for online status dot', () => {
    const { container } = render(<StatusBadge status="online" />);
    const dot = container.querySelector('span > span');
    expect(dot.style.animation).toBe('none');
  });
});

// ── FillBar ──────────────────────────────────────────────────────────────────
describe('FillBar', () => {
  it('renders the fill bar element', () => {
    const { container } = render(<FillBar pct={50} />);
    // inner fill div
    const bars = container.querySelectorAll('div > div');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('sets fill bar width to percentage', () => {
    const { container } = render(<FillBar pct={75} />);
    // Find the fill div — the one whose inline style explicitly carries a % width
    const allDivs = [...container.querySelectorAll('div')];
    // Outer wrapper is 100%; the fill bar is the inner div with a non-100% % width
    const fillDiv = allDivs.find(d => d.style.width && d.style.width.endsWith('%') && d.style.width !== '100%');
    expect(fillDiv?.style.width).toBe('75%');
  });

  it('shows label when showLabel=true', () => {
    render(<FillBar pct={62} showLabel />);
    expect(screen.getByText('62%')).toBeInTheDocument();
  });

  it('hides label when showLabel=false (default)', () => {
    render(<FillBar pct={62} />);
    expect(screen.queryByText('62%')).not.toBeInTheDocument();
  });
});

// ── ArcGauge ─────────────────────────────────────────────────────────────────
describe('ArcGauge', () => {
  it('renders an SVG element', () => {
    const { container } = render(<ArcGauge pct={55} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('displays the percentage text', () => {
    render(<ArcGauge pct={88} />);
    expect(screen.getByText('88%')).toBeInTheDocument();
  });

  it('has accessible role and label', () => {
    const { container } = render(<ArcGauge pct={42} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', 'Fill level: 42%');
  });

  it('renders correct viewBox', () => {
    const { container } = render(<ArcGauge pct={10} size={64} />);
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 80 80');
  });
});
