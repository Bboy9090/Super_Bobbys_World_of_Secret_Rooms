import 'package:flutter/foundation.dart';
import '../models/device.dart';
import '../services/api_service.dart';

class DeviceProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<Device> _devices = [];
  Device? _selectedDevice;
  bool _isLoading = false;
  String? _error;
  
  List<Device> get devices => _devices;
  Device? get selectedDevice => _selectedDevice;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  Future<void> loadDevices() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      _devices = await _apiService.getDevices();
      _error = null;
    } catch (e) {
      _error = e.toString();
      _devices = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  void selectDevice(Device device) {
    _selectedDevice = device;
    notifyListeners();
  }
  
  void clearSelection() {
    _selectedDevice = null;
    notifyListeners();
  }
  
  Device? getDeviceById(String id) {
    try {
      return _devices.firstWhere((device) => device.id == id);
    } catch (e) {
      return null;
    }
  }
  
  void updateDeviceStatus(String deviceId, DeviceStatus status) {
    final index = _devices.indexWhere((device) => device.id == deviceId);
    if (index != -1) {
      // Note: Device model should have a copyWith method for immutability
      // For now, we'll trigger a reload
      loadDevices();
    }
  }
}
