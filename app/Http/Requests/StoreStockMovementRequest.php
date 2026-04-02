<?php

namespace App\Http\Requests;

use App\Enums\StockMovementType;
use App\Models\ProductStock;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreStockMovementRequest extends FormRequest
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
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'type' => ['required', 'string', 'in:IN,ADJUSTMENT'],
            'quantity' => [
                'required',
                'numeric',
                function ($attribute, $value, $fail) {
                    if ((float) $value == 0) {
                        $fail('La cantidad no puede ser cero.');

                        return;
                    }
                    if ($this->input('type') === StockMovementType::In->value && $value < 0) {
                        $fail('La cantidad para una entrada debe ser positiva.');

                        return;
                    }
                    if ($this->input('type') === StockMovementType::Adjustment->value) {
                        $stockExists = ProductStock::where('product_id', $this->input('product_id'))
                            ->where('branch_id', $this->input('branch_id'))
                            ->exists();
                        if (! $stockExists) {
                            $fail('No existe registro de stock para este producto en la sucursal seleccionada.');
                        }
                    }
                },
            ],
            'reason' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'El producto es obligatorio.',
            'branch_id.required' => 'La sucursal es obligatoria.',
            'type.required' => 'El tipo de movimiento es obligatorio.',
            'quantity.required' => 'La cantidad es obligatoria.',
            'reason.required' => 'El motivo es obligatorio.',
        ];
    }
}
