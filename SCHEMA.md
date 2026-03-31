# Schema Relacional — Saporo Store (Ferretería)

## Entidades existentes

- `users` — ya implementado
- `customers` — ya implementado

---

## Diagrama de relaciones

```
branches ──────────────────────────────────────────────┐
    │                                                   │
    │                                              sales │
    │                                                   │
users ─────────────────────────────────────────► sales │
                                                    │   │
customers ─────────────────────────────────────► sales │
                                                    │
                                              sale_items
                                                    │
categories ──► products ◄── suppliers          products
                  │                                 │
             product_stock ◄── branches             │
                                               sale_items
```

---

## Tablas

### customers (clientes)

| Columna   | Tipo         | Restricciones          |
| --------- | ------------ | ---------------------- |
| id        | int          | PK, autoincrement      |
| name      | varchar(100) | NOT NULL, UNIQUE       |
| email     | varchar(100) | NOT NULL, UNIQUE       |
| phone     | varchar(100) | NOT NULL               |
| address   | varchar(255) | nullable               |
| isActive  | boolean      | DEFAULT true           |
| createdAt | timestamp    | auto                   |
| updatedAt | timestamp    | auto                   |
| deletedAt | timestamp    | nullable (soft delete) |

### `branches` (sucursales)

| Columna   | Tipo         | Restricciones     |
| --------- | ------------ | ----------------- |
| id        | int          | PK, autoincrement |
| name      | varchar(100) | NOT NULL, UNIQUE  |
| address   | varchar(255) | NOT NULL          |
| phone     | varchar(20)  | nullable          |
| isActive  | boolean      | DEFAULT true      |
| createdAt | timestamp    | auto              |
| updatedAt | timestamp    | auto              |

---

### `categories` (categorías de producto)

| Columna     | Tipo         | Restricciones     |
| ----------- | ------------ | ----------------- |
| id          | int          | PK, autoincrement |
| name        | varchar(100) | NOT NULL, UNIQUE  |
| description | text         | nullable          |
| isActive    | boolean      | DEFAULT true      |
| createdAt   | timestamp    | auto              |
| updatedAt   | timestamp    | auto              |

---

### `suppliers` (proveedores)

| Columna     | Tipo         | Restricciones          |
| ----------- | ------------ | ---------------------- |
| id          | int          | PK, autoincrement      |
| name        | varchar(150) | NOT NULL, UNIQUE       |
| contactName | varchar(150) | nullable               |
| email       | varchar(150) | nullable, UNIQUE       |
| phone       | varchar(20)  | nullable               |
| address     | varchar(255) | nullable               |
| isActive    | boolean      | DEFAULT true           |
| createdAt   | timestamp    | auto                   |
| updatedAt   | timestamp    | auto                   |
| deletedAt   | timestamp    | nullable (soft delete) |

---

### `products` (productos)

| Columna     | Tipo          | Restricciones                 |
| ----------- | ------------- | ----------------------------- |
| id          | int           | PK, autoincrement             |
| sku         | varchar(50)   | NOT NULL, UNIQUE              |
| barcode     | varchar(50)   | , UNIQUE                      |
| name        | varchar(200)  | NOT NULL                      |
| description | text          | nullable                      |
| price       | decimal(10,2) | NOT NULL — precio de venta    |
| cost        | decimal(10,2) | nullable — precio de costo    |
| unit        | varchar(20)   | NOT NULL (ej: unidad, kg, m²) |
| categoryId  | int           | FK → categories.id            |
| supplierId  | int           | FK → suppliers.id, nullable   |
| isActive    | boolean       | DEFAULT true                  |
| createdAt   | timestamp     | auto                          |
| updatedAt   | timestamp     | auto                          |
| deletedAt   | timestamp     | nullable (soft delete)        |

---

### `product_stock` (stock por sucursal)

> Tabla pivote que permite manejar stock independiente por sucursal.

| Columna   | Tipo      | Restricciones                              |
| --------- | --------- | ------------------------------------------ |
| id        | int       | PK, autoincrement                          |
| productId | int       | FK → products.id                           |
| branchId  | int       | FK → branches.id                           |
| stock     | int       | NOT NULL, DEFAULT 0                        |
| minStock  | int       | NOT NULL, DEFAULT 0 — alerta de stock bajo |
| updatedAt | timestamp | auto                                       |

