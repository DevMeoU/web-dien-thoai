<?php

// Update only bundled catalog image paths; preserve uploads, stock and other data.
require __DIR__.'/../backend/vendor/autoload.php';
$app = require __DIR__.'/../backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$root = realpath(__DIR__.'/../frontend/public');
$columns = ['products' => 'thumbnail', 'product_variants' => 'image', 'product_images' => 'url', 'banners' => 'image', 'posts' => 'image'];
$changes = [];
$missing = [];
foreach ($columns as $table => $column) {
    foreach (Illuminate\Support\Facades\DB::table($table)->select('id', $column)->get() as $row) {
        $path = $row->{$column};
        if (!is_string($path) || !preg_match('~^/images/(products|home)/[a-z0-9-]+\.svg$~', $path)) {
            continue;
        }
        $replacement = substr($path, 0, -4).'.png';
        if (!is_file($root.$replacement)) {
            $missing[] = $replacement;
            continue;
        }
        $changes[] = compact('table', 'column', 'replacement') + ['id' => $row->id];
    }
}
// Replace only assets with an existing PNG, including the requested AirPods Pro photo.
Illuminate\Support\Facades\DB::transaction(function () use ($changes): void {
    foreach ($changes as $change) {
        Illuminate\Support\Facades\DB::table($change['table'])->where('id', $change['id'])->update([$change['column'] => $change['replacement']]);
    }
});
echo 'Updated '.count($changes).' bundled image paths; kept '.count(array_unique($missing))." legacy asset paths without a new photo.\n";
