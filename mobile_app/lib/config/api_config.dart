class ApiConfig {
  // Backend server URL
  static const String baseUrl = 'http://localhost:3001';
  
  // API endpoints
  static const String ticketsEndpoint = '/api/v1/tickets';
  static const String diagnosticsEndpoint = '/api/v1/diagnostics';
  static const String adbEndpoint = '/api/v1/adb';
  static const String fastbootEndpoint = '/api/v1/fastboot';
  static const String iosEndpoint = '/api/v1/ios';
  static const String flashEndpoint = '/api/v1/flash';
  
  // WebSocket URL
  static const String wsUrl = 'ws://localhost:3001';
  
  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // API version
  static const String apiVersion = 'v1';
  
  // Full URLs
  static String get tickets => '$baseUrl$ticketsEndpoint';
  static String get diagnostics => '$baseUrl$diagnosticsEndpoint';
  static String get adb => '$baseUrl$adbEndpoint';
  static String get fastboot => '$baseUrl$fastbootEndpoint';
  static String get ios => '$baseUrl$iosEndpoint';
  static String get flash => '$baseUrl$flashEndpoint';
}
