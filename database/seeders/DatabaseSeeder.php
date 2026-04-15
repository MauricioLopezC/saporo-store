<?php

namespace Database\Seeders;

use App\Enums\ProductUnit;
use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Usuario administrador
        User::updateOrCreate(
            ['email' => config('admin.email')],
            [
                'name' => config('admin.name'),
                'password' => Hash::make(config('admin.password')),
                'role' => UserRole::Admin,
                'email_verified_at' => now(),
            ]
        );

        // Sucursal
        $branch = Branch::firstOrCreate(
            ['name' => 'Sucursal Floresta'],
            [
                'address' => 'Mariano Saravia 2020',
                'phone' => '011-4567-8900',
                'is_active' => true,
            ]
        );

        // Proveedores
        $herramientas = Supplier::firstOrCreate(
            ['name' => 'Herramientas del Plata S.A.'],
            [
                'contact_name' => 'Diego Acosta',
                'email' => 'ventas@herramientasdelplata.com.ar',
                'phone' => '011-4312-5500',
                'address' => 'Av. Corrientes 3800, CABA',
                'is_active' => true,
            ]
        );

        $materialesSur = Supplier::firstOrCreate(
            ['name' => 'Materiales del Sur SRL'],
            [
                'contact_name' => 'Patricia Vega',
                'email' => 'pedidos@materialesdelsur.com.ar',
                'phone' => '011-4758-2233',
                'address' => 'Ruta 3 km 18, Lanús',
                'is_active' => true,
            ]
        );

        $distribuidoraFerro = Supplier::firstOrCreate(
            ['name' => 'Distribuidora Ferro S.A.'],
            [
                'contact_name' => 'Gustavo Romero',
                'email' => 'comercial@distribuidoraferro.com.ar',
                'phone' => '011-4891-7744',
                'address' => 'Calle Mosconi 560, Avellaneda',
                'is_active' => true,
            ]
        );

        // Categorías
        $catHerramientas = Category::firstOrCreate(
            ['name' => 'Herramientas manuales'],
            ['description' => 'Martillos, destornilladores, alicates, llaves y herramientas de mano', 'is_active' => true]
        );

        $catElectrica = Category::firstOrCreate(
            ['name' => 'Herramientas eléctricas'],
            ['description' => 'Taladros, amoladoras, sierras eléctricas y accesorios', 'is_active' => true]
        );

        $catFijacion = Category::firstOrCreate(
            ['name' => 'Fijación y tornillería'],
            ['description' => 'Tornillos, bulones, tuercas, clavos y elementos de fijación', 'is_active' => true]
        );

        $catPintura = Category::firstOrCreate(
            ['name' => 'Pintura y accesorios'],
            ['description' => 'Pinturas, esmaltes, rodillos, pinceles y diluyentes', 'is_active' => true]
        );

        $catPlomeria = Category::firstOrCreate(
            ['name' => 'Plomería'],
            ['description' => 'Cañerías, conexiones, llaves de paso y accesorios sanitarios', 'is_active' => true]
        );

        $catElectricidad = Category::firstOrCreate(
            ['name' => 'Electricidad'],
            ['description' => 'Cables, tomacorrientes, llaves de luz, tableros y accesorios eléctricos', 'is_active' => true]
        );

        // Productos con stock inicial
        $products = [
            // Herramientas manuales
            [
                'sku' => 'HM-001',
                'name' => 'Martillo carpintero 500g',
                'description' => 'Martillo de carpintero con mango de fibra 500 gramos',
                'price' => 8500.00,
                'cost' => 5800.00,
                'unit' => ProductUnit::Unidad,
                'category_id' => $catHerramientas->id,
                'supplier_id' => $herramientas->id,
                'stock' => 30,
                'min_stock' => 8,
            ],
            [
                'sku' => 'HM-002',
                'name' => 'Destornillador Phillips N°2',
                'description' => 'Destornillador Phillips número 2 mango bimateria',
                'price' => 2800.00,
                'cost' => 1700.00,
                'unit' => ProductUnit::Unidad,
                'category_id' => $catHerramientas->id,
                'supplier_id' => $herramientas->id,
                'stock' => 50,
                'min_stock' => 15,
            ],
            [
                'sku' => 'HM-003',
                'name' => 'Alicate universal 8"',
                'description' => 'Alicate universal de 8 pulgadas con mango aislado',
                'price' => 6200.00,
                'cost' => 4100.00,
                'unit' => ProductUnit::Unidad,
                'category_id' => $catHerramientas->id,
                'supplier_id' => $herramientas->id,
                'stock' => 25,
                'min_stock' => 6,
            ],
            [
                'sku' => 'HM-004',
                'name' => 'Llave inglesa 12"',
                'description' => 'Llave inglesa ajustable de 12 pulgadas',
                'price' => 9800.00,
                'cost' => 6500.00,
                'unit' => ProductUnit::Unidad,
                'category_id' => $catHerramientas->id,
                'supplier_id' => $herramientas->id,
                'stock' => 18,
                'min_stock' => 5,
            ],
            [
                'sku' => 'HM-005',
                'name' => 'Sierra de arco 12"',
                'description' => 'Sierra de arco manual con hoja 12 pulgadas 24 dientes',
                'price' => 5500.00,
                'cost' => 3600.00,
                'unit' => ProductUnit::Unidad,
                'category_id' => $catHerramientas->id,
                'supplier_id' => $herramientas->id,
                'stock' => 20,
                'min_stock' => 5,
            ],
            // Herramientas eléctricas
            [
                'sku' => 'HE-001',
                'name' => 'Taladro percutor 750W',
                'description' => 'Taladro percutor 750W con maletín y accesorios',
                'price' => 68000.00,
                'cost' => 48000.00,
                'unit' => ProductUnit::Unidad,
                'category_id' => $catElectrica->id,
                'supplier_id' => $herramientas->id,
                'stock' => 10,
                'min_stock' => 3,
            ],
            [
                'sku' => 'HE-002',
                'name' => 'Amoladora angular 115mm',
                'description' => 'Amoladora angular 850W disco 115mm',
                'price' => 52000.00,
                'cost' => 36000.00,
                'unit' => ProductUnit::Unidad,
                'category_id' => $catElectrica->id,
                'supplier_id' => $herramientas->id,
                'stock' => 8,
                'min_stock' => 2,
            ],
            [
                'sku' => 'HE-003',
                'name' => 'Atornillador inalámbrico 12V',
                'description' => 'Atornillador inalámbrico 12V con batería de litio y cargador',
                'price' => 45000.00,
                'cost' => 31000.00,
                'unit' => ProductUnit::Unidad,
                'category_id' => $catElectrica->id,
                'supplier_id' => $herramientas->id,
                'stock' => 12,
                'min_stock' => 3,
            ],
            // Fijación y tornillería
            [
                'sku' => 'FT-001',
                'name' => 'Tornillo autoperforante 6x1" (caja x100)',
                'description' => 'Tornillo autoperforante cabeza hexagonal 6x1 pulgada caja por 100 unidades',
                'price' => 3200.00,
                'cost' => 1900.00,
                'unit' => ProductUnit::Caja,
                'category_id' => $catFijacion->id,
                'supplier_id' => $distribuidoraFerro->id,
                'stock' => 60,
                'min_stock' => 15,
            ],
            [
                'sku' => 'FT-002',
                'name' => 'Clavo común 2" (kg)',
                'description' => 'Clavo de acero común 2 pulgadas por kilogramo',
                'price' => 1800.00,
                'cost' => 1100.00,
                'unit' => ProductUnit::Kilogramo,
                'category_id' => $catFijacion->id,
                'supplier_id' => $distribuidoraFerro->id,
                'stock' => 40,
                'min_stock' => 10,
            ],
            [
                'sku' => 'FT-003',
                'name' => 'Bulón galvanizado M8x50 (caja x50)',
                'description' => 'Bulón con tuerca galvanizado M8x50mm caja por 50 unidades',
                'price' => 4500.00,
                'cost' => 2900.00,
                'unit' => ProductUnit::Caja,
                'category_id' => $catFijacion->id,
                'supplier_id' => $distribuidoraFerro->id,
                'stock' => 35,
                'min_stock' => 8,
            ],
            [
                'sku' => 'FT-004',
                'name' => 'Taco fisher S6 (bolsa x100)',
                'description' => 'Taco de nylon fisher S6 bolsa por 100 unidades',
                'price' => 2100.00,
                'cost' => 1300.00,
                'unit' => ProductUnit::Unidad,
                'category_id' => $catFijacion->id,
                'supplier_id' => $distribuidoraFerro->id,
                'stock' => 80,
                'min_stock' => 20,
            ],
            // Pintura
            [
                'sku' => 'PIN-001',
                'name' => 'Látex interior blanco 4L',
                'description' => 'Pintura látex para interior color blanco balde 4 litros',
                'price' => 18500.00,
                'cost' => 13000.00,
                'unit' => ProductUnit::Unidad,
                'category_id' => $catPintura->id,
                'supplier_id' => $materialesSur->id,
                'stock' => 25,
                'min_stock' => 6,
            ],
            [
                'sku' => 'PIN-002',
                'name' => 'Esmalte sintético negro 1L',
                'description' => 'Esmalte sintético brillante negro lata 1 litro',
                'price' => 9200.00,
                'cost' => 6400.00,
                'unit' => ProductUnit::Litro,
                'category_id' => $catPintura->id,
                'supplier_id' => $materialesSur->id,
                'stock' => 30,
                'min_stock' => 8,
            ],
            [
                'sku' => 'PIN-003',
                'name' => 'Rodillo lana 23cm con mango',
                'description' => 'Rodillo de lana 23cm con mango extensible',
                'price' => 4800.00,
                'cost' => 3000.00,
                'unit' => ProductUnit::Unidad,
                'category_id' => $catPintura->id,
                'supplier_id' => $materialesSur->id,
                'stock' => 40,
                'min_stock' => 10,
            ],
            // Plomería
            [
                'sku' => 'PLO-001',
                'name' => 'Caño PVC presión 1/2" (6m)',
                'description' => 'Caño de PVC para agua a presión 1/2 pulgada barra de 6 metros',
                'price' => 7800.00,
                'cost' => 5200.00,
                'unit' => ProductUnit::Metro,
                'category_id' => $catPlomeria->id,
                'supplier_id' => $materialesSur->id,
                'stock' => 50,
                'min_stock' => 12,
            ],
            [
                'sku' => 'PLO-002',
                'name' => 'Codo PVC 1/2" 90°',
                'description' => 'Codo de PVC para agua fría 1/2 pulgada 90 grados',
                'price' => 480.00,
                'cost' => 280.00,
                'unit' => ProductUnit::Unidad,
                'category_id' => $catPlomeria->id,
                'supplier_id' => $materialesSur->id,
                'stock' => 200,
                'min_stock' => 50,
            ],
            [
                'sku' => 'PLO-003',
                'name' => 'Llave de paso esfera 1/2"',
                'description' => 'Llave de paso a esfera de bronce 1/2 pulgada',
                'price' => 3800.00,
                'cost' => 2500.00,
                'unit' => ProductUnit::Unidad,
                'category_id' => $catPlomeria->id,
                'supplier_id' => $distribuidoraFerro->id,
                'stock' => 35,
                'min_stock' => 10,
            ],
            // Electricidad
            [
                'sku' => 'ELE-001',
                'name' => 'Cable unipolar 2.5mm² (rollo 100m)',
                'description' => 'Cable unipolar de cobre 2.5mm² rollo de 100 metros',
                'price' => 38000.00,
                'cost' => 27000.00,
                'unit' => ProductUnit::Metro,
                'category_id' => $catElectricidad->id,
                'supplier_id' => $distribuidoraFerro->id,
                'stock' => 20,
                'min_stock' => 5,
            ],
            [
                'sku' => 'ELE-002',
                'name' => 'Tomacorriente doble con tierra',
                'description' => 'Tomacorriente doble con puesta a tierra 10A/250V',
                'price' => 2900.00,
                'cost' => 1800.00,
                'unit' => ProductUnit::Unidad,
                'category_id' => $catElectricidad->id,
                'supplier_id' => $distribuidoraFerro->id,
                'stock' => 60,
                'min_stock' => 15,
            ],
            [
                'sku' => 'ELE-003',
                'name' => 'Cinta aisladora 20m',
                'description' => 'Cinta aisladora eléctrica PVC negra 20 metros',
                'price' => 1100.00,
                'cost' => 650.00,
                'unit' => ProductUnit::Unidad,
                'category_id' => $catElectricidad->id,
                'supplier_id' => $distribuidoraFerro->id,
                'stock' => 100,
                'min_stock' => 25,
            ],
        ];

        foreach ($products as $data) {
            $stock = $data['stock'];
            $minStock = $data['min_stock'];
            unset($data['stock'], $data['min_stock']);

            $data['unit'] = $data['unit']->value;

            $product = Product::firstOrCreate(
                ['sku' => $data['sku']],
                array_merge($data, ['is_active' => true])
            );

            ProductStock::firstOrCreate(
                ['product_id' => $product->id, 'branch_id' => $branch->id],
                ['stock' => $stock, 'min_stock' => $minStock]
            );
        }

        // Clientes
        $customers = [
            ['name' => 'María García', 'email' => 'garcia.maria@gmail.com', 'phone' => '011-1534-2211'],
            ['name' => 'Carlos Rodríguez', 'email' => 'carlos.rodriguez@hotmail.com', 'phone' => '011-1567-8834'],
            ['name' => 'Ana López', 'email' => 'ana.lopez@yahoo.com.ar', 'phone' => '011-1589-4423'],
            ['name' => 'Jorge Martínez', 'email' => 'jorge.martinez@gmail.com', 'phone' => '011-1512-7765'],
            ['name' => 'Luisa Fernández', 'email' => 'luisa.fernandez@outlook.com', 'phone' => '011-1598-3300'],
            ['name' => 'Roberto Pérez', 'email' => 'roberto.perez@gmail.com', 'phone' => '011-1543-1122'],
            ['name' => 'Carmen Sánchez', 'email' => 'carmen.sanchez@hotmail.com', 'phone' => '011-1578-9900'],
            ['name' => 'Miguel Torres', 'email' => 'miguel.torres@gmail.com', 'phone' => '011-1556-4477'],
            ['name' => 'Isabel Díaz', 'email' => 'isabel.diaz@yahoo.com.ar', 'phone' => '011-1523-6688'],
            ['name' => 'Fernando Ramírez', 'email' => 'fernando.ramirez@gmail.com', 'phone' => '011-1591-5599'],
        ];

        foreach ($customers as $customer) {
            Customer::firstOrCreate(
                ['email' => $customer['email']],
                array_merge($customer, ['is_active' => true])
            );
        }
    }
}
