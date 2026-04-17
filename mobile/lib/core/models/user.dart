class AppUser {
  final String id;
  final String username;
  final String email;
  final String userType; // 'renter' | 'provider'
  final String? firstName;
  final String? lastName;
  final String? phone;
  final String? profileImage;
  final double? locationLat;
  final double? locationLng;
  final bool isVerified;
  final bool hasShop;
  final bool isSuperuser;
  final bool isStaff;

  const AppUser({
    required this.id,
    required this.username,
    required this.email,
    required this.userType,
    this.firstName,
    this.lastName,
    this.phone,
    this.profileImage,
    this.locationLat,
    this.locationLng,
    this.isVerified = false,
    this.hasShop = false,
    this.isSuperuser = false,
    this.isStaff = false,
  });

  bool get isProvider => userType == 'provider';
  bool get isRenter => userType == 'renter';
  String get displayName {
    if ((firstName ?? '').isNotEmpty) return firstName!;
    return username;
  }

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id']?.toString() ?? '',
      username: json['username']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      userType: json['user_type']?.toString() ?? 'renter',
      firstName: json['first_name']?.toString(),
      lastName: json['last_name']?.toString(),
      phone: json['phone']?.toString(),
      profileImage: json['profile_image']?.toString(),
      locationLat: (json['location_lat'] as num?)?.toDouble(),
      locationLng: (json['location_lng'] as num?)?.toDouble(),
      isVerified: json['is_verified'] == true,
      hasShop: json['has_shop'] == true,
      isSuperuser: json['is_superuser'] == true,
      isStaff: json['is_staff'] == true,
    );
  }
}
