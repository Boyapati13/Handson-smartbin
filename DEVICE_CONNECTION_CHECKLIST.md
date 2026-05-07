# 🎯 Device Connection Checklist - Final Integration

## Status: BACKEND READY ✅

Your backend is **fully programmed** with all required automated logic. Now update the device to complete the connection.

---

## STEP 1: Update Device Configuration
**Time Required:** 2-3 minutes

1. On the **Basic Information Configuration screen**, locate:
   - **TCP IP:** currently `recycle4g.lxhsoft.com`
   - **Port:** `8078`

2. **Change TCP IP to:** `192.168.0.38`
   - This is your PC's LAN IP
   - Leave Port as `8078`

3. **Click SAVE** (the white button next to TCP IP field)

4. **Power Cycle Device:**
   - Turn off the device completely
   - Wait 5 seconds
   - Turn back on
   - Device will boot and attempt connection to your PC

---

## STEP 2: Monitor Server Logs (Expected Connection Flow)

Open a terminal and check `npm run server` output. You should see:

```
[tcp] Device connected from 192.168.x.x:xxxxx
[tcp] Handshake detected (code 0x00)
[tcp] Device registered: IMEI 867105074732545 → HS-001
[ws] device_connected broadcast sent
```

Then **every 60 seconds**:
```
[tcp] Heartbeat received (code 0xAB)
[tcp] ACK sent: E9 AB 00 0D 0A
```

---

## STEP 3: Automated Backend Checklist

### ✅ [REQUIRED] Heartbeat Acknowledgment
**Status:** `sendAck(socket, 0xAB)` implemented at line 234  
**What it does:** Server replies with `0xE9 0xAB 0x00 0x0D 0x0A` to every heartbeat  
**If missing 3x:** Device auto-reboots connection  
**Status:** ✅ **ACTIVE**

### ✅ [REQUIRED] Status Monitoring (Code 0x06)
**Status:** `decodeStatusByte()` implemented at lines 74-82  
**Parses:** Door state, Overflow flag, Missing bin, Motor fault, Sensor fault  
**Updates:** bin.bucketStatus, bin.status  
**Status:** ✅ **ACTIVE**

### ✅ [REQUIRED] Capacity Update (Code 0x08)
**Status:** Handler at lines 337-356  
**Parses:** 3-byte capacity (Bin1, Bin2, Bin3)  
**Updates:** bin.fill, bin.capacitySlots  
**Status:** ✅ **ACTIVE**

### ✅ [REQUIRED] Usage Counts (Code 0x09)
**Status:** Handler at lines 358-368  
**Parses:** 6 bytes (3x open counts, 3x compression counts)  
**Updates:** bin.openCounts, bin.compactionCounts  
**Status:** ✅ **ACTIVE**

### ✅ [REQUIRED] Alarm Handling (Code 0x11)
**Status:** Handler at lines 280-312  
**Parses:** Jam/Smoke detection from payload[0] and payload[1]  
**Action:** Sends ACK `0xE9 0x11 0x00 0x0D 0x0A`  
**Triggers:** Critical alert + toast notification + fire_alert broadcast  
**Status:** ✅ **ACTIVE**

### ✅ [REQUIRED] Location Data (Code 0x10)
**Status:** Handler at lines 252-276  
**Parses:** Latitude, Longitude from comma-separated string  
**Updates:** bin.lat, bin.lng, bin.lastLocation  
**Status:** ✅ **ACTIVE**

### ✅ [REQUIRED] Device Identification (Code 0x00)
**Status:** `extractDeviceId()` implemented at lines 52-63  
**Parses:** 15-digit IMEI from handshake  
**Maps:** IMEI 867105074732545 → Card 26042400P101 → Bin HS-001  
**Status:** ✅ **ACTIVE**

---

## STEP 4: Verification Signals

### Expected Frame Sequence After Power-Up

| Frame | Code | Format | Status |
|-------|------|--------|--------|
| **Handshake** | `0x00` | `E9 00 0F [IMEI-15bytes] 0D 0A` | 🟢 Identifies device |
| **Location** | `0x10` | `E9 10 XX [lat,lng] 0D 0A` | 🟢 GPS coordinates |
| **Status** | `0x06` | `E9 06 03 [3-bytes] 0D 0A` | 🟢 Door/overflow/faults |
| **Heartbeat** | `0xAB` | `E9 AB 00 0D 0A` | 🟢 Every 60 sec |
| **Capacity** | `0x08` | `E9 08 03 [Cap1] [Cap2] [Cap3] 0D 0A` | 🟢 Fill % |
| **Usage** | `0x09` | `E9 09 06 [6-bytes] 0D 0A` | 🟢 Compression counts |
| **Alert** | `0x11` | `E9 11 02 [Jam/Smoke] XX 0D 0A` | 🔴 Emergency only |

---

## STEP 5: Dashboard Verification

Once connected, check:

1. **Live Device Page** (`/device`)
   - Status changes from "WAITING FOR DEVICE" → "ONLINE ✅"
   - "0 FRAMES" → shows frame count increasing
   - Fill, Battery, Temperature, Signal display real values

2. **Fleet Page** (`/fleet`)
   - HS-001 shows "Online" badge (not "Simulated")
   - Fill %, Battery %, Cycles all update in real-time

3. **Telemetry Console** (`/telemetry`)
   - Frame log shows incoming hex strings
   - Each frame decoded to human-readable format

---

## STEP 6: Production Deployment (Next Phase)

Once local testing confirms connection, deploy to cloud:

1. **Choose provider:** AWS Lightsail, Heroku, DigitalOcean, etc.
2. **Deploy backend** to cloud server
3. **Update device TCP IP** to cloud domain (e.g., `smartbin.example.com`)
4. **Device runs autonomously** for years — only sends data when needed

---

## Troubleshooting

### Device Not Connecting?
- ✅ Check device TCP IP field: Should be `192.168.0.38:8078`
- ✅ Verify PC LAN IP: Open PowerShell → `ipconfig` → look for IPv4 address
- ✅ Restart device (power cycle)
- ✅ Check firewall: Allow port 8078 inbound

### Frames Not Received?
- ✅ Check server logs: `[tcp] Device connected from ...`
- ✅ Verify backend running: `npm run server` should show port 8078 listening
- ✅ Check frame buffer: Server may be buffering incomplete frames

### ACK Not Sent Back?
- ✅ Device should receive: `E9 AB 00 0D 0A` every 60 seconds
- ✅ If missing 3x: Device will auto-reboot connection
- ✅ Check device logs for "Connection timeout"

---

## Success Criteria

You're successfully connected when:

1. ✅ Server shows `[tcp] Device connected from...`
2. ✅ Dashboard shows "ONLINE" for HS-001
3. ✅ Telemetry console shows frame count > 0
4. ✅ Real sensor data (fill %, battery, temp) displayed
5. ✅ Data updates every 60 seconds automatically

---

## Next Action

**👉 Update the device's TCP IP to `192.168.0.38`, click SAVE, and power cycle.**

Then **run `npm run server`** and watch the logs for the connection sequence above.

**Once confirmed, report back with:**
- Server log showing "Device connected"
- Dashboard screenshot with HS-001 showing "Online"
