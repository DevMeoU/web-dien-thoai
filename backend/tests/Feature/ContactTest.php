<?php

namespace Tests\Feature;

use App\Models\ContactRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesShopData;
use Tests\TestCase;

class ContactTest extends TestCase
{
    use CreatesShopData, RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return ['name' => 'Lan Anh', 'email' => 'lan@example.com', 'phone' => '0912345678', 'message' => 'Tôi cần đổi màu iPhone.', ...$overrides];
    }

    public function test_anyone_can_send_a_support_request_with_optional_order_code(): void
    {
        $this->postJson('/api/contact-requests', $this->payload(['order_code' => 'MLA251008-ABCDE']))
            ->assertCreated()->assertJsonPath('data.status', 'new')->assertJsonPath('data.order_code', 'MLA251008-ABCDE')
            ->assertJsonMissingPath('data.admin_note');

        $this->assertDatabaseCount('contact_requests', 1);
    }

    public function test_support_request_validates_input_before_saving(): void
    {
        $this->postJson('/api/contact-requests', [])->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'message']);
        $this->postJson('/api/contact-requests', $this->payload(['email' => 'not-an-email']))->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->postJson('/api/contact-requests', $this->payload(['phone' => '12']))->assertUnprocessable()->assertJsonValidationErrors('phone');
        $this->postJson('/api/contact-requests', $this->payload(['message' => 'ok']))->assertUnprocessable()->assertJsonValidationErrors('message');
        $this->assertDatabaseCount('contact_requests', 0);
    }

    public function test_admin_can_search_filter_and_update_request_status_and_note(): void
    {
        ContactRequest::factory()->create(['name' => 'Lan Anh', 'message' => 'Đổi màu', 'order_code' => 'MLA1']);
        $second = ContactRequest::factory()->create(['name' => 'Minh', 'status' => 'processing']);
        $this->actingAsAdmin();

        $this->getJson('/api/admin/contact-requests')->assertJsonCount(2, 'data');
        $this->getJson('/api/admin/contact-requests?status=processing')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Minh');
        $this->getJson('/api/admin/contact-requests?q=MLA1')->assertJsonCount(1, 'data');

        $this->patchJson("/api/admin/contact-requests/{$second->id}", ['status' => 'resolved', 'admin_note' => 'Đã gọi lại khách'])
            ->assertOk()->assertJsonPath('data.status', 'resolved')->assertJsonPath('data.admin_note', 'Đã gọi lại khách');
        $this->patchJson("/api/admin/contact-requests/{$second->id}", ['status' => 'bogus'])->assertUnprocessable();
        $this->getJson("/api/admin/contact-requests/{$second->id}")->assertOk();
    }

    public function test_request_management_requires_admin(): void
    {
        $this->actingAsCustomer();
        $this->getJson('/api/admin/contact-requests')->assertForbidden();
    }
}
