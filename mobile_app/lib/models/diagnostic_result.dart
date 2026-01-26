import 'package:json_annotation/json_annotation.dart';

part 'diagnostic_result.g.dart';

@JsonSerializable()
class DiagnosticResult {
  final String deviceId;
  final DiagnosticType type;
  final bool passed;
  final String message;
  final Map<String, dynamic>? data;
  final DateTime timestamp;
  
  DiagnosticResult({
    required this.deviceId,
    required this.type,
    required this.passed,
    required this.message,
    this.data,
    required this.timestamp,
  });
  
  factory DiagnosticResult.fromJson(Map<String, dynamic> json) => 
      _$DiagnosticResultFromJson(json);
  Map<String, dynamic> toJson() => _$DiagnosticResultToJson(this);
}

@JsonSerializable()
class BatteryDiagnostic {
  final int level;
  final String health;
  final double voltage;
  final double temperature;
  final String technology;
  final bool isCharging;
  
  BatteryDiagnostic({
    required this.level,
    required this.health,
    required this.voltage,
    required this.temperature,
    required this.technology,
    required this.isCharging,
  });
  
  factory BatteryDiagnostic.fromJson(Map<String, dynamic> json) => 
      _$BatteryDiagnosticFromJson(json);
  Map<String, dynamic> toJson() => _$BatteryDiagnosticToJson(this);
}

@JsonSerializable()
class NetworkDiagnostic {
  final bool wifiConnected;
  final String? wifiSsid;
  final int? wifiSignalStrength;
  final bool cellularConnected;
  final String? cellularType;
  final int? cellularSignalStrength;
  
  NetworkDiagnostic({
    required this.wifiConnected,
    this.wifiSsid,
    this.wifiSignalStrength,
    required this.cellularConnected,
    this.cellularType,
    this.cellularSignalStrength,
  });
  
  factory NetworkDiagnostic.fromJson(Map<String, dynamic> json) => 
      _$NetworkDiagnosticFromJson(json);
  Map<String, dynamic> toJson() => _$NetworkDiagnosticToJson(this);
}

enum DiagnosticType {
  battery,
  hardware,
  network,
  systemLog,
}
