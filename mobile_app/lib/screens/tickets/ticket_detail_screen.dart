import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../models/repair_ticket.dart';
import '../../providers/ticket_provider.dart';

class TicketDetailScreen extends StatefulWidget {
  final String ticketId;

  const TicketDetailScreen({
    Key? key,
    required this.ticketId,
  }) : super(key: key);

  @override
  State<TicketDetailScreen> createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends State<TicketDetailScreen> {
  bool _isEditing = false;
  late TextEditingController _issueController;
  late TextEditingController _costController;
  late TextEditingController _noteController;
  RepairStatus? _selectedStatus;

  @override
  void initState() {
    super.initState();
    _issueController = TextEditingController();
    _costController = TextEditingController();
    _noteController = TextEditingController();
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<TicketProvider>(context, listen: false).loadTicket(widget.ticketId);
    });
  }

  @override
  void dispose() {
    _issueController.dispose();
    _costController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  void _toggleEdit(RepairTicket ticket) {
    setState(() {
      _isEditing = !_isEditing;
      if (_isEditing) {
        _issueController.text = ticket.issueDescription;
        _costController.text = ticket.estimatedCost?.toString() ?? '';
        _selectedStatus = ticket.status;
      }
    });
  }

  Future<void> _saveChanges(TicketProvider ticketProvider, RepairTicket ticket) async {
    if (_issueController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Issue description cannot be empty')),
      );
      return;
    }

    final updatedTicket = ticket.copyWith(
      issueDescription: _issueController.text.trim(),
      estimatedCost: double.tryParse(_costController.text),
      status: _selectedStatus ?? ticket.status,
      updatedAt: DateTime.now(),
    );

    final success = await ticketProvider.updateTicket(widget.ticketId, updatedTicket);
    
    if (success) {
      setState(() {
        _isEditing = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ticket updated successfully')),
        );
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(ticketProvider.error ?? 'Failed to update ticket'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _addNote(TicketProvider ticketProvider, RepairTicket ticket) async {
    if (_noteController.text.trim().isEmpty) return;

    final updatedNotes = [...ticket.notes, _noteController.text.trim()];
    final updatedTicket = ticket.copyWith(notes: updatedNotes);

    final success = await ticketProvider.updateTicket(widget.ticketId, updatedTicket);
    
    if (success) {
      _noteController.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Note added')),
        );
      }
    }
  }

  Future<void> _deleteTicket(TicketProvider ticketProvider) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Delete Ticket'),
        content: Text('Are you sure you want to delete this ticket? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final success = await ticketProvider.deleteTicket(widget.ticketId);
      if (success && mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ticket deleted')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<TicketProvider>(
      builder: (context, ticketProvider, child) {
        if (ticketProvider.isLoading) {
          return Scaffold(
            appBar: AppBar(title: Text('Ticket Details')),
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final ticket = ticketProvider.selectedTicket;
        
        if (ticket == null) {
          return Scaffold(
            appBar: AppBar(title: Text('Ticket Details')),
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 64, color: Colors.red),
                  SizedBox(height: 16),
                  Text('Ticket not found'),
                  SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text('Go Back'),
                  ),
                ],
              ),
            ),
          );
        }

        return Scaffold(
          appBar: AppBar(
            title: Text('Ticket Details'),
            actions: [
              if (!_isEditing)
                IconButton(
                  icon: Icon(Icons.edit),
                  onPressed: () => _toggleEdit(ticket),
                  tooltip: 'Edit',
                ),
              if (!_isEditing)
                IconButton(
                  icon: Icon(Icons.delete),
                  onPressed: () => _deleteTicket(ticketProvider),
                  tooltip: 'Delete',
                ),
              if (_isEditing)
                IconButton(
                  icon: Icon(Icons.check),
                  onPressed: () => _saveChanges(ticketProvider, ticket),
                  tooltip: 'Save',
                ),
              if (_isEditing)
                IconButton(
                  icon: Icon(Icons.close),
                  onPressed: () => setState(() => _isEditing = false),
                  tooltip: 'Cancel',
                ),
            ],
          ),
          body: SingleChildScrollView(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildInfoCard(ticket),
                SizedBox(height: 16),
                _buildStatusCard(ticket),
                SizedBox(height: 16),
                _buildDetailsCard(ticket),
                SizedBox(height: 16),
                _buildNotesCard(ticket, ticketProvider),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildInfoCard(RepairTicket ticket) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Customer Information',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            SizedBox(height: 16),
            _buildInfoRow(Icons.person, 'Name', ticket.customerName),
            SizedBox(height: 8),
            _buildInfoRow(Icons.email, 'Email', ticket.customerEmail),
            SizedBox(height: 8),
            _buildInfoRow(Icons.phone, 'Phone', ticket.customerPhone),
            SizedBox(height: 8),
            _buildInfoRow(Icons.phone_android, 'Device', ticket.deviceModel),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCard(RepairTicket ticket) {
    final dateFormat = DateFormat('MMM d, yyyy HH:mm');
    
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Status',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            SizedBox(height: 16),
            if (_isEditing)
              DropdownButtonFormField<RepairStatus>(
                value: _selectedStatus,
                decoration: InputDecoration(
                  labelText: 'Status',
                  border: OutlineInputBorder(),
                ),
                items: RepairStatus.values.map((status) {
                  return DropdownMenuItem(
                    value: status,
                    child: Text(_getStatusLabel(status)),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedStatus = value;
                  });
                },
              )
            else
              Chip(
                label: Text(
                  _getStatusLabel(ticket.status),
                  style: TextStyle(color: Colors.white),
                ),
                backgroundColor: _getStatusColor(ticket.status),
              ),
            SizedBox(height: 16),
            _buildInfoRow(Icons.calendar_today, 'Created', dateFormat.format(ticket.createdAt)),
            if (ticket.updatedAt != null) ...[
              SizedBox(height: 8),
              _buildInfoRow(Icons.update, 'Updated', dateFormat.format(ticket.updatedAt!)),
            ],
            if (ticket.completedAt != null) ...[
              SizedBox(height: 8),
              _buildInfoRow(Icons.check_circle, 'Completed', dateFormat.format(ticket.completedAt!)),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDetailsCard(RepairTicket ticket) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Repair Details',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            SizedBox(height: 16),
            Text(
              'Issue Description',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            SizedBox(height: 8),
            if (_isEditing)
              TextField(
                controller: _issueController,
                maxLines: 4,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: 'Describe the issue...',
                ),
              )
            else
              Text(ticket.issueDescription),
            SizedBox(height: 16),
            Text(
              'Estimated Cost',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            SizedBox(height: 8),
            if (_isEditing)
              TextField(
                controller: _costController,
                keyboardType: TextInputType.numberWithOptions(decimal: true),
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  prefixText: '\$ ',
                  hintText: '0.00',
                ),
              )
            else
              Text(
                ticket.estimatedCost != null
                    ? '\$${ticket.estimatedCost!.toStringAsFixed(2)}'
                    : 'Not estimated',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Theme.of(context).colorScheme.primary,
                      fontWeight: FontWeight.bold,
                    ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotesCard(RepairTicket ticket, TicketProvider ticketProvider) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Notes',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            SizedBox(height: 16),
            if (ticket.notes.isEmpty)
              Text(
                'No notes yet',
                style: TextStyle(color: Colors.grey),
              )
            else
              ...ticket.notes.asMap().entries.map((entry) {
                return Padding(
                  padding: EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('${entry.key + 1}. ', style: TextStyle(fontWeight: FontWeight.bold)),
                      Expanded(child: Text(entry.value)),
                    ],
                  ),
                );
              }).toList(),
            SizedBox(height: 16),
            TextField(
              controller: _noteController,
              decoration: InputDecoration(
                labelText: 'Add Note',
                border: OutlineInputBorder(),
                suffixIcon: IconButton(
                  icon: Icon(Icons.send),
                  onPressed: () => _addNote(ticketProvider, ticket),
                ),
              ),
              maxLines: 2,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 20, color: Colors.grey),
        SizedBox(width: 8),
        Text(
          '$label: ',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        Expanded(child: Text(value)),
      ],
    );
  }

  String _getStatusLabel(RepairStatus status) {
    switch (status) {
      case RepairStatus.pending:
        return 'Pending';
      case RepairStatus.diagnosed:
        return 'Diagnosed';
      case RepairStatus.inProgress:
        return 'In Progress';
      case RepairStatus.waitingForParts:
        return 'Waiting for Parts';
      case RepairStatus.completed:
        return 'Completed';
      case RepairStatus.cancelled:
        return 'Cancelled';
    }
  }

  Color _getStatusColor(RepairStatus status) {
    switch (status) {
      case RepairStatus.pending:
        return Colors.orange;
      case RepairStatus.diagnosed:
        return Colors.blue;
      case RepairStatus.inProgress:
        return Colors.purple;
      case RepairStatus.waitingForParts:
        return Colors.amber;
      case RepairStatus.completed:
        return Colors.green;
      case RepairStatus.cancelled:
        return Colors.grey;
    }
  }
}
