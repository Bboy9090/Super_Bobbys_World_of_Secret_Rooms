# API Documentation - Diagnostic & Repair Backend

Complete API reference for the Diagnostic and Repair application backend.

## Base URL

```
http://localhost:3001/api/v1
```

Production: `https://your-domain.com/api/v1`

## Authentication

Currently, the API does not require authentication for most endpoints. For production deployment, implement one of:
- JWT tokens
- API keys
- OAuth 2.0

Sensitive endpoints (Trapdoor, Authorization) require passcode authentication.

---

## Repair Tickets API

### List All Tickets

**GET** `/tickets`

Get all repair tickets with optional filtering.

**Query Parameters:**
- `status` (optional) - Filter by status: `pending`, `diagnosed`, `inProgress`, `waitingForParts`, `completed`, `cancelled`
- `customerId` (optional) - Filter by customer ID
- `deviceId` (optional) - Filter by device ID

**Response:**
```json
[
  {
    "id": "uuid-string",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1234567890",
    "deviceId": "DEVICE123",
    "deviceModel": "Samsung Galaxy S21",
    "issueDescription": "Screen not responsive",
    "status": "pending",
    "estimatedCost": 150.00,
    "createdAt": "2026-01-26T12:00:00.000Z",
    "updatedAt": "2026-01-26T12:00:00.000Z",
    "completedAt": null,
    "notes": []
  }
]
```

### Get Single Ticket

**GET** `/tickets/:id`

Get details of a specific repair ticket.

**Response:**
```json
{
  "id": "uuid-string",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "deviceId": "DEVICE123",
  "deviceModel": "Samsung Galaxy S21",
  "issueDescription": "Screen not responsive",
  "status": "inProgress",
  "estimatedCost": 150.00,
  "createdAt": "2026-01-26T12:00:00.000Z",
  "updatedAt": "2026-01-26T14:30:00.000Z",
  "completedAt": null,
  "notes": [
    {
      "id": "note-uuid",
      "text": "Ordered replacement screen",
      "timestamp": "2026-01-26T13:00:00.000Z"
    }
  ]
}
```

### Create Ticket

**POST** `/tickets`

Create a new repair ticket.

