<?php

namespace App\Models;

use Database\Factories\ProductStockFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['product_id', 'branch_id', 'stock', 'min_stock'])]
class ProductStock extends Model
{
    /** @use HasFactory<ProductStockFactory> */
    use HasFactory;

    protected $table = 'product_stock';

    public $timestamps = false;

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
