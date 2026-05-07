/**
 * HandsOn SmartBin — Local DNS Spoof Server
 *
 * Makes recycle4g.lxhsoft.com resolve to YOUR machine's LAN IP.
 * The device never changes — its DNS query is answered by us.
 *
 * HOW IT WORKS:
 *  Device → "What's the IP of recycle4g.lxhsoft.com?"
 *  This server → "It's 192.168.1.4 (your laptop)"
 *  Device → connects to 192.168.1.4:8078
 *  Our TCP proxy → receives real E9xx frames, optional forward to real cloud
 *
 * SETUP (one-time, no device changes needed):
 *  Option A — Router DNS (recommended, whole network):
 *    Log into router admin → DNS settings → Primary DNS = 192.168.1.4
 *    All devices on the network use our DNS automatically.
 *
 *  Option B — Device-specific (if router has static DNS entries):
 *    Router admin → DHCP → Add static entry: recycle4g.lxhsoft.com = 192.168.1.4
 *
 * Run:  node server/dns-spoof.js
 *   or  npm run dns
 */

import Dns2 from 'dns2';
import os   from 'os';

const SPOOF_DOMAIN  = 'recycle4g.lxhsoft.com';
const UPSTREAM_DNS  = process.env.UPSTREAM_DNS  || '8.8.8.8';   // real DNS fallback
const LISTEN_IP     = '0.0.0.0';
const DNS_PORT      = parseInt(process.env.DNS_PORT) || 53;

// Detect our own LAN IP
function getLanIP() {
  const ifaces = Object.values(os.networkInterfaces()).flat();
  const iface  = ifaces.find(i => i.family === 'IPv4' && !i.internal);
  return iface?.address || '127.0.0.1';
}

const OUR_IP = process.env.SPOOF_IP || getLanIP();

// ── DNS Server ────────────────────────────────────────────────────────────────
const server = Dns2.createServer({
  udp: true,
  handle: async (request, send) => {
    const response  = Dns2.Packet.createResponseFromRequest(request);
    const questions = request.questions;

    for (const question of questions) {
      const name    = question.name.replace(/\.$/, '');   // strip trailing dot
      const spoofed = name === SPOOF_DOMAIN || name.endsWith(`.${SPOOF_DOMAIN}`);

      if (spoofed) {
        // Return our LAN IP for the target domain
        response.answers.push({
          name:    question.name,
          type:    Dns2.Packet.TYPE.A,
          class:   Dns2.Packet.CLASS.IN,
          ttl:     10,          // short TTL so device re-queries often
          address: OUR_IP,
        });
        console.log(`[dns] SPOOF  ${name} → ${OUR_IP}`);
      } else {
        // Forward everything else to real DNS
        try {
          const upstream = await Dns2.resolve(question.name, question.type, {
            nameServer: { address: UPSTREAM_DNS, port: 53 },
          });
          response.answers.push(...(upstream.answers || []));
        } catch {
          // DNS lookup failed — return empty answer
        }
      }
    }

    send(response);
  },
});

server.on('request', (request, response, rinfo) => {
  // Already handled above
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[dns] Port ${DNS_PORT} already in use.`);
    console.error('     On Windows, disable the DNS Client service or use port 5353:');
    console.error('     DNS_PORT=5353 node server/dns-spoof.js');
    console.error('     Then set the router primary DNS to your LAN IP.');
  } else {
    console.error('[dns] Error:', err.message);
  }
});

server.listen({ udp: { port: DNS_PORT, address: LISTEN_IP } });

console.log('');
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║         HandsOn SmartBin — DNS Intercept Server               ║');
console.log('╠════════════════════════════════════════════════════════════════╣');
console.log(`║  Listening on       : ${LISTEN_IP}:${DNS_PORT} (UDP)`.padEnd(67) + '║');
console.log(`║  Spoofing           : ${SPOOF_DOMAIN}`.padEnd(67) + '║');
console.log(`║                   → : ${OUR_IP}  (this machine)`.padEnd(67) + '║');
console.log(`║  Real DNS fallback  : ${UPSTREAM_DNS}`.padEnd(67) + '║');
console.log('╠════════════════════════════════════════════════════════════════╣');
console.log('║  ROUTER SETUP (one-time, no device changes needed):           ║');
console.log(`║    1. Log into your router admin panel                         ║`);
console.log(`║    2. Go to: LAN Settings → DHCP → DNS                        ║`);
console.log(`║    3. Set Primary DNS = ${OUR_IP}`.padEnd(67) + '║');
console.log(`║    4. Save & restart router                                    ║`);
console.log(`║    5. Device reconnects → DNS query → our server answers       ║`);
console.log(`║    6. Device connects to ${OUR_IP}:8078 automatically           ║`);
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');
