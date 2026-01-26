import 'package:flutter/foundation.dart';
import '../models/repair_ticket.dart';
import '../services/api_service.dart';

class TicketProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<RepairTicket> _tickets = [];
  RepairTicket? _selectedTicket;
  bool _isLoading = false;
  String? _error;
  
  List<RepairTicket> get tickets => _tickets;
  RepairTicket? get selectedTicket => _selectedTicket;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  // Get tickets by status
  List<RepairTicket> getTicketsByStatus(RepairStatus status) {
    return _tickets.where((ticket) => ticket.status == status).toList();
  }
  
  // Load all tickets
  Future<void> loadTickets() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      _tickets = await _apiService.getTickets();
      _error = null;
    } catch (e) {
      _error = e.toString();
      _tickets = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  // Load single ticket
  Future<void> loadTicket(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      _selectedTicket = await _apiService.getTicket(id);
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  // Create ticket
  Future<bool> createTicket(RepairTicket ticket) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final newTicket = await _apiService.createTicket(ticket);
      _tickets.add(newTicket);
      _error = null;
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  // Update ticket
  Future<bool> updateTicket(String id, RepairTicket ticket) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final updatedTicket = await _apiService.updateTicket(id, ticket);
      final index = _tickets.indexWhere((t) => t.id == id);
      if (index != -1) {
        _tickets[index] = updatedTicket;
      }
      if (_selectedTicket?.id == id) {
        _selectedTicket = updatedTicket;
      }
      _error = null;
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  // Delete ticket
  Future<bool> deleteTicket(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      await _apiService.deleteTicket(id);
      _tickets.removeWhere((ticket) => ticket.id == id);
      if (_selectedTicket?.id == id) {
        _selectedTicket = null;
      }
      _error = null;
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  void selectTicket(RepairTicket ticket) {
    _selectedTicket = ticket;
    notifyListeners();
  }
  
  void clearSelection() {
    _selectedTicket = null;
    notifyListeners();
  }
}
