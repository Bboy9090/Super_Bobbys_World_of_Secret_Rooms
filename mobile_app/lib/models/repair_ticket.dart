import 'package:json_annotation/json_annotation.dart';

part 'repair_ticket.g.dart';

@JsonSerializable()
class RepairTicket {
  final String id;
  final String customerName;
  final String customerEmail;
  final String customerPhone;
  final String deviceId;
  final String deviceModel;
  final String issueDescription;
  final RepairStatus status;
  final double? estimatedCost;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final DateTime? completedAt;
  final List<String> notes;
  
  RepairTicket({
    required this.id,
    required this.customerName,
    required this.customerEmail,
    required this.customerPhone,
    required this.deviceId,
    required this.deviceModel,
    required this.issueDescription,
    required this.status,
    this.estimatedCost,
    required this.createdAt,
    this.updatedAt,
    this.completedAt,
    this.notes = const [],
  });
  
  factory RepairTicket.fromJson(Map<String, dynamic> json) => 
      _$RepairTicketFromJson(json);
  Map<String, dynamic> toJson() => _$RepairTicketToJson(this);
  
  RepairTicket copyWith({
    String? id,
    String? customerName,
    String? customerEmail,
    String? customerPhone,
    String? deviceId,
    String? deviceModel,
    String? issueDescription,
    RepairStatus? status,
    double? estimatedCost,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? completedAt,
    List<String>? notes,
  }) {
    return RepairTicket(
      id: id ?? this.id,
      customerName: customerName ?? this.customerName,
      customerEmail: customerEmail ?? this.customerEmail,
      customerPhone: customerPhone ?? this.customerPhone,
      deviceId: deviceId ?? this.deviceId,
      deviceModel: deviceModel ?? this.deviceModel,
      issueDescription: issueDescription ?? this.issueDescription,
      status: status ?? this.status,
      estimatedCost: estimatedCost ?? this.estimatedCost,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      completedAt: completedAt ?? this.completedAt,
      notes: notes ?? this.notes,
    );
  }
}

enum RepairStatus {
  pending,
  diagnosed,
  inProgress,
  waitingForParts,
  completed,
  cancelled,
}
