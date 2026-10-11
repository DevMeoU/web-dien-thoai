<?php

use App\Http\Controllers\API\Admin;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\HealthController;
use App\Http\Controllers\API\User;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class);

/*
|--------------------------------------------------------------------------
| Xác thực (giới hạn tốc độ để chống dò mật khẩu)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function (): void {
    Route::middleware('throttle:20,1')->group(function (): void {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

/*
|--------------------------------------------------------------------------
| Công khai: sản phẩm, danh mục, nội dung, liên hệ
|--------------------------------------------------------------------------
*/
Route::get('/products', [User\ProductController::class, 'index']);
Route::get('/products/{productKey}', [User\ProductController::class, 'show']);
Route::get('/products/{productKey}/related', [User\ProductController::class, 'related']);
Route::get('/products/{productKey}/reviews', [User\ReviewController::class, 'forProduct']);
Route::get('/categories', [User\CatalogController::class, 'categories']);
Route::get('/brands', [User\CatalogController::class, 'brands']);
Route::get('/banners', [User\CatalogController::class, 'banners']);
Route::get('/posts', [User\PostController::class, 'index']);
Route::get('/posts/{slug}', [User\PostController::class, 'show']);
Route::get('/reviews/featured', [User\ReviewController::class, 'featured']);
Route::post('/newsletter', [User\NewsletterController::class, 'subscribe'])->middleware('throttle:10,1');
Route::get('/settings', [User\ContentController::class, 'settings']);
Route::get('/pages', [User\ContentController::class, 'pages']);
Route::get('/pages/{slug}', [User\ContentController::class, 'page']);
Route::post('/contact-requests', [User\ContentController::class, 'contact'])->middleware('throttle:10,1');