**Request Body:**
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "deviceId": "DEVICE123",
  "deviceModel": "Samsung Galaxy S21",
  "issueDescription": "Screen not responsive",
  "estimatedCost": 150.00
}
```

**Required Fields:**
- `customerName`
- `customerEmail`
- `customerPhone`
- `deviceId`
- `deviceModel`
- `issueDescription`

**Response:** `201 Created`
```json
{
  "id": "uuid-string",
  "customerName": "John Doe",
  "status": "pending",
  "createdAt": "2026-01-26T12:00:00.000Z",
  ...
}
```

### Update Ticket

**PUT** `/tickets/:id`

Update an existing repair ticket.

**Request Body:**
```json
{
  "status": "completed",
  "estimatedCost": 175.00,
  "notes": ["Updated cost after inspection"]
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid-string",
  "status": "completed",
  "completedAt": "2026-01-26T18:00:00.000Z",
  "updatedAt": "2026-01-26T18:00:00.000Z",
  ...
}
```

### Delete Ticket

**DELETE** `/tickets/:id`

Delete a repair ticket.

**Response:** `200 OK`
```json
{
  "message": "Ticket deleted successfully",
  "ticket": { ... }
}
```

### Add Note to Ticket

**POST** `/tickets/:id/notes`

Add a note to a repair ticket.

**Request Body:**
```json
{
  "note": "Customer called to check status"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid-string",
  "notes": [
    {
      "id": "note-uuid",
      "text": "Customer called to check status",
      "timestamp": "2026-01-26T15:00:00.000Z"
    }
  ],
  ...
}
```

### Get Ticket Statistics

**GET** `/tickets/api/stats`

Get aggregate statistics about repair tickets.

**Response:**
```json
{
  "total": 150,
  "byStatus": {
    "pending": 20,
    "diagnosed": 15,
    "inProgress": 30,
    "waitingForParts": 10,
    "completed": 70,
    "cancelled": 5
  },
  "totalRevenue": 15750.00
}
```

---

## Diagnostics API

### Battery Diagnostics

**GET** `/diagnostics/battery`

Get battery diagnostics for a device.

**Query Parameters:**
- `deviceId` (required) - Device identifier

**Response:**
```json
{
  "level": 85,
  "health": "Good",
  "voltage": 4.2,
  "temperature": 32.5,
  "technology": "Li-ion",
  "isCharging": false
}
```

### Hardware Diagnostics

**GET** `/diagnostics/hardware`

Get hardware information and diagnostics.

**Query Parameters:**
- `deviceId` (required) - Device identifier

**Response:**
```json
{
  "model": "Samsung Galaxy S21",
  "manufacturer": "Samsung",
  "serialNumber": "ABC123456",
  "androidVersion": "12",
  "display": "1080x2400",
  "totalMemoryGB": "8.00",
  "storageTotal": "128GB",
  "storageAvailable": "45GB"
}
```

### Network Diagnostics

**GET** `/diagnostics/network`

Get network connectivity information.

**Query Parameters:**
- `deviceId` (required) - Device identifier

**Response:**
```json
{
  "wifiConnected": true,
  "wifiSsid": "MyNetwork",
  "wifiSignalStrength": -45,
  "cellularConnected": true,
  "cellularType": "LTE",
  "cellularSignalStrength": -80
}
```

### System Logs

**GET** `/diagnostics/logs`

Get system logs from device.

**Query Parameters:**
- `deviceId` (required) - Device identifier
- `lines` (optional) - Number of log lines (default: 100)

**Response:**
```
01-26 12:00:00.123 1234 1234 I System  : Log entry 1
01-26 12:00:01.456 1234 1234 W App     : Warning message
01-26 12:00:02.789 1234 1234 E Error   : Error message
...
```

---

## Device Management API

### List Devices

**GET** `/adb/devices`

List all connected Android devices.

**Response:**
```json
[
  {
    "id": "ABC123456",
    "name": "Samsung Galaxy S21",
    "model": "SM-G991B",
    "status": "device",
    "type": "android"
  }
]
```

### Get iOS Devices

**GET** `/ios/devices`

List all connected iOS devices.

**Response:**
```json
[
  {
    "id": "udid-string",
    "name": "iPhone 13 Pro",
    "model": "iPhone14,2",
    "iosVersion": "15.4",
    "type": "ios"
  }
]
```

### Enter Fastboot Mode

**POST** `/adb/enter-fastboot`

Reboot Android device into Fastboot mode.

**Request Body:**
```json
{
  "deviceId": "ABC123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Device entering Fastboot mode"
}
```

### Enter Recovery Mode

**POST** `/adb/enter-recovery`

Reboot Android device into Recovery mode.

**Request Body:**
```json
{
  "deviceId": "ABC123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Device entering Recovery mode"
}
```

### Enter DFU Mode (iOS)

**POST** `/ios/enter-dfu`

Guide for entering DFU mode on iOS device.

**Request Body:**
```json
{
  "deviceId": "udid-string"
}
```

**Response:** `200 OK`
```json
{
  "success": false,
  "message": "DFU mode requires manual entry",
  "instructions": [
    "Connect device to computer",
    "Press and hold Power + Home for 10 seconds",
    "Release Power but keep holding Home for 5 more seconds",
    "Screen should remain black - device is now in DFU mode"
  ]
}
```

---

## Firmware Flashing API

### Flash Firmware

**POST** `/flash/firmware`

Flash firmware to a device.

**Request Body:**
```json
{
  "deviceId": "ABC123456",
  "firmwareUrl": "https://example.com/firmware.zip",
  "verify": true
}
```

**Required Fields:**
- `deviceId` - Device to flash
- `firmwareUrl` - URL to firmware file

**Optional Fields:**
- `verify` (default: true) - Verify firmware after flashing

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Firmware flashing started",
  "jobId": "flash-job-uuid"
}
```

### Get Flash Progress

**GET** `/flash/progress/:jobId`

Get progress of firmware flashing operation.

