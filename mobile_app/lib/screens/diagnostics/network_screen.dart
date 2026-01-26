import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/diagnostic_result.dart';
import '../../providers/device_provider.dart';
import '../../services/diagnostic_service.dart';

class NetworkScreen extends StatefulWidget {
  final String? deviceId;

  const NetworkScreen({
    Key? key,
    this.deviceId,
  }) : super(key: key);

  @override
  State<NetworkScreen> createState() => _NetworkScreenState();
}

class _NetworkScreenState extends State<NetworkScreen> {
  final DiagnosticService _diagnosticService = DiagnosticService();
  NetworkDiagnostic? _networkData;
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
      final result = await _diagnosticService.runNetworkDiagnostics(_selectedDeviceId!);
      setState(() {
        _networkData = result;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Color _getSignalColor(int? strength) {
    if (strength == null) return Colors.grey;
    if (strength > 70) return Colors.green;
    if (strength > 40) return Colors.orange;
    return Colors.red;
  }

  IconData _getSignalIcon(int? strength) {
    if (strength == null) return Icons.signal_cellular_off;
    if (strength > 70) return Icons.signal_cellular_4_bar;
    if (strength > 40) return Icons.signal_cellular_3_bar;
    if (strength > 20) return Icons.signal_cellular_2_bar;
    return Icons.signal_cellular_1_bar;
  }

  @override
  Widget build(BuildContext context) {
    final deviceProvider = Provider.of<DeviceProvider>(context);
    final device = _selectedDeviceId != null ? deviceProvider.getDeviceById(_selectedDeviceId!) : null;

    return Scaffold(
      appBar: AppBar(
        title: Text('Network Diagnostics'),
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
            Text('Running network diagnostics...'),
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

    if (_networkData == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.network_check, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No network data available'),
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
              child: Column(
                children: [
                  Container(
                    padding: EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.primaryContainer,
                      borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.wifi,
                          size: 32,
                          color: Theme.of(context).colorScheme.onPrimaryContainer,
                        ),
                        SizedBox(width: 12),
                        Text(
                          'Wi-Fi',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                color: Theme.of(context).colorScheme.onPrimaryContainer,
                              ),
                        ),
                      ],
                    ),
                  ),
                  ListTile(
                    leading: Icon(
                      _networkData!.wifiConnected
                          ? Icons.check_circle
                          : Icons.cancel,
                      color: _networkData!.wifiConnected ? Colors.green : Colors.red,
                    ),
                    title: Text('Status'),
                    trailing: Text(
                      _networkData!.wifiConnected ? 'Connected' : 'Disconnected',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: _networkData!.wifiConnected ? Colors.green : Colors.red,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                  if (_networkData!.wifiConnected) ...[
                    Divider(height: 1),
                    ListTile(
                      leading: Icon(Icons.router),
                      title: Text('Network'),
                      trailing: Text(
                        _networkData!.wifiSsid ?? 'Unknown',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ),
                    Divider(height: 1),
                    ListTile(
                      leading: Icon(
                        Icons.signal_wifi_4_bar,
                        color: _getSignalColor(_networkData!.wifiSignalStrength),
                      ),
                      title: Text('Signal Strength'),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            '${_networkData!.wifiSignalStrength ?? 0}%',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  color: _getSignalColor(_networkData!.wifiSignalStrength),
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          SizedBox(width: 8),
                          SizedBox(
                            width: 60,
                            child: LinearProgressIndicator(
                              value: (_networkData!.wifiSignalStrength ?? 0) / 100,
                              backgroundColor: Colors.grey.shade300,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                _getSignalColor(_networkData!.wifiSignalStrength),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
            SizedBox(height: 16),
            Card(
              child: Column(
                children: [
                  Container(
                    padding: EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.primaryContainer,
                      borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.cell_tower,
                          size: 32,
                          color: Theme.of(context).colorScheme.onPrimaryContainer,
                        ),
                        SizedBox(width: 12),
                        Text(
                          'Cellular',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                color: Theme.of(context).colorScheme.onPrimaryContainer,
                              ),
                        ),
                      ],
                    ),
                  ),
                  ListTile(
                    leading: Icon(
                      _networkData!.cellularConnected
                          ? Icons.check_circle
                          : Icons.cancel,
                      color: _networkData!.cellularConnected ? Colors.green : Colors.red,
                    ),
                    title: Text('Status'),
                    trailing: Text(
                      _networkData!.cellularConnected ? 'Connected' : 'Disconnected',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: _networkData!.cellularConnected ? Colors.green : Colors.red,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                  if (_networkData!.cellularConnected) ...[
                    Divider(height: 1),
                    ListTile(
                      leading: Icon(Icons.network_cell),
                      title: Text('Network Type'),
                      trailing: Text(
                        _networkData!.cellularType ?? 'Unknown',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ),
                    Divider(height: 1),
                    ListTile(
                      leading: Icon(
                        _getSignalIcon(_networkData!.cellularSignalStrength),
                        color: _getSignalColor(_networkData!.cellularSignalStrength),
                      ),
                      title: Text('Signal Strength'),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            '${_networkData!.cellularSignalStrength ?? 0}%',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  color: _getSignalColor(_networkData!.cellularSignalStrength),
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          SizedBox(width: 8),
                          SizedBox(
                            width: 60,
                            child: LinearProgressIndicator(
                              value: (_networkData!.cellularSignalStrength ?? 0) / 100,
                              backgroundColor: Colors.grey.shade300,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                _getSignalColor(_networkData!.cellularSignalStrength),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
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
                          'Network Status',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                color: Theme.of(context).colorScheme.onSecondaryContainer,
                              ),
                        ),
                      ],
                    ),
                    SizedBox(height: 12),
                    _buildStatusItem(
                      'Internet Access',
                      _networkData!.wifiConnected || _networkData!.cellularConnected,
                    ),
                    _buildStatusItem(
                      'Wi-Fi Available',
                      _networkData!.wifiConnected,
                    ),
                    _buildStatusItem(
                      'Cellular Available',
                      _networkData!.cellularConnected,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusItem(String label, bool status) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          Icon(
            status ? Icons.check_circle : Icons.cancel,
            size: 20,
            color: status
                ? Theme.of(context).colorScheme.onSecondaryContainer
                : Colors.red.shade300,
          ),
          SizedBox(width: 12),
          Text(
            label,
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSecondaryContainer,
            ),
          ),
        ],
      ),
    );
  }
}