/*
|--------------------------------------------------------------------------
| Cần đăng nhập (tài khoản đang hoạt động)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
    Route::get('/me', [User\ProfileController::class, 'show']);
    Route::prefix('profile')->group(function (): void {
        Route::get('/', [User\ProfileController::class, 'show']);
        Route::put('/', [User\ProfileController::class, 'update']);
        Route::put('/password', [User\ProfileController::class, 'changePassword']);
        Route::post('/avatar', [User\ProfileController::class, 'uploadAvatar']);
    });

    Route::apiResource('addresses', User\AddressController::class);
    Route::patch('/addresses/{address}/default', [User\AddressController::class, 'setDefault']);

    Route::get('/cart', [User\CartController::class, 'show']);
    Route::delete('/cart', [User\CartController::class, 'clear']);
    Route::post('/cart/items', [User\CartController::class, 'addItem']);
    Route::put('/cart/items/{item}', [User\CartController::class, 'updateItem']);
    Route::delete('/cart/items/{item}', [User\CartController::class, 'removeItem']);

    Route::get('/wishlist', [User\WishlistController::class, 'index']);
    Route::post('/wishlist', [User\WishlistController::class, 'store']);
    Route::delete('/wishlist/{product}', [User\WishlistController::class, 'destroy']);

    Route::post('/checkout/preview', [User\OrderController::class, 'preview']);
    Route::post('/coupons/validate', [User\OrderController::class, 'validateCoupon']);
    Route::get('/orders', [User\OrderController::class, 'index']);
    Route::post('/orders', [User\OrderController::class, 'store']);
    Route::get('/orders/{code}', [User\OrderController::class, 'show']);
    Route::post('/orders/{code}/cancel', [User\OrderController::class, 'cancel']);

    Route::get('/reviews/mine', [User\ReviewController::class, 'mine']);
    Route::get('/reviews/eligible', [User\ReviewController::class, 'eligible']);
    Route::post('/reviews', [User\ReviewController::class, 'store']);
    Route::put('/reviews/{review}', [User\ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [User\ReviewController::class, 'destroy']);

    /*
    |----------------------------------------------------------------------
    | Quản trị (chỉ vai trò admin)
    |----------------------------------------------------------------------
    */
    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function (): void {
        Route::get('/dashboard', Admin\DashboardController::class);

        Route::apiResource('products', Admin\ProductController::class);
        Route::patch('/products/{product}/status', [Admin\ProductController::class, 'updateStatus']);
        Route::post('/products/{product}/thumbnail', [Admin\ProductController::class, 'uploadThumbnail']);
        Route::post('/products/{product}/images', [Admin\ProductController::class, 'addImage']);
        Route::delete('/products/{product}/images/{image}', [Admin\ProductController::class, 'removeImage']);

        Route::post('/products/{product}/variants', [Admin\InventoryController::class, 'storeVariant']);
        Route::match(['put', 'patch'], '/variants/{variant}', [Admin\InventoryController::class, 'updateVariant']);
        Route::post('/variants/{variant}/image', [Admin\InventoryController::class, 'uploadVariantImage']);
        Route::delete('/variants/{variant}', [Admin\InventoryController::class, 'destroyVariant']);
        Route::get('/inventory', [Admin\InventoryController::class, 'index']);
        Route::patch('/inventory/{variant}', [Admin\InventoryController::class, 'updateStock']);

        Route::apiResource('categories', Admin\CategoryController::class);
        Route::post('/categories/{category}/image', [Admin\CategoryController::class, 'uploadImage']);
        Route::apiResource('brands', Admin\BrandController::class);
        Route::post('/brands/{brand}/image', [Admin\BrandController::class, 'uploadImage']);
        Route::apiResource('posts', Admin\PostController::class);
        Route::post('/posts/{post}/image', [Admin\PostController::class, 'uploadImage']);
        Route::get('/newsletter-subscribers', [Admin\NewsletterSubscriberController::class, 'index']);
        Route::delete('/newsletter-subscribers/{subscriber}', [Admin\NewsletterSubscriberController::class, 'destroy']);
        Route::apiResource('banners', Admin\BannerController::class);
        Route::post('/banners/{banner}/image', [Admin\BannerController::class, 'uploadImage']);

        Route::get('/settings', [Admin\ContentController::class, 'settings']);
        Route::put('/settings', [Admin\ContentController::class, 'updateSettings']);
        Route::get('/pages', [Admin\ContentController::class, 'pages']);
        Route::get('/pages/{slug}', [Admin\ContentController::class, 'page']);
        Route::put('/pages/{slug}', [Admin\ContentController::class, 'updatePage']);

        Route::get('/orders', [Admin\OrderController::class, 'index']);
        Route::get('/orders/{order}', [Admin\OrderController::class, 'show']);
        Route::patch('/orders/{order}/status', [Admin\OrderController::class, 'updateStatus']);
        Route::patch('/orders/{order}/note', [Admin\OrderController::class, 'updateNote']);
        Route::patch('/orders/{order}/payment', [Admin\OrderController::class, 'markPaid']);

        Route::get('/users', [Admin\UserController::class, 'index']);
        Route::get('/users/{user}', [Admin\UserController::class, 'show']);
        Route::patch('/users/{user}/status', [Admin\UserController::class, 'updateStatus']);
        Route::patch('/users/{user}/role', [Admin\UserController::class, 'updateRole']);

        Route::get('/reviews', [Admin\ReviewController::class, 'index']);
        Route::patch('/reviews/{review}/visibility', [Admin\ReviewController::class, 'updateVisibility']);
        Route::post('/reviews/{review}/reply', [Admin\ReviewController::class, 'reply']);

        Route::apiResource('coupons', Admin\CouponController::class);

        Route::get('/contact-requests', [Admin\ContactRequestController::class, 'index']);
        Route::get('/contact-requests/{contact}', [Admin\ContactRequestController::class, 'show']);
        Route::patch('/contact-requests/{contact}', [Admin\ContactRequestController::class, 'update']);

        Route::get('/reports', [Admin\ReportController::class, 'summary']);
        Route::get('/reports/export', [Admin\ReportController::class, 'export']);
    });
});
