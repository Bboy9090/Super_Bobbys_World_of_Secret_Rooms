import 'package:json_annotation/json_annotation.dart';

part 'device.g.dart';

@JsonSerializable()
class Device {
  final String id;
  final String name;
  final String model;
  final String manufacturer;
  final String serialNumber;
  final String? imei;
  final DeviceType type;
  final DeviceStatus status;
  final DateTime? lastSeen;
  
  Device({
    required this.id,
    required this.name,
    required this.model,
    required this.manufacturer,
    required this.serialNumber,
    this.imei,
    required this.type,
    required this.status,
    this.lastSeen,
  });
  
  factory Device.fromJson(Map<String, dynamic> json) => _$DeviceFromJson(json);
  Map<String, dynamic> toJson() => _$DeviceToJson(this);
}

enum DeviceType {
  android,
  ios,
  unknown,
}

enum DeviceStatus {
  online,
  offline,
  fastboot,
  recovery,
  dfu,
  flashing,
}
