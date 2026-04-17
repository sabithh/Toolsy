class Tool {
  final String id;
  final String name;
  final String? description;
  final double pricePerHour;
  final double? pricePerDay;
  final double? depositAmount;
  final int quantityAvailable;
  final int quantityTotal;
  final String? condition;
  final String? image;
  final List<String> images;
  final Map<String, dynamic>? category;
  final Map<String, dynamic>? shop;
  final bool isActive;
  final double? averageRating;
  final int? reviewCount;
  final DateTime? createdAt;

  const Tool({
    required this.id,
    required this.name,
    this.description,
    required this.pricePerHour,
    this.pricePerDay,
    this.depositAmount,
    required this.quantityAvailable,
    required this.quantityTotal,
    this.condition,
    this.image,
    this.images = const [],
    this.category,
    this.shop,
    this.isActive = true,
    this.averageRating,
    this.reviewCount,
    this.createdAt,
  });

  String? get primaryImage {
    if (image != null && image!.isNotEmpty) return image;
    if (images.isNotEmpty) return images.first;
    return null;
  }

  String? get categoryName => category?['name']?.toString();
  String? get shopName => shop?['name']?.toString();

  factory Tool.fromJson(Map<String, dynamic> json) {
    final imgs = <String>[];
    final imagesJson = json['images'];
    if (imagesJson is List) {
      for (final it in imagesJson) {
        if (it is Map && it['image'] != null) imgs.add(it['image'].toString());
        if (it is String) imgs.add(it);
      }
    }
    return Tool(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Untitled',
      description: json['description']?.toString(),
      pricePerHour: _toDouble(json['price_per_hour']) ?? 0,
      pricePerDay: _toDouble(json['price_per_day']),
      depositAmount: _toDouble(json['deposit_amount']),
      quantityAvailable: (json['quantity_available'] as num?)?.toInt() ?? 0,
      quantityTotal: (json['quantity_total'] as num?)?.toInt() ?? 0,
      condition: json['condition']?.toString(),
      image: json['image']?.toString(),
      images: imgs,
      category: json['category'] is Map ? Map<String, dynamic>.from(json['category']) : null,
      shop: json['shop'] is Map ? Map<String, dynamic>.from(json['shop']) : null,
      isActive: json['is_active'] != false,
      averageRating: _toDouble(json['average_rating']),
      reviewCount: (json['review_count'] as num?)?.toInt(),
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
    );
  }
}

class Booking {
  final String id;
  final Map<String, dynamic>? tool;
  final Map<String, dynamic>? shop;
  final Map<String, dynamic>? renter;
  final int quantity;
  final DateTime? startDatetime;
  final DateTime? endDatetime;
  final double? totalAmount;
  final double? depositAmount;
  final double? rentalPrice;
  final String status;
  final String paymentStatus;
  final String paymentMethod;
  final String? razorpayOrderId;
  final String? notes;
  final DateTime? createdAt;

  const Booking({
    required this.id,
    this.tool,
    this.shop,
    this.renter,
    this.quantity = 1,
    this.startDatetime,
    this.endDatetime,
    this.totalAmount,
    this.depositAmount,
    this.rentalPrice,
    this.status = 'pending',
    this.paymentStatus = 'pending',
    this.paymentMethod = 'razorpay',
    this.razorpayOrderId,
    this.notes,
    this.createdAt,
  });

  String? get toolName => tool?['name']?.toString();
  String? get shopName => shop?['name']?.toString();
  String? get renterName {
    final r = renter;
    if (r == null) return null;
    final fn = r['first_name']?.toString() ?? '';
    if (fn.isNotEmpty) return fn;
    return r['username']?.toString();
  }

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id']?.toString() ?? '',
      tool: json['tool'] is Map ? Map<String, dynamic>.from(json['tool']) : null,
      shop: json['shop'] is Map ? Map<String, dynamic>.from(json['shop']) : null,
      renter: json['renter'] is Map ? Map<String, dynamic>.from(json['renter']) : null,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      startDatetime: DateTime.tryParse(json['start_datetime']?.toString() ?? ''),
      endDatetime: DateTime.tryParse(json['end_datetime']?.toString() ?? ''),
      totalAmount: _toDouble(json['total_amount']),
      depositAmount: _toDouble(json['deposit_amount']),
      rentalPrice: _toDouble(json['rental_price']),
      status: json['status']?.toString() ?? 'pending',
      paymentStatus: json['payment_status']?.toString() ?? 'pending',
      paymentMethod: json['payment_method']?.toString() ?? 'razorpay',
      razorpayOrderId: json['razorpay_order_id']?.toString(),
      notes: json['notes']?.toString(),
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
    );
  }
}

class ChatRoomSummary {
  final String id;
  final String bookingId;
  final String? itemName;
  final String? lastMessage;
  final DateTime? lastMessageTime;
  final int unreadCount;
  final String? bookingStatus;

  const ChatRoomSummary({
    required this.id,
    required this.bookingId,
    this.itemName,
    this.lastMessage,
    this.lastMessageTime,
    this.unreadCount = 0,
    this.bookingStatus,
  });

  factory ChatRoomSummary.fromJson(Map<String, dynamic> json) {
    final booking = json['booking'] is Map ? json['booking'] : null;
    final tool = json['tool'] is Map ? json['tool'] : null;
    return ChatRoomSummary(
      id: json['id']?.toString() ?? '',
      bookingId: json['booking_id']?.toString() ?? '',
      itemName: json['item_name']?.toString() ?? tool?['name']?.toString(),
      lastMessage: json['last_message']?.toString(),
      lastMessageTime: DateTime.tryParse(json['last_message_time']?.toString() ?? ''),
      unreadCount: (json['unread_count'] as num?)?.toInt() ?? 0,
      bookingStatus: booking?['status']?.toString(),
    );
  }
}

class ChatMessage {
  final String id;
  final String message;
  final String senderId;
  final String senderUsername;
  final DateTime createdAt;

  const ChatMessage({
    required this.id,
    required this.message,
    required this.senderId,
    required this.senderUsername,
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    final sender = json['sender'];
    return ChatMessage(
      id: json['id']?.toString() ?? '',
      message: json['message']?.toString() ?? '',
      senderId: (sender is Map ? sender['id']?.toString() : null) ?? '',
      senderUsername: (sender is Map ? sender['username']?.toString() : null) ?? '',
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? '') ?? DateTime.now(),
    );
  }
}

double? _toDouble(dynamic v) {
  if (v == null) return null;
  if (v is num) return v.toDouble();
  return double.tryParse(v.toString());
}
