import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/diagnostic_result.dart';
import '../../providers/device_provider.dart';
import '../../services/diagnostic_service.dart';

class BatteryScreen extends StatefulWidget {
  final String? deviceId;

  const BatteryScreen({
    Key? key,
    this.deviceId,
  }) : super(key: key);

  @override
  State<BatteryScreen> createState() => _BatteryScreenState();
}

class _BatteryScreenState extends State<BatteryScreen> {
  final DiagnosticService _diagnosticService = DiagnosticService();
  BatteryDiagnostic? _batteryData;
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
      final result = await _diagnosticService.runBatteryDiagnostics(_selectedDeviceId!);
      setState(() {
        _batteryData = result;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Color _getBatteryColor(int level) {
    if (level > 60) return Colors.green;
    if (level > 20) return Colors.orange;
    return Colors.red;
  }

  Color _getHealthColor(String health) {
    if (health.toLowerCase() == 'good') return Colors.green;
    if (health.toLowerCase() == 'fair') return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    final deviceProvider = Provider.of<DeviceProvider>(context);
    final device = _selectedDeviceId != null ? deviceProvider.getDeviceById(_selectedDeviceId!) : null;

    return Scaffold(
      appBar: AppBar(
        title: Text('Battery Diagnostics'),
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
            Text('Running battery diagnostics...'),
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

    if (_batteryData == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.battery_unknown, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No battery data available'),
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
      child: SingleChildScrollView(
        physics: AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Icon(
                      _batteryData!.isCharging
                          ? Icons.battery_charging_full
                          : Icons.battery_full,
                      size: 64,
                      color: _getBatteryColor(_batteryData!.level),
                    ),
                    SizedBox(height: 8),
                    Text(
                      '${_batteryData!.level}%',
                      style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                            color: _getBatteryColor(_batteryData!.level),
                          ),
                    ),
                    Text(
                      _batteryData!.isCharging ? 'Charging' : 'Discharging',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 16),
            Card(
              child: Column(
                children: [
                  _buildInfoTile(
                    'Health',
                    _batteryData!.health,
                    Icons.favorite,
                    _getHealthColor(_batteryData!.health),
                  ),
                  Divider(height: 1),
                  _buildInfoTile(
                    'Voltage',
                    '${_batteryData!.voltage.toStringAsFixed(2)} V',
                    Icons.electric_bolt,
                  ),
                  Divider(height: 1),
                  _buildInfoTile(
                    'Temperature',
                    '${_batteryData!.temperature.toStringAsFixed(1)}°C',
                    Icons.thermostat,
                    _batteryData!.temperature > 45 ? Colors.red : null,
                  ),
                  Divider(height: 1),
                  _buildInfoTile(
                    'Technology',
                    _batteryData!.technology,
                    Icons.science,
                  ),
                ],
              ),
            ),
            SizedBox(height: 16),
            Card(
              color: Theme.of(context).colorScheme.secondaryContainer,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.info_outline,
                          color: Theme.of(context).colorScheme.onSecondaryContainer,
                        ),
                        SizedBox(width: 8),
                        Text(
                          'Battery Tips',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                color: Theme.of(context).colorScheme.onSecondaryContainer,
                              ),
                        ),
                      ],
                    ),
                    SizedBox(height: 12),
                    _buildTip('Keep battery level between 20% and 80% for optimal health'),
                    _buildTip('Avoid extreme temperatures'),
                    _buildTip('Use original chargers when possible'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTile(
    String title,
    String value,
    IconData icon, [
    Color? valueColor,
  ]) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      trailing: Text(
        value,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: valueColor,
              fontWeight: FontWeight.bold,
            ),
      ),
    );
  }

  Widget _buildTip(String tip) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 4.0),
            child: Icon(
              Icons.check_circle,
              size: 16,
              color: Theme.of(context).colorScheme.onSecondaryContainer,
            ),
          ),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              tip,
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSecondaryContainer,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
