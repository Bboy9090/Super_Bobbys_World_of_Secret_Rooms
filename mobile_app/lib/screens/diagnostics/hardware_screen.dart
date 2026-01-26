import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/device_provider.dart';
import '../../services/diagnostic_service.dart';

class HardwareScreen extends StatefulWidget {
  final String? deviceId;

  const HardwareScreen({
    Key? key,
    this.deviceId,
  }) : super(key: key);

  @override
  State<HardwareScreen> createState() => _HardwareScreenState();
}

class _HardwareScreenState extends State<HardwareScreen> {
  final DiagnosticService _diagnosticService = DiagnosticService();
  Map<String, dynamic>? _hardwareData;
  bool _isLoading = false;
  String? _error;
  String? _selectedDeviceId;

  @override
  void initState() {
    super.initState();
    _selectedDeviceId = widget.deviceId;
    if (_selectedDeviceId != null) {
      _runDiagnostics();
    }
  }

  Future<void> _runDiagnostics() async {
    if (_selectedDeviceId == null) {
      setState(() {
        _error = 'Please select a device';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final result = await _diagnosticService.runHardwareDiagnostics(_selectedDeviceId!);
      setState(() {
        _hardwareData = result;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final deviceProvider = Provider.of<DeviceProvider>(context);
    final device = _selectedDeviceId != null ? deviceProvider.getDeviceById(_selectedDeviceId!) : null;

    return Scaffold(
      appBar: AppBar(
        title: Text('Hardware Diagnostics'),
        actions: [
          if (_selectedDeviceId != null)
            IconButton(
              icon: Icon(Icons.refresh),
              onPressed: _isLoading ? null : _runDiagnostics,
              tooltip: 'Refresh',
            ),
        ],
      ),
      body: _selectedDeviceId == null 
        ? _buildDeviceSelection(deviceProvider)
        : _buildBody(device?.name ?? 'Unknown Device'),
    );
  }

  Widget _buildDeviceSelection(DeviceProvider deviceProvider) {
    if (deviceProvider.devices.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.devices_other, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No devices available'),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => deviceProvider.loadDevices(),
              child: Text('Reload Devices'),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: EdgeInsets.all(16),
      itemCount: deviceProvider.devices.length,
      itemBuilder: (context, index) {
        final device = deviceProvider.devices[index];
        return Card(
          child: ListTile(
            leading: Icon(Icons.phone_android),
            title: Text('${device.manufacturer} ${device.model}'),
            subtitle: Text(device.serialNumber),
            trailing: Icon(Icons.arrow_forward),
            onTap: () {
              setState(() {
                _selectedDeviceId = device.id;
              });
              _runDiagnostics();
            },
          ),
        );
      },
    );
  }

  Widget _buildBody(String deviceName) {
    if (_isLoading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Running hardware diagnostics...'),
          ],
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: Colors.red),
              SizedBox(height: 16),
              Text(
                'Error',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              SizedBox(height: 8),
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.red.shade700),
              ),
              SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _runDiagnostics,
                icon: Icon(Icons.refresh),
                label: Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_hardwareData == null || _hardwareData!.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.devices, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No hardware data available'),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: _runDiagnostics,
              child: Text('Run Diagnostics'),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _runDiagnostics,
      child: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          _buildSection('Display', Icons.phone_android, [
            if (_hardwareData!['display'] != null) ..._buildDisplayInfo(),
          ]),
          SizedBox(height: 16),
          _buildSection('Camera', Icons.camera_alt, [
            if (_hardwareData!['camera'] != null) ..._buildCameraInfo(),
          ]),
          SizedBox(height: 16),
          _buildSection('Audio', Icons.volume_up, [
            if (_hardwareData!['audio'] != null) ..._buildAudioInfo(),
          ]),
          SizedBox(height: 16),
          _buildSection('Sensors', Icons.sensors, [
            if (_hardwareData!['sensors'] != null) ..._buildSensorsInfo(),
          ]),
          SizedBox(height: 16),
          _buildSection('Storage', Icons.storage, [
            if (_hardwareData!['storage'] != null) ..._buildStorageInfo(),
          ]),
          SizedBox(height: 16),
          _buildSection('Memory', Icons.memory, [
            if (_hardwareData!['memory'] != null) ..._buildMemoryInfo(),
          ]),
        ],
      ),
    );
  }

