import '../models/device.dart';
import '../models/diagnostic_result.dart';
import 'api_service.dart';

class DiagnosticService {
  final ApiService _apiService = ApiService();
  
  // Battery Diagnostics
  Future<BatteryDiagnostic> runBatteryDiagnostics(String deviceId) async {
    try {
      return await _apiService.getBatteryDiagnostics(deviceId);
    } catch (e) {
      throw Exception('Battery diagnostics failed: $e');
    }
  }
  
  // Network Diagnostics
  Future<NetworkDiagnostic> runNetworkDiagnostics(String deviceId) async {
    try {
      return await _apiService.getNetworkDiagnostics(deviceId);
    } catch (e) {
      throw Exception('Network diagnostics failed: $e');
    }
  }
  
  // Hardware Diagnostics
  Future<Map<String, dynamic>> runHardwareDiagnostics(String deviceId) async {
    try {
      return await _apiService.getHardwareDiagnostics(deviceId);
    } catch (e) {
      throw Exception('Hardware diagnostics failed: $e');
    }
  }
  
  // System Logs
  Future<String> getSystemLogs(String deviceId) async {
    try {
      return await _apiService.getSystemLogs(deviceId);
    } catch (e) {
      throw Exception('Failed to get system logs: $e');
    }
  }
  
  // Device State Management
  Future<void> enterFastbootMode(String deviceId) async {
    try {
      await _apiService.enterFastbootMode(deviceId);
    } catch (e) {
      throw Exception('Failed to enter Fastboot mode: $e');
    }
  }
  
  Future<void> enterRecoveryMode(String deviceId) async {
    try {
      await _apiService.enterRecoveryMode(deviceId);
    } catch (e) {
      throw Exception('Failed to enter Recovery mode: $e');
    }
  }
  
  Future<void> enterDFUMode(String deviceId) async {
    try {
      await _apiService.enterDFUMode(deviceId);
    } catch (e) {
      throw Exception('Failed to enter DFU mode: $e');
    }
  }
  
  // Firmware Flashing
  Future<void> flashFirmware({
    required String deviceId,
    required String firmwareUrl,
    bool verify = true,
  }) async {
    try {
      await _apiService.flashFirmware(
        deviceId: deviceId,
        firmwareUrl: firmwareUrl,
        verify: verify,
      );
    } catch (e) {
      throw Exception('Firmware flashing failed: $e');
    }
  }
}
