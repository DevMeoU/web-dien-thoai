<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $table): void {
            // hero: banner đầu trang chủ; collection: các thẻ bộ sưu tập bên dưới.
            $table->string('position', 20)->default('hero')->after('link')->index();
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table): void {
            $table->dropColumn('position');
        });
    }
};
