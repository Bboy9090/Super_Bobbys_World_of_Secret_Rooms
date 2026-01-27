import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/device.dart';
import '../models/repair_ticket.dart';
import '../models/diagnostic_result.dart';

class ApiService {
  // Repair Ticket APIs
  Future<List<RepairTicket>> getTickets() async {
    final response = await http.get(
      Uri.parse(ApiConfig.tickets),
      headers: {'Content-Type': 'application/json'},
    ).timeout(ApiConfig.receiveTimeout);
    
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => RepairTicket.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load tickets: ${response.statusCode}');
    }
  }
  
  Future<RepairTicket> getTicket(String id) async {
    final response = await http.get(
      Uri.parse('${ApiConfig.tickets}/$id'),
      headers: {'Content-Type': 'application/json'},
    ).timeout(ApiConfig.receiveTimeout);
    
    if (response.statusCode == 200) {
      return RepairTicket.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to load ticket: ${response.statusCode}');
    }
  }
  
  Future<RepairTicket> createTicket(RepairTicket ticket) async {
    final response = await http.post(
      Uri.parse(ApiConfig.tickets),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(ticket.toJson()),
    ).timeout(ApiConfig.receiveTimeout);
    
    if (response.statusCode == 201 || response.statusCode == 200) {
      return RepairTicket.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to create ticket: ${response.statusCode}');
    }
  }
  
  Future<RepairTicket> updateTicket(String id, RepairTicket ticket) async {
    final response = await http.put(
      Uri.parse('${ApiConfig.tickets}/$id'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(ticket.toJson()),
    ).timeout(ApiConfig.receiveTimeout);
    
    if (response.statusCode == 200) {
      return RepairTicket.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to update ticket: ${response.statusCode}');
    }
  }
  
  Future<void> deleteTicket(String id) async {
    final response = await http.delete(
      Uri.parse('${ApiConfig.tickets}/$id'),
      headers: {'Content-Type': 'application/json'},
    ).timeout(ApiConfig.receiveTimeout);
    
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Failed to delete ticket: ${response.statusCode}');
    }
  }
  
  // Device APIs
  Future<List<Device>> getDevices() async {
    final response = await http.get(
      Uri.parse('${ApiConfig.adb}/devices'),
      headers: {'Content-Type': 'application/json'},
    ).timeout(ApiConfig.receiveTimeout);
    
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Device.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load devices: ${response.statusCode}');
    }
  }
  
  // Diagnostic APIs
  Future<BatteryDiagnostic> getBatteryDiagnostics(String deviceId) async {
    final response = await http.get(
      Uri.parse('${ApiConfig.diagnostics}/battery?deviceId=$deviceId'),
      headers: {'Content-Type': 'application/json'},
    ).timeout(ApiConfig.receiveTimeout);
    
    if (response.statusCode == 200) {
      return BatteryDiagnostic.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to get battery diagnostics: ${response.statusCode}');
    }
  }
  
  Future<NetworkDiagnostic> getNetworkDiagnostics(String deviceId) async {
    final response = await http.get(
      Uri.parse('${ApiConfig.diagnostics}/network?deviceId=$deviceId'),
      headers: {'Content-Type': 'application/json'},
    ).timeout(ApiConfig.receiveTimeout);
    
    if (response.statusCode == 200) {
      return NetworkDiagnostic.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to get network diagnostics: ${response.statusCode}');
    }
  }
  
  Future<Map<String, dynamic>> getHardwareDiagnostics(String deviceId) async {
    final response = await http.get(
      Uri.parse('${ApiConfig.diagnostics}/hardware?deviceId=$deviceId'),
      headers: {'Content-Type': 'application/json'},
    ).timeout(ApiConfig.receiveTimeout);
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to get hardware diagnostics: ${response.statusCode}');
    }
  }
  
  Future<String> getSystemLogs(String deviceId) async {
    final response = await http.get(
      Uri.parse('${ApiConfig.diagnostics}/logs?deviceId=$deviceId'),
      headers: {'Content-Type': 'application/json'},
    ).timeout(ApiConfig.receiveTimeout);
    
    if (response.statusCode == 200) {
      return response.body;
    } else {
      throw Exception('Failed to get system logs: ${response.statusCode}');
    }
  }
  
  // Device State Management APIs
  Future<void> enterFastbootMode(String deviceId) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.adb}/enter-fastboot'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'deviceId': deviceId}),
    ).timeout(ApiConfig.receiveTimeout);
    
    if (response.statusCode != 200) {
      throw Exception('Failed to enter fastboot mode: ${response.statusCode}');
    }
  }
  
  Future<void> enterRecoveryMode(String deviceId) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.adb}/enter-recovery'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'deviceId': deviceId}),
    ).timeout(ApiConfig.receiveTimeout);
    
    if (response.statusCode != 200) {
      throw Exception('Failed to enter recovery mode: ${response.statusCode}');
    }
  }
  
  Future<void> enterDFUMode(String deviceId) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.ios}/enter-dfu'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'deviceId': deviceId}),
    ).timeout(ApiConfig.receiveTimeout);
    
    if (response.statusCode != 200) {
      throw Exception('Failed to enter DFU mode: ${response.statusCode}');
    }
  }
  
  // Firmware Flashing APIs
  Future<void> flashFirmware({
    required String deviceId,
    required String firmwareUrl,
    bool verify = true,
  }) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.flash}/firmware'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'deviceId': deviceId,
        'firmwareUrl': firmwareUrl,
        'verify': verify,
      }),
    ).timeout(const Duration(minutes: 10)); // Longer timeout for flashing
    
    if (response.statusCode != 200) {
      throw Exception('Failed to flash firmware: ${response.statusCode}');
    }
  }
}
