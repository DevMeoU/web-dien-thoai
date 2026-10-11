<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiScaffoldTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_returns_json(): void
    {
        $this->get('/api/health')->assertOk()->assertJsonPath('data.status', 'ok');
    }

    public function test_public_products_support_search_and_pagination_and_hide_inactive_products(): void
    {
        Product::factory()->create(['name' => 'Áo thun xanh']);
        Product::factory()->create(['name' => 'Áo thun trắng']);
        Product::factory()->hidden()->create(['name' => 'Áo thun ẩn']);
        Product::factory()->create(['name' => 'Quần jeans']);

        $this->getJson('/api/products?search='.urlencode('Áo thun').'&per_page=1')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('meta.total', 2)
            ->assertJsonPath('meta.per_page', 1);
    }

    public function test_product_details_do_not_expose_hidden_products(): void
    {
        $visible = Product::factory()->create(['price' => 199000]);
        $hidden = Product::factory()->hidden()->create();

        $this->getJson('/api/products/'.$visible->id)->assertOk()->assertJsonPath('data.price', '199000.00');
        $this->get('/api/products/'.$hidden->id)->assertNotFound()->assertJsonPath('data', null);
        $this->get('/api/products/999999')->assertNotFound()->assertJsonPath('data', null);
    }

    public function test_invalid_query_parameters_return_422(): void
    {
        $this->get('/api/products?per_page=101&page=0')->assertUnprocessable()->assertJsonValidationErrors(['per_page', 'page']);
    }

    public function test_admin_api_requires_authentication_even_without_accept_header(): void
    {
        $this->get('/api/admin/products')->assertUnauthorized()->assertJsonStructure(['message']);
    }

    public function test_customer_cannot_access_admin_api(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/admin/products')->assertForbidden();
    }

    public function test_admin_can_view_hidden_products(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        Product::factory()->hidden()->create();
        $this->getJson('/api/admin/products')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_profile_returns_only_authenticated_user_and_hides_password(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $this->getJson('/api/me')->assertOk()->assertJsonPath('data.id', $user->id)->assertJsonMissingPath('data.password');
    }

    public function test_unknown_routes_and_non_numeric_ids_return_json_404(): void
    {
        $this->getJson('/api/does-not-exist')->assertNotFound()->assertJsonPath('data', null);
        Sanctum::actingAs(User::factory()->admin()->create());
        $this->getJson('/api/admin/orders/abc')->assertNotFound();
    }
}
