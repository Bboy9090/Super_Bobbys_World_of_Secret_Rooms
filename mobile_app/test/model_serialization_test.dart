import 'package:flutter_test/flutter_test.dart';
import 'package:diagnostic_repair_app/models/device.dart';
import 'package:diagnostic_repair_app/models/repair_ticket.dart';

void main() {
  test('device JSON round-trip preserves store-facing identity fields', () {
    final device = Device(
      id: 'device-1',
      name: 'Test Phone',
      model: 'Model X',
      manufacturer: 'Example',
      serialNumber: 'SERIAL-1',
      type: DeviceType.android,
      status: DeviceStatus.online,
      lastSeen: DateTime.utc(2026, 10, 31, 20),
    );

    final decoded = Device.fromJson(device.toJson());
    expect(decoded.id, device.id);
    expect(decoded.serialNumber, device.serialNumber);
    expect(decoded.type, DeviceType.android);
    expect(decoded.status, DeviceStatus.online);
  });

  test('repair ticket copyWith and JSON round-trip preserve status', () {
    final ticket = RepairTicket(
      id: 'ticket-1',
      customerName: 'Store QA',
      customerEmail: 'qa@example.invalid',
      customerPhone: '0000000000',
      deviceId: 'device-1',
      deviceModel: 'Model X',
      issueDescription: 'Diagnostic qualification',
      status: RepairStatus.pending,
      createdAt: DateTime.utc(2026, 10, 31, 20),
    );

    final updated = ticket.copyWith(status: RepairStatus.diagnosed);
    final decoded = RepairTicket.fromJson(updated.toJson());
    expect(decoded.status, RepairStatus.diagnosed);
    expect(decoded.deviceId, 'device-1');
  });
}