**Response:**
```json
{
  "jobId": "flash-job-uuid",
  "status": "in_progress",
  "progress": 45,
  "message": "Flashing partition system...",
  "startedAt": "2026-01-26T12:00:00.000Z"
}
```

---

## WebSocket Events

Connect to: `ws://localhost:3001/ws/device-events`

### Device Events

**Event: `device:connected`**
```json
{
  "type": "connected",
  "deviceId": "ABC123456",
  "platform": "android",
  "timestamp": 1706270400000
}
```

**Event: `device:disconnected`**
```json
{
  "type": "disconnected",
  "deviceId": "ABC123456",
  "timestamp": 1706270500000
}
```

**Event: `device:status`**
```json
{
  "deviceId": "ABC123456",
  "status": "fastboot",
  "timestamp": 1706270600000
}
```

### Repair Progress Events

**Event: `repair:progress`**
```json
{
  "ticketId": "uuid-string",
  "status": "inProgress",
  "progress": 50,
  "message": "Replacing screen",
  "timestamp": 1706270700000
}
```

### Diagnostic Events

**Event: `diagnostic:result`**
```json
{
  "deviceId": "ABC123456",
  "type": "battery",
  "result": {
    "level": 85,
    "health": "Good"
  },
  "timestamp": 1706270800000
}
```

### Flash Progress Events

**Event: `flash:progress`**
```json
{
  "jobId": "flash-job-uuid",
  "deviceId": "ABC123456",
  "progress": 75,
  "message": "Flashing complete, verifying...",
  "timestamp": 1706270900000
}
```

---

## Error Responses

All endpoints return consistent error responses:

**400 Bad Request**
```json
{
  "error": "Invalid request parameters",
  "details": "deviceId is required"
}
```

**404 Not Found**
```json
{
  "error": "Ticket not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

---

## Rate Limiting

Sensitive endpoints are rate-limited:
- `/fastboot/*` - 10 requests per minute
- `/flash/*` - 5 requests per minute
- `/authorization/*` - 10 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1706270400
```

---

## Best Practices

### 1. Always check device connectivity before operations
```javascript
// Check if device is connected
const devices = await fetch('/api/v1/adb/devices');
if (devices.length === 0) {
  console.error('No devices connected');
}
```

### 2. Handle WebSocket reconnection
```javascript
socket.on('disconnect', () => {
  // Implement exponential backoff for reconnection
  setTimeout(() => socket.connect(), 1000);
});
```

### 3. Use proper error handling
```javascript
try {
  const response = await fetch('/api/v1/tickets', {
    method: 'POST',
    body: JSON.stringify(ticketData),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const ticket = await response.json();
} catch (error) {
  console.error('Failed to create ticket:', error);
}
```

### 4. Implement timeouts for long operations
```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

try {
  const response = await fetch('/api/v1/flash/firmware', {
    method: 'POST',
    signal: controller.signal,
    body: JSON.stringify(flashData),
  });
} finally {
  clearTimeout(timeoutId);
}
```

---

## SDK Examples

### JavaScript/Node.js

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  timeout: 30000,
});

// Create ticket
async function createTicket(data) {
  const response = await api.post('/tickets', data);
  return response.data;
}

// Get battery diagnostics
async function getBatteryInfo(deviceId) {
  const response = await api.get('/diagnostics/battery', {
    params: { deviceId },
  });
  return response.data;
}
```

### Dart/Flutter

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiClient {
  static const baseUrl = 'http://localhost:3001/api/v1';
  
  Future<Map<String, dynamic>> createTicket(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/tickets'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(data),
    );
    
    if (response.statusCode == 201) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to create ticket');
    }
  }
}
```

---

## Support

For API issues:
- Check backend logs: `Bobbys-Workshop--3.0.0/server/logs/backend.log`
- Enable debug mode: Set `DEBUG=*` environment variable
- Check network connectivity
- Verify device connections

For more information, see:
- [Quick Start Guide](QUICK_START_DIAGNOSTIC_APP.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Backend README](Bobbys-Workshop--3.0.0/server/README.md)
