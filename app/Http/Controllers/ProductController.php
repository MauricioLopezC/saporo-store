<?php

namespace App\Http\Controllers;

use App\Enums\ProductUnit;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('products/index', [
            'products' => Product::query()
                ->with('category:id,name', 'supplier:id,name')
                ->orderBy('name')
                ->paginate(20)
                ->withQueryString(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('products/create', [
            'categories' => Category::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'suppliers' => Supplier::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'units' => collect(ProductUnit::cases())->map(fn ($u) => ['value' => $u->value, 'label' => $u->label()]),
            'nextProductCount' => Product::withTrashed()->count() + 1,
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if (empty($data['sku'])) {
            $data['sku'] = $this->generateSku((int) $data['category_id']);
        }

        Product::create($data);

        return to_route('products.index')
            ->with('success', 'Producto creado correctamente.');
    }

    public function show(Product $product): Response
    {
        return Inertia::render('products/show', [
            'product' => $product->load('category:id,name', 'supplier:id,name'),
        ]);
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('products/edit', [
            'product' => $product,
            'categories' => Category::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'suppliers' => Supplier::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'units' => collect(ProductUnit::cases())->map(fn ($u) => ['value' => $u->value, 'label' => $u->label()]),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->validated());

        return to_route('products.index')
            ->with('success', 'Producto actualizado correctamente.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return to_route('products.index')
            ->with('success', 'Producto eliminado correctamente.');
    }

    private function generateSku(int $categoryId): string
    {
        $category = Category::find($categoryId);
        $prefix = $this->deriveCategoryPrefix($category?->name ?? 'PROD');
        $count = Product::withTrashed()->where('category_id', $categoryId)->count() + 1;

        return $prefix.'-'.str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    private function deriveCategoryPrefix(string $name): string
    {
        // Strip accents
        $name = str_replace(
            ['á', 'é', 'í', 'ó', 'ú', 'Á', 'É', 'Í', 'Ó', 'Ú', 'ñ', 'Ñ', 'ü', 'Ü'],
            ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U', 'n', 'N', 'u', 'U'],
            $name
        );

        $words = preg_split('/\s+/', trim($name));

        if (count($words) > 1) {
            // Multi-word: first letter of each word (up to 4)
            $initials = implode('', array_map(
                fn ($w) => strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $w), 0, 1)),
                $words
            ));

            return substr($initials, 0, 4) ?: 'PROD';
        }

        // Single word: first 4 letters
        $clean = strtoupper(preg_replace('/[^a-zA-Z]/', '', $name));

        return substr($clean, 0, 4) ?: 'PROD';
    }
}
