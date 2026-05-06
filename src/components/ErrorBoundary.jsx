import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 320, padding: 40, textAlign: 'center',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        }}>
          <AlertTriangle size={24} color="var(--crimson)" />
        </div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
          Something went wrong
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--sub)', marginBottom: 24, maxWidth: 360 }}>
          {this.state.error?.message || 'An unexpected error occurred in this component.'}
        </div>
        <button
          onClick={() => this.setState({ error: null })}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--blue)', color: '#fff',
            fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '0.82rem',
            padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
          }}>
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    );
  }
}

/** Functional wrapper — use this in JSX */
export default function WithErrorBoundary({ children, fallback }) {
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}
