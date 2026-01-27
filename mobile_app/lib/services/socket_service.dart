import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../config/api_config.dart';

class SocketService {
  IO.Socket? _socket;
  final List<Function(dynamic)> _listeners = [];
  
  void connect() {
    _socket = IO.io(
      ApiConfig.wsUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .build(),
    );
    
    _socket?.connect();
    
    _socket?.onConnect((_) {
      print('Connected to WebSocket server');
    });
    
    _socket?.onDisconnect((_) {
      print('Disconnected from WebSocket server');
    });
    
    _socket?.onError((error) {
      print('WebSocket error: $error');
    });
    
    // Listen for repair progress updates
    _socket?.on('repair:progress', (data) {
      _notifyListeners(data);
    });
    
    // Listen for device status changes
    _socket?.on('device:status', (data) {
      _notifyListeners(data);
    });
    
    // Listen for diagnostic results
    _socket?.on('diagnostic:result', (data) {
      _notifyListeners(data);
    });
    
    // Listen for firmware flash progress
    _socket?.on('flash:progress', (data) {
      _notifyListeners(data);
    });
  }
  
  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
  }
  
  void addListener(Function(dynamic) callback) {
    _listeners.add(callback);
  }
  
  void removeListener(Function(dynamic) callback) {
    _listeners.remove(callback);
  }
  
  void _notifyListeners(dynamic data) {
    for (var listener in _listeners) {
      listener(data);
    }
  }
  
  void emit(String event, dynamic data) {
    _socket?.emit(event, data);
  }
  
  void on(String event, Function(dynamic) callback) {
    _socket?.on(event, callback);
  }
  
  bool get isConnected => _socket?.connected ?? false;
}
