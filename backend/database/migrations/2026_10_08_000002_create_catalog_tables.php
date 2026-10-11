<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('brands', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->string('code', 50)->nullable()->unique();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('compare_at_price', 12, 2)->nullable();
            $table->string('thumbnail')->nullable();
            // Thông tin riêng của sản phẩm công nghệ: khẩu hiệu, tính năng nổi bật, thông số kỹ thuật,
            // phụ kiện trong hộp và bảo hành. specs là danh sách {label, value}; highlights là danh sách chuỗi.
            $table->string('tagline', 160)->nullable();
            $table->string('option_label', 30)->default('Cấu hình');
            $table->json('highlights')->nullable();
            $table->json('specs')->nullable();
            $table->text('in_the_box')->nullable();
            $table->string('warranty')->nullable();
            // Nhóm hiển thị theo nhu cầu (học tập, công việc, sáng tạo...).
            $table->json('collections')->nullable();
            // active: đang bán, hidden: tạm ẩn, discontinued: ngừng bán.
            $table->string('status', 20)->default('active')->index();
            $table->boolean('is_new')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedInteger('rating_count')->default(0);
        });

        DB::table('products')->where('is_active', false)->update(['status' => 'hidden']);

        Schema::table('products', function (Blueprint $table): void {
            // Tồn kho được quản lý theo từng phiên bản (dung lượng/cấu hình, màu) trong product_variants.
            $table->dropColumn(['stock', 'is_active']);
        });

        Schema::create('product_images', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('url');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('product_variants', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('sku', 60)->unique();
            // Dung lượng hoặc cấu hình, ví dụ 256GB, 16GB / 512GB, 45mm; nhãn hiển thị lấy từ products.option_label.
            $table->string('configuration', 60)->nullable();
            $table->string('color', 40)->nullable();
            $table->string('color_hex', 9)->nullable();
            $table->decimal('price', 12, 2)->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['product_id', 'configuration', 'color']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('product_images');

        Schema::table('products', function (Blueprint $table): void {
            $table->unsignedInteger('stock')->default(0);
            $table->boolean('is_active')->default(true);
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('category_id');
            $table->dropConstrainedForeignId('brand_id');
            $table->dropColumn(['code', 'compare_at_price', 'thumbnail', 'tagline', 'option_label', 'highlights', 'specs', 'in_the_box', 'warranty', 'collections', 'status', 'is_new', 'is_featured', 'rating_avg', 'rating_count']);
        });

        Schema::dropIfExists('brands');
        Schema::dropIfExists('categories');
    }
};
