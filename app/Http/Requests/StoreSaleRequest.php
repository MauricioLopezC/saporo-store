<?php

namespace App\Http\Requests;

use App\Models\Product;
use App\Models\ProductStock;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'status' => ['required', 'string', 'in:PENDING,COMPLETED'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => [
                'required',
                'numeric',
                'min:0.001',
                function ($attribute, $value, $fail) {
                    $index = explode('.', $attribute)[1];
                    $product = Product::find($this->input("items.{$index}.product_id"));
                    if ($product?->unit?->isInteger() && floor((float) $value) != (float) $value) {
                        $fail("La cantidad para '{$product->unit->label()}' debe ser un número entero.");
                    }
                },
                function ($attribute, $value, $fail) {
                    if ($this->input('status') !== 'COMPLETED') {
                        return;
                    }
                    $index = explode('.', $attribute)[1];
                    $productId = $this->input("items.{$index}.product_id");
                    $branchId = $this->input('branch_id');
                    $available = ProductStock::where('product_id', $productId)
                        ->where('branch_id', $branchId)
                        ->value('stock') ?? 0;
                    if ($value > $available) {
                        $fail("Stock insuficiente. Disponible: {$available}");
                    }
                },
            ],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
