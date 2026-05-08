# 🌍 EXTERNAL DEPLOYMENT GUIDE — Remote Device Connection

## Overview

Your backend should run on a **cloud VM with a static public IP**, so the supplier/device can reach it directly over TCP.
You need to:
1. ✅ **Reserve a static public IP** for the VM
2. ✅ **Open TCP 8078** in the cloud firewall and the VM firewall
3. ✅ **Update the device** to the static public IP
4. ✅ **Verify the handshake**

---

## Step 1: Reserve the Static Public IP ⬅️ **START HERE**

Your VM currently has `34.45.11.111` as an **ephemeral** external IP. Reserve it as a **static** address in Google Cloud so it never changes.

### Action:
1. **Open Google Cloud Console**
2. **Go to Compute Engine > VM instances**
3. **Open the `smartbin` VM**
4. **Promote or reserve the external IP** so it becomes static

### Result:
You will have a static public IP for the VM. Use that IP in the device TCP setting.

---

## Step 2: Configure Firewall Access

You need to allow inbound TCP `8078` to the VM.

### Action:

1. **Go to VPC network > Firewall**
2. **Create or edit an ingress rule:**
   ```
   Protocol:      TCP
   External Port: 8078
   Target:        the smartbin VM
   ```

3. **Allow port 8078 on the VM OS firewall** if the image uses one

4. **Verify your backend is running:**
   ```bash
   npm run server
   ```
   - Should show: `[tcp] Device TCP server listening on 0.0.0.0:8078`

### Test reachability:

From anywhere on the internet:

```bash
telnet YOUR_STATIC_PUBLIC_IP 8078
```

✅ If connection hangs → firewall and listener are working  
❌ If "Connection refused" → Check the VM listener or firewall

---

## Step 3: Update Device Configuration

Now tell the device to connect to your **STATIC_PUBLIC_IP**.

### On the Device Screen:

1. **Navigate:** `Basic Information` → `Configuration`

2. **Find these 4 fields:**
   ```
   Field              Current Value            New Value
   ─────────────────  ────────────────────────  ──────────────────────
   HTTP IP            recycle4g.lxhsoft.com    (leave unchanged)
   HTTP Port          18052                    (leave unchanged)
   TCP IP             recycle4g.lxhsoft.com    YOUR_STATIC_PUBLIC_IP  ← CHANGE
   TCP Port           8078                     8078            (no change)
   ```

3. **For TCP IP field:**
   - **Delete:** `recycle4g.lxhsoft.com`
   - **Type:** `YOUR_STATIC_PUBLIC_IP` (from Step 1)
   - Example: `34.45.11.111`

4. **Click SAVE** (button next to TCP IP field)

5. **Power Cycle Device:**
   ```
   OFF  → wait 5 seconds → ON
   ```

---

## Step 4: Verification Checklist

Once the device reboots, check your **backend terminal** for these frames:

### ✅ Expected Connection Sequence:

**Frame 1 — Handshake (within 30 seconds):**
```
[tcp] Device connected from 203.x.x.x:54321
[frame] Handshake · device=867105074732545
```
(IMEI: 867105074732545)

**Frame 2 — Heartbeat ACK (continuous):**
```
[frame] Heartbeat · keep-alive from device
[tcp] Sent heartbeat ACK: 0xE9 0xAB 0x00 0x0D 0x0A
```

**Frame 3+ — Real Data (every ~60 seconds):**
```
[frame] Battery · voltage=12.4 · current=0.5A · level=87% · temp=28°C
[frame] Capacity · slot1=45% · slot2=72% · slot3=38%
```

### Dashboard Verification:

1. **Open:** `http://localhost:5173`
2. **Go to:** "Telemetry" page
3. **Should show:**
   - ✅ Device name: `HS-001`
   - ✅ Status: `ONLINE` (green)
   - ✅ Battery %, Capacity %, Temperature live updates

---

## 🐛 Troubleshooting

### Device connects then immediately disconnects:
- Check **GCP firewall rule** (device may be getting rejected)
- Verify **backend is running:** `npm run server`
- Check the VM OS firewall isn't blocking port 8078

### Device doesn't connect at all (no handshake frame):
1. **Verify the static IP is correct:**
   - Check the device screen again (TCP IP field)
   - Confirm the Google Cloud external IP is still static
   - Device needs the exact public IP or hostname

2. **Reboot everything in this order:**
   - Backend: `npm run server`
   - VM: restart the service or reboot the instance
   - Device: power cycle

3. **Check reachability again:**
   ```bash
   telnet YOUR_STATIC_PUBLIC_IP 8078
   ```

### Reachability test times out instead of connecting:
- This is usually good — it means the port is open but the device hasn't connected yet
- Wait 2-3 minutes for the device to retry

### Device connects but no data frames:
- Device may be stuck on old connection
- Power cycle device again
- Check device logs in Telemetry page

---

## 🔧 Advanced: DNS Name (Optional)

If you don't want to use a raw IP in the device UI, point a DNS name at the static public IP and use that hostname instead.

---

## 📋 Quick Reference Card

**Print this or bookmark:**

```
📌 MY EXTERNAL SETUP

Public IP:              [____________] (your reserved GCP static IP)
TCP Port:               8078
Device IMEI:            867105074732545 (HS-001)

Cloud Firewall:         PUBLIC_IP:8078 → GCP VM:8078
Device TCP IP Setting:  [YOUR STATIC PUBLIC IP]
Device TCP Port Setting: 8078

Backend Command:        npm run server
Dashboard URL:          http://localhost:5173
Expected Status:        ONLINE (green) in Telemetry
```

---

## Next: Datadog Integration (Optional)

Once device is connected and sending data:

1. **Get Datadog API Key** from your Datadog org
2. **Update backend:**
   ```bash
   export DATADOG_API_KEY=your-key
   export DATADOG_SITE=us5.datadoghq.com
   npm run server
   ```
3. **Backend auto-forwards frames** to Datadog
4. **View dashboard:** https://app.datadoghq.com

---

## Status Commands

**Check what's listening on port 8078:**

```bash
# Windows PowerShell:
netstat -ano | findstr :8078

# Or use lsof (if available):
lsof -i :8078
```

**Check connected devices:**

```bash
curl http://localhost:3001/api/device/status
```

**View device frames in real-time:**

```bash
curl http://localhost:3001/api/frames?limit=50
```

---

## Done! 🎉

Once the device shows **ONLINE** in the dashboard with live data:
- ✅ Your external deployment is complete
- ✅ Device can connect from ANY network
- ✅ Ready for production monitoring
