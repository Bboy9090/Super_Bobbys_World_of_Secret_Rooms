import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../providers/device_provider.dart';
import '../../services/diagnostic_service.dart';

class SystemLogsScreen extends StatefulWidget {
  final String? deviceId;

  const SystemLogsScreen({
    Key? key,
    this.deviceId,
  }) : super(key: key);

  @override
  State<SystemLogsScreen> createState() => _SystemLogsScreenState();
}

class _SystemLogsScreenState extends State<SystemLogsScreen> {
  final DiagnosticService _diagnosticService = DiagnosticService();
  final TextEditingController _searchController = TextEditingController();
  String _logs = '';
  List<String> _filteredLogs = [];
  bool _isLoading = false;
  String? _error;
  String _searchQuery = '';
  bool _autoScroll = true;
  LogLevel _selectedLevel = LogLevel.all;
  String? _selectedDeviceId;

  @override
  void initState() {
    super.initState();
    _selectedDeviceId = widget.deviceId;
    if (_selectedDeviceId != null) {
      _loadLogs();
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadLogs() async {
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
      final logs = await _diagnosticService.getSystemLogs(_selectedDeviceId!);
      setState(() {
        _logs = logs;
        _filterLogs();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  void _filterLogs() {
    final lines = _logs.split('\n');
    _filteredLogs = lines.where((line) {
      if (_searchQuery.isNotEmpty && 
          !line.toLowerCase().contains(_searchQuery.toLowerCase())) {
        return false;
      }
      
      if (_selectedLevel != LogLevel.all) {
        final levelStr = _selectedLevel.toString().split('.').last.toUpperCase();
        if (!line.contains(levelStr)) {
          return false;
        }
      }
      
      return line.trim().isNotEmpty;
    }).toList();
  }

  void _onSearchChanged(String query) {
    setState(() {
      _searchQuery = query;
      _filterLogs();
    });
  }

  void _onLevelChanged(LogLevel? level) {
    if (level != null) {
      setState(() {
        _selectedLevel = level;
        _filterLogs();
      });
    }
  }

  Future<void> _copyToClipboard() async {
    await Clipboard.setData(ClipboardData(text: _logs));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Logs copied to clipboard'),
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _clearLogs() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Clear Logs'),
        content: Text('Are you sure you want to clear all logs? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('Clear', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      setState(() {
        _logs = '';
        _filteredLogs = [];
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Logs cleared')),
      );
    }
  }

  Color _getLogLevelColor(String line) {
    if (line.contains('ERROR') || line.contains('FATAL')) {
      return Colors.red.shade100;
    } else if (line.contains('WARN')) {
      return Colors.orange.shade100;
    } else if (line.contains('INFO')) {
      return Colors.blue.shade100;
    } else if (line.contains('DEBUG')) {
      return Colors.grey.shade200;
    }
    return Colors.transparent;
  }

  TextStyle _getLogLevelTextStyle(String line) {
    if (line.contains('ERROR') || line.contains('FATAL')) {
      return TextStyle(color: Colors.red.shade900, fontFamily: 'monospace', fontSize: 12);
    } else if (line.contains('WARN')) {
      return TextStyle(color: Colors.orange.shade900, fontFamily: 'monospace', fontSize: 12);
    } else if (line.contains('INFO')) {
      return TextStyle(color: Colors.blue.shade900, fontFamily: 'monospace', fontSize: 12);
    } else if (line.contains('DEBUG')) {
      return TextStyle(color: Colors.grey.shade700, fontFamily: 'monospace', fontSize: 12);
    }
    return TextStyle(fontFamily: 'monospace', fontSize: 12);
  }

  @override
  Widget build(BuildContext context) {
    final deviceProvider = Provider.of<DeviceProvider>(context);
    final device = _selectedDeviceId != null ? deviceProvider.getDeviceById(_selectedDeviceId!) : null;

    return Scaffold(
      appBar: AppBar(
        title: Text('System Logs'),
        actions: [
          if (_selectedDeviceId != null) ...[
            IconButton(
              icon: Icon(Icons.copy),
              onPressed: _logs.isEmpty ? null : _copyToClipboard,
              tooltip: 'Copy to clipboard',
            ),
            IconButton(
              icon: Icon(Icons.delete_outline),
              onPressed: _logs.isEmpty ? null : _clearLogs,
              tooltip: 'Clear logs',
            ),
            IconButton(
              icon: Icon(Icons.refresh),
              onPressed: _isLoading ? null : _loadLogs,
              tooltip: 'Refresh',
            ),
          ],
        ],
      ),
      body: _selectedDeviceId == null 
        ? _buildDeviceSelection(deviceProvider)
        : Column(
            children: [
              Container(
                padding: EdgeInsets.all(8),
                color: Theme.of(context).colorScheme.surfaceVariant,
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _searchController,
                            decoration: InputDecoration(
                              hintText: 'Search logs...',
                              prefixIcon: Icon(Icons.search),
                              suffixIcon: _searchQuery.isNotEmpty
                                  ? IconButton(
                                      icon: Icon(Icons.clear),
                                      onPressed: () {
                                        _searchController.clear();
                                        _onSearchChanged('');
                                      },
                                    )
                                  : null,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            ),
                            onChanged: _onSearchChanged,
                          ),
                        ),
                        SizedBox(width: 8),
                        DropdownButton<LogLevel>(
                          value: _selectedLevel,
                          items: LogLevel.values.map((level) {
                            return DropdownMenuItem(
                              value: level,
                              child: Text(level.toString().split('.').last.toUpperCase()),
                            );
                          }).toList(),
                          onChanged: _onLevelChanged,
                        ),
                      ],
                    ),
                    SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${_filteredLogs.length} lines',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        Row(
                          children: [
                            Text(
                              'Auto-scroll',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            Switch(
                              value: _autoScroll,
                              onChanged: (value) {
                                setState(() {
                                  _autoScroll = value;
                                });
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Expanded(
                child: _buildBody(device?.name ?? 'Unknown Device'),
              ),
            ],
          ),
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
              _loadLogs();
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
            Text('Loading system logs...'),
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
                onPressed: _loadLogs,
                icon: Icon(Icons.refresh),
                label: Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_logs.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.description, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No logs available'),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loadLogs,
              child: Text('Load Logs'),
            ),
          ],
        ),
      );
    }

    if (_filteredLogs.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No logs match your filters'),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: EdgeInsets.all(8),
      itemCount: _filteredLogs.length,
      reverse: _autoScroll,
      itemBuilder: (context, index) {
        final logIndex = _autoScroll 
            ? _filteredLogs.length - 1 - index 
            : index;
        final line = _filteredLogs[logIndex];
        
        return Container(
          margin: EdgeInsets.only(bottom: 2),
          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          color: _getLogLevelColor(line),
          child: SelectableText(
            line,
            style: _getLogLevelTextStyle(line),
          ),
        );
      },
    );
  }
}

enum LogLevel {
  all,
  error,
  warn,
  info,
  debug,
}