  Widget _buildSection(String title, IconData icon, List<Widget> children) {
    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Icon(icon, size: 28, color: Theme.of(context).colorScheme.primary),
                SizedBox(width: 12),
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ],
            ),
          ),
          Divider(height: 1),
          ...children,
        ],
      ),
    );
  }

  List<Widget> _buildDisplayInfo() {
    final display = _hardwareData!['display'] as Map<String, dynamic>;
    return [
      _buildInfoTile('Resolution', display['resolution'] ?? 'Unknown'),
      _buildInfoTile('Refresh Rate', display['refreshRate']?.toString() ?? 'Unknown'),
      _buildInfoTile('Brightness', '${display['brightness'] ?? 0}%', status: display['working'] ?? false),
    ];
  }

  List<Widget> _buildCameraInfo() {
    final camera = _hardwareData!['camera'] as Map<String, dynamic>;
    return [
      _buildInfoTile('Front Camera', camera['front'] ?? 'Unknown', status: camera['frontWorking'] ?? false),
      _buildInfoTile('Rear Camera', camera['rear'] ?? 'Unknown', status: camera['rearWorking'] ?? false),
      _buildInfoTile('Flash', camera['flash'] ?? 'Unknown', status: camera['flashWorking'] ?? false),
    ];
  }

  List<Widget> _buildAudioInfo() {
    final audio = _hardwareData!['audio'] as Map<String, dynamic>;
    return [
      _buildInfoTile('Speaker', audio['speaker'] ?? 'Unknown', status: audio['speakerWorking'] ?? false),
      _buildInfoTile('Microphone', audio['microphone'] ?? 'Unknown', status: audio['microphoneWorking'] ?? false),
      _buildInfoTile('Headphone Jack', audio['headphoneJack'] ?? 'Unknown', status: audio['headphoneJackWorking'] ?? false),
    ];
  }

  List<Widget> _buildSensorsInfo() {
    final sensors = _hardwareData!['sensors'] as Map<String, dynamic>;
    return [
      _buildInfoTile('Accelerometer', sensors['accelerometer'] ? 'Working' : 'Not Working', status: sensors['accelerometer'] ?? false),
      _buildInfoTile('Gyroscope', sensors['gyroscope'] ? 'Working' : 'Not Working', status: sensors['gyroscope'] ?? false),
      _buildInfoTile('Proximity', sensors['proximity'] ? 'Working' : 'Not Working', status: sensors['proximity'] ?? false),
      _buildInfoTile('Fingerprint', sensors['fingerprint'] ? 'Working' : 'Not Working', status: sensors['fingerprint'] ?? false),
    ];
  }

  List<Widget> _buildStorageInfo() {
    final storage = _hardwareData!['storage'] as Map<String, dynamic>;
    final total = storage['total'] ?? 0;
    final used = storage['used'] ?? 0;
    final free = storage['free'] ?? 0;
    final percentage = total > 0 ? (used / total * 100).toStringAsFixed(1) : '0';

    return [
      _buildInfoTile('Total', _formatBytes(total)),
      _buildInfoTile('Used', _formatBytes(used)),
      _buildInfoTile('Free', _formatBytes(free)),
      Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Usage: $percentage%'),
            SizedBox(height: 8),
            LinearProgressIndicator(
              value: total > 0 ? used / total : 0,
              backgroundColor: Colors.grey.shade300,
              valueColor: AlwaysStoppedAnimation<Color>(
                double.parse(percentage) > 80 ? Colors.red : Colors.green,
              ),
            ),
          ],
        ),
      ),
    ];
  }

  List<Widget> _buildMemoryInfo() {
    final memory = _hardwareData!['memory'] as Map<String, dynamic>;
    final total = memory['total'] ?? 0;
    final available = memory['available'] ?? 0;
    final used = total - available;
    final percentage = total > 0 ? (used / total * 100).toStringAsFixed(1) : '0';

    return [
      _buildInfoTile('Total', _formatBytes(total)),
      _buildInfoTile('Used', _formatBytes(used)),
      _buildInfoTile('Available', _formatBytes(available)),
      Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Usage: $percentage%'),
            SizedBox(height: 8),
            LinearProgressIndicator(
              value: total > 0 ? used / total : 0,
              backgroundColor: Colors.grey.shade300,
              valueColor: AlwaysStoppedAnimation<Color>(
                double.parse(percentage) > 80 ? Colors.orange : Colors.green,
              ),
            ),
          ],
        ),
      ),
    ];
  }

  Widget _buildInfoTile(String title, String value, {bool? status}) {
    return ListTile(
      title: Text(title),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            value,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          if (status != null) ...[
            SizedBox(width: 8),
            Icon(
              status ? Icons.check_circle : Icons.cancel,
              color: status ? Colors.green : Colors.red,
              size: 20,
            ),
          ],
        ],
      ),
    );
  }

  String _formatBytes(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    if (bytes < 1024 * 1024 * 1024) return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }
}
