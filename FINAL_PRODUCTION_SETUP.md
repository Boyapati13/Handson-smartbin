# 🚀 FINAL PRODUCTION INTEGRATION — Action Plan

## Current Status

✅ **Backend Ready:**
- TCP Server: `0.0.0.0:8078` (listening)
- WebSocket: `ws://localhost:8765` (broadcasting)
- All frame handlers: Implemented (0x00, 0x06-0x09, 0x11, 0xAB)
- Device Registry: IMEI 867105074732545 → HS-001

✅ **Frontend Ready:**
- Dashboard: `http://localhost:5173`
- Live Device page: Shows "WAITING FOR DEVICE" until connection

---

## 🎯 YOUR NEXT STEP: Update Device Configuration

### On the Device Screen (Right Now):

1. **Navigate to:** Basic Information Configuration
2. **Find these fields:**
   ```
   HTTP IP: recycle4g.lxhsoft.com      Port: 18052
   TCP IP:  recycle4g.lxhsoft.com      Port: 8078
   ```

3. **Change TCP IP field to:** `192.168.0.38`
   - This is your PC's LAN IP (shown in server logs)
   - Leave Port as `8078`

4. **Click SAVE** (white button next to TCP IP)

5. **Power Cycle Device:**
   - Turn OFF the device
   - Wait 5 seconds
   - Turn ON the device
   - It will automatically attempt to connect to `192.168.0.38:8078`

---

## 📊 What To Expect (Connection Sequence)

Once the device boots up after the change, your **server logs should show**:

### Frame 1: Connection
```
[tcp] Device connected from 192.168.x.x:12345
```

### Frame 2: Handshake (0x00)
```
[tcp] Handshake detected (code 0x00)
[tcp] IMEI extracted: 867105074732545
[tcp] Device registered: IMEI 867105074732545 → HS-001
[tcp] device_connected broadcast sent
[ws] toast: Real device connected: Valletta City Gate (26042400P101)
```

**Expected hex:** `E9 00 0F 38 36 37 31 30 35 30 37 34 37 33 32 35 34 35 0D 0A`
(That's: `E9 00 0F` + 15-byte IMEI + `0D 0A`)

### Frame 3: Location (0x10)
```
[tcp] Location frame received
[device_location] Valletta City Gate at 35.8997, 14.5147
```

### Frame 4: Status (0x06)
```
[tcp] Status frame: Door=CLOSED, Overflow=NO, Motor=OK
```

### Frame 5: Capacity (0x08)
```
[tcp] Capacity: Bin1=62%, Bin2=..., Bin3=...
```

### Frame 6: Heartbeat (0xAB) — Every 60 seconds
```
[tcp] Heartbeat received
[tcp] ACK sent: E9 AB 00 0D 0A ← SERVER REPLIES AUTOMATICALLY
```

**This heartbeat must be sent back every time, or device will restart connection after 3 misses.**

---

## 🔍 Verification Checklist

Once you save the device config and power it on, **verify these 4 things:**

### ✅ Check 1: Server Logs Show Connection
Run this command in a terminal:
```powershell
npm run server
```

Watch for:
- `[tcp] Device connected from ...` ✅
- `[tcp] Device registered: IMEI 867105074732545 → HS-001` ✅

### ✅ Check 2: Dashboard Shows "Online"
1. Open browser: `http://localhost:5173/device`
2. Look for HS-001 (Valletta City Gate)
3. Status should change from "WAITING FOR DEVICE" → **"ONLINE ✅"**
4. Fill %, Battery %, Temperature should show real values

### ✅ Check 3: Telemetry Console Shows Frames
1. Open browser: `http://localhost:5173/telemetry`
2. Check "Frame Count" — should increase from 0 → 1, 2, 3, ...
3. Each frame should show decoded format (e.g., "Heartbeat · fill=62% · bat=88%")

### ✅ Check 4: Heartbeat ACK Is Sent
In server logs, every 60 seconds you should see:
```
[tcp] Heartbeat received (code 0xAB)
[tcp] ACK sent: E9 AB 00 0D 0A
```

If this **doesn't appear**, device will timeout and restart connection.

---

## 🚨 If Device Doesn't Connect

### Problem: "Device connected from..." doesn't appear in logs

**Troubleshoot:**

1. **Verify TCP IP was saved correctly**
   - On device config screen, re-check: TCP IP should be `192.168.0.38`
   - Click SAVE again if needed

2. **Verify device has power and network**
   - Device should be plugged in
   - Device should have WiFi/Ethernet connection
   - Power cycle device completely (5-10 seconds off)

3. **Verify PC LAN IP is correct**
   - Run: `ipconfig` in PowerShell
   - Look for "IPv4 Address" (e.g., 192.168.0.38)
   - If different, update device config with the correct IP

4. **Check Windows Firewall**
   - Allow inbound on port 8078
   - Windows may block inbound connections

### Problem: "Device connected" appears but no frames

1. Device may be buffering frames — wait 60 seconds for heartbeat
2. Check device's WiFi/Ethernet connection status
3. Restart device (power cycle)

### Problem: ACK not being sent

- Check server logs for any error messages
- Verify backend TCP server is running: `npm run server`
- If connection shows but no ACK: backend may have crashed
- Restart: `npm run server`

---

## 🎉 Success Criteria

You're **fully connected when you see:**

1. ✅ Server log: `[tcp] Device registered: IMEI 867105074732545 → HS-001`
2. ✅ Dashboard: HS-001 shows "Online" (not "Simulated")
3. ✅ Telemetry: Frame count > 0 and increasing
4. ✅ Real sensor data: Fill %, Battery %, Temperature from device
5. ✅ Heartbeat: ACK sent every 60 seconds automatically

---

## 📝 Log Examples

### Success Log (Copy This Pattern)
```
[tcp] Device connected from 192.168.0.42:54321
[tcp] Handshake detected (code 0x00)
[tcp] IMEI extracted: 867105074732545
[tcp] Device registered: IMEI 867105074732545 → HS-001
[ws] Browser client connected (total: 1)
[tcp] Location frame received: 35.8997, 14.5147
[tcp] Status frame: Door=CLOSED, Overflow=NO, Faults=NONE
[tcp] Capacity: Bin1=62%, Bin2=58%, Bin3=71%
[tcp] Heartbeat received
[tcp] ACK sent: E9 AB 00 0D 0A
```

---

## 📞 Next Action

**👉 Update device TCP IP to `192.168.0.38` RIGHT NOW**
- Click SAVE on the device screen
- Power cycle the device
- Watch the server logs for the handshake

**Then report back with:**
1. Server log output showing device connection
2. Screenshot of dashboard showing HS-001 "Online"
3. Any error messages you see

---

## 🔗 Important Files

- **Backend:** `server/tcp-proxy.js` (handles frames & ACK)
- **Device Registry:** `server/device-registry.js` (IMEI → HS-001 mapping)
- **Frame Decoder:** `server/device-bridge.js` (E9xx protocol)
- **Dashboard:** `http://localhost:5173/device` (Live Device Monitor)
- **Telemetry:** `http://localhost:5173/telemetry` (Frame Log)

---

## 🚀 Production Deployment (After Testing)

Once local connection works:

1. **Deploy backend to cloud** (AWS, Heroku, DigitalOcean)
2. **Update device TCP IP** to your cloud server domain
3. **Device runs autonomously** for years — no manual intervention needed

---

**Status:** ✅ Backend Ready, ⏳ Awaiting Device Connection

**Action:** Change device TCP IP to 192.168.0.38 and power cycle NOW.
