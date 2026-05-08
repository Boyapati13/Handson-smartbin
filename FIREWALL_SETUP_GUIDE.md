# GCP Firewall Rule Setup — Step-by-Step Guide

## 🎯 Objective
Create a firewall rule to allow inbound TCP connections on port 8078 for your remote device.

---

## 📋 Rule Details (Copy These)

| Field | Value |
|-------|-------|
| **Rule Name** | `allow-device-tcp-8078` |
| **Description** | Allow device TCP connections on port 8078 |
| **Direction** | Ingress (Inbound) |
| **Priority** | 1000 (or any number 0-65534) |
| **Action** | Allow |
| **Network** | `default` |
| **Source IP ranges** | `0.0.0.0/0` |
| **Protocols & ports** | TCP 8078 |
| **Target tags** | (leave empty or use `smartbin`) |

---

## 📱 Manual Steps in GCP Console

### **Option 1: Quick Navigation Using Search**

1. Open [Google Cloud Console](https://console.cloud.google.com)
2. Ensure your project is: **`handson-smartbin`**
3. Click the **Search box** at the top (🔍 icon)
4. Type: **`VPC firewall rules`**
5. Press **Enter** or click the result from VPC Network section
6. You should now see the **"Firewall rules"** page listing existing rules

### **Option 2: Via Menu Navigation**

1. Click the **☰ Menu** button (top left)
2. Navigate to: **VPC Network** → **Firewall rules**
3. You should now see the firewall rules list page

---

## 🛠️ Creating the Firewall Rule

Once you're on the **Firewall rules** page:

1. Click the **`+ CREATE FIREWALL RULE`** button (top of page)

2. Fill in the form with these values:

   | Field | Enter |
   |-------|-------|
   | **Name** | `allow-device-tcp-8078` |
   | **Description** | Device TCP Connections |
   | **Direction of traffic** | Ingress |
   | **Priority** | `1000` |
   | **Action on match** | Allow |
   | **Networks** | `default` |
   | **Source IPv4 ranges** | `0.0.0.0/0` |
   | **Protocols and ports** | Select **TCP** → enter `8078` |

3. Scroll to bottom, click **`CREATE`**

4. Wait 30 seconds for the rule to be processed (it will show a checkmark when done)

---

## ✅ Verification Steps

### **In GCP Console:**

1. Go back to Firewall rules list
2. Search for: `allow-device-tcp-8078`
3. Confirm it shows:
   - ✅ Status: **Enabled**
   - ✅ Direction: **Ingress**
   - ✅ Protocols/Ports: **tcp/8078**

### **From Your Computer (PowerShell):**

```powershell
# Test connectivity to your static IP
Test-NetConnection -ComputerName 130.211.208.47 -Port 8078 -WarningAction SilentlyContinue

# Expected output when successful:
# TcpTestSucceeded : True
```

Expected output when firewall is working:
```
ComputerName     : 130.211.208.47
RemoteAddress    : 130.211.208.47
RemotePort       : 8078
InterfaceAlias   : Ethernet
SourceAddress    : [YOUR_LOCAL_IP]
TcpTestSucceeded : True    ← This should be TRUE
```

### **From Device Side:**

After firewall is created and device is configured:
- Device LCD should show: **TCP Connected** or similar status
- Server logs should show:
  ```
  [tcp] Device connected from x.x.x.x:xxxxx
  [tcp] Handshake received (frame 0x00)
  [device-registry] Device registered: HY-CKX1 (IMEI 867105074732545 → HS-001)
  ```

---

## 🚨 Troubleshooting

### **If Test-NetConnection Still Fails After Rule Creation:**

1. **Wait a minute** - GCP can take 60+ seconds to apply firewall rules
2. **Refresh and retry**:
   ```powershell
   Test-NetConnection -ComputerName 130.211.208.47 -Port 8078
   ```
3. **Check rule is actually enabled**:
   - Go to Firewall rules
   - Click on `allow-device-tcp-8078`
   - Confirm toggle is **ON** (blue)

### **If Device Still Won't Connect:**

1. Verify device is configured with:
   - TCP IP: `130.211.208.47`
   - TCP Port: `8078`
2. Restart the device (power off 5 seconds, power on)
3. Check server logs for any errors:
   ```bash
   npm run server  # or check running process
   ```

---

## 📸 Screenshots Reference

### **Where to Find "CREATE FIREWALL RULE" Button**
- It appears at the **top right** of the Firewall rules list page
- Text: **"+ CREATE FIREWALL RULE"** or just **"CREATE"**

### **Form Layout** 
The form is typically a multi-section dialog with:
1. **Basic** section (name, description, direction)
2. **Network & Targets** section (network, source/destination ranges)
3. **Protocols & ports** section (tcp/udp/other)

---

## 📊 Current Status

- ✅ Backend running on 8078
- ✅ Static IP 130.211.208.47 attached
- ⚠️ **Firewall rule NOT YET CREATED** ← Next step
- ⏳ Device configuration (after firewall)
- ⏳ Device power-on and testing

---

## 🎬 Next Actions

1. **RIGHT NOW**: Follow steps above to create firewall rule
2. **AFTER firewall created**:
   ```powershell
   Test-NetConnection -ComputerName 130.211.208.47 -Port 8078
   ```
   - Expect: `TcpTestSucceeded: True`
3. **THEN**: Configure device with 130.211.208.47:8078
4. **FINALLY**: Power cycle device and monitor server logs

---

## 🔗 Helpful Links

- [GCP Console](https://console.cloud.google.com/networking/firewalls?project=handson-smartbin)
- [GCP Firewall Rules Docs](https://cloud.google.com/vpc/docs/firewalls)
- [Test Connectivity Docs](https://docs.microsoft.com/en-us/powershell/module/nettcpip/test-netconnection)

---

**Created**: May 7, 2026  
**Status**: Awaiting manual firewall rule creation
