<?php

namespace App\Providers;

use App\Interfaces;
use App\Repositories;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /** Gắn mỗi interface với repository cài đặt tương ứng. */
    private const REPOSITORIES = [
        Interfaces\UserRepositoryInterface::class => Repositories\UserRepository::class,
        Interfaces\CategoryRepositoryInterface::class => Repositories\CategoryRepository::class,
        Interfaces\BrandRepositoryInterface::class => Repositories\BrandRepository::class,
        Interfaces\ProductRepositoryInterface::class => Repositories\ProductRepository::class,
        Interfaces\ProductVariantRepositoryInterface::class => Repositories\ProductVariantRepository::class,
        Interfaces\CartRepositoryInterface::class => Repositories\CartRepository::class,
        Interfaces\WishlistRepositoryInterface::class => Repositories\WishlistRepository::class,
        Interfaces\AddressRepositoryInterface::class => Repositories\AddressRepository::class,
        Interfaces\CouponRepositoryInterface::class => Repositories\CouponRepository::class,
        Interfaces\SettingRepositoryInterface::class => Repositories\SettingRepository::class,
        Interfaces\OrderRepositoryInterface::class => Repositories\OrderRepository::class,
        Interfaces\ReviewRepositoryInterface::class => Repositories\ReviewRepository::class,
        Interfaces\BannerRepositoryInterface::class => Repositories\BannerRepository::class,
        Interfaces\ContentPageRepositoryInterface::class => Repositories\ContentPageRepository::class,
        Interfaces\ContactRequestRepositoryInterface::class => Repositories\ContactRequestRepository::class,
        Interfaces\ReportRepositoryInterface::class => Repositories\ReportRepository::class,
        Interfaces\PostRepositoryInterface::class => Repositories\PostRepository::class,
        Interfaces\NewsletterRepositoryInterface::class => Repositories\NewsletterRepository::class,
    ];

    public function register(): void
    {
        foreach (self::REPOSITORIES as $interface => $repository) {
            $this->app->bind($interface, $repository);
        }
    }

    public function boot(): void
    {
        // Mọi tham số id trên route chỉ nhận số; trả 404 thay vì lỗi 500 khi gửi chữ.
        Route::pattern('category', '[0-9]+');
        Route::pattern('brand', '[0-9]+');
        Route::pattern('banner', '[0-9]+');
        Route::pattern('post', '[0-9]+');
        Route::pattern('subscriber', '[0-9]+');
        Route::pattern('coupon', '[0-9]+');
        Route::pattern('order', '[0-9]+');
        Route::pattern('user', '[0-9]+');
        Route::pattern('review', '[0-9]+');
        Route::pattern('contact', '[0-9]+');
        Route::pattern('address', '[0-9]+');
        Route::pattern('variant', '[0-9]+');
        Route::pattern('item', '[0-9]+');
        Route::pattern('image', '[0-9]+');
        Route::pattern('product', '[0-9]+');

        // Email đặt lại mật khẩu trỏ về trang đặt lại mật khẩu của frontend.
        ResetPassword::createUrlUsing(fn ($user, string $token) => rtrim(config('app.frontend_url'), '/')
            .'/reset-password?token='.$token.'&email='.urlencode($user->getEmailForPasswordReset()));
    }
}
