<?php

namespace App\Http\Requests;

use App\Models\ProductStock;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSaleRequest extends FormRequest
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
            'status' => [
                'required',
                'string',
                'in:PENDING,COMPLETED,CANCELLED',
                function ($attribute, $value, $fail) {
                    if ($value !== 'COMPLETED') {
                        return;
                    }
                    $sale = $this->route('sale');
                    if ($sale->status->value !== 'PENDING') {
                        return;
                    }
                    $sale->loadMissing('items');
                    foreach ($sale->items as $item) {
                        $available = ProductStock::where('product_id', $item->product_id)
                            ->where('branch_id', $sale->branch_id)
                            ->value('stock') ?? 0;
                        if ($item->quantity > $available) {
                            $productName = $item->product?->name ?? "Producto #{$item->product_id}";
                            $fail("Stock insuficiente para '{$productName}'. Disponible: {$available}");

                            return;
                        }
                    }
                },
            ],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