**Índice único:** `(productId, branchId)`

---

### `sales` (ventas)

| Columna    | Tipo          | Restricciones                                     |
| ---------- | ------------- | ------------------------------------------------- |
| id         | int           | PK, autoincrement                                 |
| saleNumber | varchar(20)   | NOT NULL, UNIQUE (ej: VTA-0001)                   |
| branchId   | int           | FK → branches.id                                  |
| customerId | int           | FK → customers.id, nullable (venta anónima)       |
| userId     | int           | FK → users.id — empleado que registra             |
| status     | enum          | PENDING, COMPLETED, CANCELLED — DEFAULT COMPLETED |
| subtotal   | decimal(10,2) | NOT NULL                                          |
| discount   | decimal(10,2) | DEFAULT 0                                         |
| tax        | decimal(10,2) | DEFAULT 0                                         |
| total      | decimal(10,2) | NOT NULL                                          |
| notes      | text          | nullable                                          |
| createdAt  | timestamp     | auto                                              |
| updatedAt  | timestamp     | auto                                              |
| deletedAt  | timestamp     | nullable (soft delete / anulación)                |

---

### `sale_items` (líneas de venta)

| Columna   | Tipo          | Restricciones                          |
| --------- | ------------- | -------------------------------------- |
| id        | int           | PK, autoincrement                      |
| saleId    | int           | FK → sales.id                          |
| productId | int           | FK → products.id                       |
| quantity  | decimal(10,3) | NOT NULL                               |
| unitPrice | decimal(10,2) | NOT NULL — precio al momento de vender |
| discount  | decimal(10,2) | DEFAULT 0                              |
| subtotal  | decimal(10,2) | NOT NULL (calculado)                   |

> `unitPrice` se guarda desnormalizado a propósito: refleja el precio en el momento de la venta, no el precio actual del producto.

---

### `stock_movements` (movimientos de inventario)

> Auditoría de cada cambio de stock. Se genera automáticamente al completar/anular una venta, o manualmente para ajustes.

| Columna       | Tipo          | Restricciones                                     |
| ------------- | ------------- | ------------------------------------------------- |
| id            | int           | PK, autoincrement                                 |
| productId     | int           | FK → products.id                                  |
| branchId      | int           | FK → branches.id                                  |
| userId        | int           | FK → users.id — quien realizó el movimiento       |
| type          | enum          | IN (entrada), OUT (salida), ADJUSTMENT            |
| quantity      | decimal(10,3) | NOT NULL (siempre positivo)                       |
| previousStock | int           | stock antes del movimiento                        |
| currentStock  | int           | stock después del movimiento                      |
| reason        | varchar(255)  | nullable (ej: "Venta #VTA-0001", "Ajuste manual") |
| referenceId   | int           | nullable — id de la venta relacionada             |
| createdAt     | timestamp     | auto                                              |

---

## Relaciones resumen

| Relación                   | Tipo           |
| -------------------------- | -------------- |
| products → categories      | N:1            |
| products → suppliers       | N:1            |
| product_stock → products   | N:1            |
| product_stock → branches   | N:1            |
| sales → branches           | N:1            |
| sales → customers          | N:1 (nullable) |
| sales → users              | N:1            |
| sale_items → sales         | N:1            |
| sale_items → products      | N:1            |
| stock_movements → products | N:1            |
| stock_movements → branches | N:1            |
| stock_movements → users    | N:1            |

---

## Orden de implementación sugerido

1. `branches`
2. `categories`
3. `suppliers`
4. `products`
5. `product_stock`
6. `sales` + `sale_items` (módulo ventas)
7. `stock_movements` (puede ir junto con ventas o después)

---

## Notas de diseño

- **Soft delete** en `users`, `customers`, `suppliers`, `products`, `sales` via `deletedAt`.
- **`sale_items.unitPrice`** se desnormaliza para preservar el precio histórico. No referenciar `products.price` para cálculos históricos.
- **`stock_movements`** actúa como ledger: nunca se edita, solo se inserta. El stock real se puede recalcular sumando todos los movimientos.
- **`saleNumber`** debe generarse con un prefijo configurable por sucursal si hay varias (ej: `SVC1-0001`, `SVC2-0001`).
- Si en el futuro se agregan **compras a proveedores**, se añadiría una tabla `purchases` / `purchase_items` que también generaría movimientos `IN` en `stock_movements`.
