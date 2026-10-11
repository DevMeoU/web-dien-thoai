<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ContactStatusRequest;
use App\Http\Requests\ListRequest;
use App\Http\Resources\ContactRequestResource;
use App\Services\ContactRequestService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ContactRequestController extends Controller
{
    public function __construct(private readonly ContactRequestService $contacts) {}

    public function index(ListRequest $request): AnonymousResourceCollection
    {
        return ContactRequestResource::collection($this->contacts->list($request->validated()));
    }

    public function show(int $contact): ContactRequestResource
    {
        return new ContactRequestResource($this->contacts->find($contact));
    }

    public function update(ContactStatusRequest $request, int $contact): ContactRequestResource
    {
        return new ContactRequestResource($this->contacts->update($contact, $request->validated()));
    }
}
