<?php

namespace Tests\Feature;

use App\Models\Address;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesShopData;
use Tests\TestCase;

class AddressTest extends TestCase
{
    use CreatesShopData, RefreshDatabase;

    public function test_first_address_becomes_default_and_default_can_be_switched(): void
    {
        $this->actingAsCustomer();

        $first = $this->postJson('/api/addresses', $this->addressPayload())->assertCreated()->assertJsonPath('data.is_default', true)->json('data.id');
        $second = $this->postJson('/api/addresses', $this->addressPayload(['line' => '5 Nguyễn Huệ']))->assertCreated()->assertJsonPath('data.is_default', false)->json('data.id');

        $this->patchJson("/api/addresses/{$second}/default")->assertOk()->assertJsonPath('data.is_default', true);
        $this->assertDatabaseHas('addresses', ['id' => $first, 'is_default' => false]);
        $this->assertSame(1, Address::query()->where('is_default', true)->count());
        $this->getJson('/api/addresses')->assertJsonPath('data.0.id', $second);
    }

    public function test_deleting_the_default_address_promotes_another_one(): void
    {
        $user = $this->actingAsCustomer();
        $first = $this->postJson('/api/addresses', $this->addressPayload())->json('data.id');
        $second = $this->postJson('/api/addresses', $this->addressPayload(['line' => 'B']))->json('data.id');

        $this->deleteJson("/api/addresses/{$first}")->assertOk();
        $this->assertDatabaseHas('addresses', ['id' => $second, 'is_default' => true]);
        $this->assertSame(1, $user->addresses()->count());
    }

    public function test_address_update_validates_required_fields_and_vietnamese_phone(): void
    {
        $this->actingAsCustomer();
        $id = $this->postJson('/api/addresses', $this->addressPayload())->json('data.id');

        $this->postJson('/api/addresses', ['recipient_name' => 'A'])->assertUnprocessable()->assertJsonValidationErrors(['phone', 'city', 'district', 'ward', 'line']);
        $this->putJson("/api/addresses/{$id}", ['phone' => '12345'])->assertUnprocessable()->assertJsonValidationErrors('phone');
        $this->putJson("/api/addresses/{$id}", ['line' => '99 Hai Bà Trưng', 'phone' => '0912 345 678'])
            ->assertOk()->assertJsonPath('data.line', '99 Hai Bà Trưng')->assertJsonPath('data.phone', '0912345678');
    }

    public function test_customers_cannot_read_or_change_other_peoples_addresses(): void
    {
        $this->actingAsCustomer();
        $mine = $this->postJson('/api/addresses', $this->addressPayload())->json('data.id');

        $this->actingAsCustomer();
        $this->getJson("/api/addresses/{$mine}")->assertNotFound();
        $this->putJson("/api/addresses/{$mine}", ['line' => 'X'])->assertNotFound();
        $this->deleteJson("/api/addresses/{$mine}")->assertNotFound();
        $this->getJson('/api/addresses')->assertJsonCount(0, 'data');
    }
}
