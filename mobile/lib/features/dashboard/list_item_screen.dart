import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_service.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/widgets/brand_button.dart';
import '../../core/widgets/brand_text_field.dart';
import '../../core/widgets/placeholder_screen.dart';
import 'dashboard_screen.dart';

class ListItemScreen extends ConsumerStatefulWidget {
  const ListItemScreen({super.key});

  @override
  ConsumerState<ListItemScreen> createState() => _ListItemScreenState();
}

class _ListItemScreenState extends ConsumerState<ListItemScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _description = TextEditingController();
  final _pricePerDay = TextEditingController();
  final _deposit = TextEditingController();
  final _quantity = TextEditingController(text: '1');

  String? _categoryId;
  String? _shopId;
  List<Map<String, dynamic>> _categories = [];
  List<Map<String, dynamic>> _shops = [];
  final List<File> _images = [];
  bool _loading = true;
  bool _submitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    try {
      final api = ref.read(apiServiceProvider);
      final cats = await api.listCategories();
      final shops = await api.myShops();
      if (!mounted) return;
      setState(() {
        _categories = cats;
        _shops = shops;
        if (shops.isNotEmpty) _shopId = shops.first['id']?.toString();
        if (cats.isNotEmpty) _categoryId = cats.first['id']?.toString();
        _loading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = VaadakaApiClient.describeError(e);
          _loading = false;
        });
      }
    }
  }

  Future<void> _pickImages() async {
    final picker = ImagePicker();
    final picked = await picker.pickMultiImage(imageQuality: 80);
    if (picked.isNotEmpty) {
      setState(() {
        _images.addAll(picked.map((x) => File(x.path)));
      });
    }
  }

  @override
  void dispose() {
    _name.dispose();
    _description.dispose();
    _pricePerDay.dispose();
    _deposit.dispose();
    _quantity.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_shopId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Create a shop on the web first.')),
      );
      return;
    }
    setState(() => _submitting = true);
    try {
      final api = ref.read(apiServiceProvider);
      final qty = int.tryParse(_quantity.text.trim()) ?? 1;
      final tool = await api.createTool({
        'name': _name.text.trim(),
        'description': _description.text.trim(),
        'price_per_day': double.tryParse(_pricePerDay.text.trim()) ?? 0,
        'deposit_amount': double.tryParse(_deposit.text.trim()) ?? 0,
        'quantity_total': qty,
        'quantity_available': qty,
        'category': _categoryId,
        'shop': _shopId,
      });

      for (final f in _images) {
        await api.uploadToolImage(toolId: tool.id, filePath: f.path);
      }

      if (!mounted) return;
      ref.invalidate(providerBookingsProvider);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Item listed!')),
      );
      context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(VaadakaApiClient.describeError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);

    return Scaffold(
      backgroundColor: palette.bgPrimary,
      appBar: BrandAppBar(
        title: 'List Item',
        leading: IconButton(
          icon: Icon(LucideIcons.arrowLeft, color: palette.textPrimary, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? EmptyStateView(
                  icon: LucideIcons.alertTriangle,
                  title: 'Failed to load',
                  subtitle: _error!,
                )
              : Form(
                  key: _formKey,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      BrandTextField(
                        controller: _name,
                        label: 'Name',
                        hint: 'Cordless Drill',
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                      ),
                      const SizedBox(height: 14),
                      BrandTextField(
                        controller: _description,
                        label: 'Description',
                        hint: 'Condition, accessories, notes...',
                        maxLines: 3,
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: BrandTextField(
                              controller: _pricePerDay,
                              label: '₹ / Day',
                              hint: '50',
                              keyboardType: TextInputType.number,
                              validator: (v) => (double.tryParse(v ?? '') ?? 0) > 0 ? null : 'Required',
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: BrandTextField(
                              controller: _deposit,
                              label: 'Deposit',
                              hint: '500',
                              keyboardType: TextInputType.number,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      BrandTextField(
                        controller: _quantity,
                        label: 'Quantity',
                        hint: '1',
                        keyboardType: TextInputType.number,
                      ),
                      const SizedBox(height: 14),
                      if (_categories.isNotEmpty) _dropdown(
                        label: 'CATEGORY',
                        value: _categoryId,
                        items: _categories,
                        onChanged: (v) => setState(() => _categoryId = v),
                        palette: palette,
                      ),
                      const SizedBox(height: 14),
                      if (_shops.isNotEmpty) _dropdown(
                        label: 'SHOP',
                        value: _shopId,
                        items: _shops,
                        onChanged: (v) => setState(() => _shopId = v),
                        palette: palette,
                      ),
                      const SizedBox(height: 18),
                      _imagesSection(palette),
                      const SizedBox(height: 24),
                      BrandButton(
                        label: _submitting ? 'Publishing...' : 'Publish Listing',
                        icon: LucideIcons.upload,
                        onPressed: _submitting ? null : _submit,
                        loading: _submitting,
                        expand: true,
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
    );
  }

  Widget _dropdown({
    required String label,
    required String? value,
    required List<Map<String, dynamic>> items,
    required ValueChanged<String?> onChanged,
    required VaadakaPalette palette,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.barlow(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: palette.textMuted,
            letterSpacing: 2,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: palette.bgSurface2,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: palette.border),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              isExpanded: true,
              dropdownColor: palette.bgSurface,
              iconEnabledColor: palette.textMuted,
              style: GoogleFonts.barlow(
                fontSize: 14,
                color: palette.textPrimary,
                fontWeight: FontWeight.w600,
              ),
              items: items.map((item) {
                return DropdownMenuItem<String>(
                  value: item['id']?.toString(),
                  child: Text(item['name']?.toString() ?? ''),
                );
              }).toList(),
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }

  Widget _imagesSection(VaadakaPalette palette) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'PHOTOS',
          style: GoogleFonts.barlow(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: palette.textMuted,
            letterSpacing: 2,
          ),
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: [
            ..._images.asMap().entries.map((e) {
              return Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.file(
                      e.value,
                      width: 84,
                      height: 84,
                      fit: BoxFit.cover,
                    ),
                  ),
                  Positioned(
                    top: 2,
                    right: 2,
                    child: InkWell(
                      onTap: () => setState(() => _images.removeAt(e.key)),
                      child: Container(
                        decoration: const BoxDecoration(
                          color: Colors.black87,
                          shape: BoxShape.circle,
                        ),
                        padding: const EdgeInsets.all(4),
                        child: const Icon(LucideIcons.x, size: 12, color: Colors.white),
                      ),
                    ),
                  ),
                ],
              );
            }),
            InkWell(
              onTap: _pickImages,
              borderRadius: BorderRadius.circular(8),
              child: Container(
                width: 84,
                height: 84,
                decoration: BoxDecoration(
                  color: palette.bgSurface2,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: palette.border, style: BorderStyle.solid),
                ),
                alignment: Alignment.center,
                child: Icon(LucideIcons.plus, color: palette.textMuted, size: 24),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
