#!/usr/bin/env node
/**
 * HANDSHAKE MONITOR — Watch for incoming device connection
 * 
 * Usage: node monitor-handshake.js
 * 
 * This script monitors the server logs in real-time and alerts when:
 * 1. Device connects to TCP port 8078
 * 2. Handshake packet (0x00) arrives with IMEI
 * 3. Heartbeat ACK (0xAB) is sent back
 * 4. Status updates (0x06, 0x08, 0x09) are received
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
};

function log(color, ...args) {
  console.log(`${color}${args.join(' ')}${COLORS.RESET}`);
}

const expectedFrames = {
  '0x00': { name: 'HANDSHAKE', desc: 'Device identification (IMEI)', required: true },
  '0x10': { name: 'LOCATION', desc: 'GPS coordinates', required: false },
  '0x06': { name: 'STATUS', desc: 'Door state, overflow, faults', required: false },
  '0x07': { name: 'BATTERY', desc: 'Voltage, current, charge, temp', required: false },
  '0x08': { name: 'CAPACITY', desc: 'Fill levels (Bins 1-3)', required: false },
  '0x09': { name: 'USAGE', desc: 'Open/compression counts', required: false },
  '0x11': { name: 'ALERT', desc: 'Smoke or jam detection', required: false },
  '0xAB': { name: 'HEARTBEAT', desc: 'Keep-alive every 60 sec', required: false },
};

let receivedFrames = new Set();
let deviceConnected = false;
let imeiFound = null;

log(COLORS.CYAN, `
╔════════════════════════════════════════════════════════════╗
║     🛰️  DEVICE HANDSHAKE MONITOR                          ║
║     Watching for E9xx frames from HY-CKX1...             ║
╚════════════════════════════════════════════════════════════╝
`);

log(COLORS.YELLOW, '⏳ Waiting for device connection on port 8078...');
log(COLORS.YELLOW, '   Once device TCP IP is set to 192.168.0.38 and powered on,');
log(COLORS.YELLOW, '   you should see connection logs below.\n');

// Start the server and monitor output
const server = spawn('npm', ['run', 'server'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  env: { ...process.env, SIMULATION: 'false' },
});

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output); // Print raw output

  // Detect device connection
  if (output.includes('[tcp] Device connected from')) {
    deviceConnected = true;
    log(COLORS.GREEN, '\n✅ DEVICE CONNECTED!');
  }

  // Detect handshake with IMEI
  if (output.includes('[tcp] Device registered') || output.includes('IMEI')) {
    const imeiMatch = output.match(/IMEI\s+(\d{15})/);
    if (imeiMatch) {
      imeiFound = imeiMatch[1];
      log(COLORS.GREEN, `✅ HANDSHAKE COMPLETE: IMEI ${imeiFound} identified`);
      receivedFrames.add('0x00');
    }
  }

  // Detect frame codes
  Object.keys(expectedFrames).forEach((code) => {
    const codePattern = code.replace('0x', 'E9 ');
    if (output.includes(codePattern) && !receivedFrames.has(code)) {
      receivedFrames.add(code);
      const frame = expectedFrames[code];
      const icon = frame.required ? '🔴' : '🟡';
      log(COLORS.BLUE, `${icon} Frame ${code} (${frame.name}): ${frame.desc}`);
    }
  });

  // Detect ACK being sent
  if (output.includes('ACK sent') || output.includes('E9 AB 00')) {
    log(COLORS.GREEN, '✅ HEARTBEAT ACK SENT (0xE9 0xAB 0x00 0x0D 0x0A)');
  }

  // Detect alert
  if (output.includes('0x11') || output.includes('SMOKE') || output.includes('JAM')) {
    log(COLORS.RED, '🚨 ALERT DETECTED (Smoke/Jam) — ACK sent to device');
  }
});

server.stderr.on('data', (data) => {
  console.error(data.toString());
});

server.on('close', (code) => {
  log(COLORS.RED, `\nServer exited with code ${code}`);
  process.exit(code);
});

// Print summary every 30 seconds
setInterval(() => {
  if (deviceConnected && receivedFrames.size > 0) {
    log(COLORS.CYAN, '\n═══════════════════════════════════════════════════════════');
    log(COLORS.CYAN, '📊 CONNECTION STATUS');
    log(COLORS.CYAN, '═══════════════════════════════════════════════════════════');
    log(COLORS.GREEN, `✅ Device Connected: YES`);
    if (imeiFound) log(COLORS.GREEN, `✅ IMEI: ${imeiFound}`);
    log(COLORS.CYAN, `✅ Frames Received (${receivedFrames.size}/${Object.keys(expectedFrames).length}):`);
    
    Object.entries(expectedFrames).forEach(([code, frame]) => {
      const received = receivedFrames.has(code);
      const status = received ? '✅' : '⏳';
      const mark = frame.required ? '[CRITICAL]' : '[OPTIONAL]';
      log(COLORS[received ? 'GREEN' : 'YELLOW'], `   ${status} ${code} ${frame.name.padEnd(12)} ${mark}`);
    });
    
    log(COLORS.CYAN, '═══════════════════════════════════════════════════════════\n');
  }
}, 30000);

// Handle SIGINT
process.on('SIGINT', () => {
  log(COLORS.YELLOW, '\n\n⏹️  Monitor stopped by user');
  if (deviceConnected) {
    log(COLORS.GREEN, '✅ Device was successfully connected!');
    if (receivedFrames.size > 0) {
      log(COLORS.GREEN, `✅ Received ${receivedFrames.size} frame types`);
    }
  }
  process.exit(0);
});
