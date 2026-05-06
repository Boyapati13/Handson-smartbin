import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi, beforeAll, afterAll } from 'vitest';

// Auto-cleanup after each test
afterEach(() => cleanup());

// Mock Leaflet (uses browser APIs not available in jsdom)
vi.mock('leaflet', () => ({
  default: { Icon: { Default: { prototype: {}, mergeOptions: vi.fn() } } },
  Icon: { Default: { prototype: {}, mergeOptions: vi.fn() } },
}));

vi.mock('react-leaflet', () => ({
  MapContainer:  ({ children }) => children,
  TileLayer:     () => null,
  CircleMarker:  ({ children }) => children,
  Tooltip:       ({ children }) => children,
  useMap:        () => ({ fitBounds: vi.fn() }),
}));

// Mock WebSocket globally
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    MockWebSocket.instances.push(this);
    // Auto-connect on next tick
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      this.onopen?.({ type: 'open' });
    }, 0);
  }
  send(data)  { MockWebSocket.sent.push(JSON.parse(data)); }
  close()     { this.readyState = WebSocket.CLOSED; this.onclose?.({ code: 1000 }); }
  // Test helper: simulate server message
  receive(data) { this.onmessage?.({ data: JSON.stringify(data) }); }
  static instances = [];
  static sent      = [];
  static reset()   { MockWebSocket.instances = []; MockWebSocket.sent = []; }
}
MockWebSocket.CONNECTING = 0;
MockWebSocket.OPEN       = 1;
MockWebSocket.CLOSING    = 2;
MockWebSocket.CLOSED     = 3;

global.WebSocket = MockWebSocket;
global.MockWebSocket = MockWebSocket;

beforeAll(() => {});
afterEach(() => MockWebSocket.reset());
