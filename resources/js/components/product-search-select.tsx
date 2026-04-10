import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

interface Product {
    id: number;
    name: string;
    sku: string;
    barcode: string | null;
    price: string;
    unit: string;
}

interface ProductSearchSelectProps {
    products: Product[];
    value: number | '';
    onChange: (productId: number) => void;
    required?: boolean;
}

export default function ProductSearchSelect({ products, value, onChange, required }: ProductSearchSelectProps) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = value !== '' ? (products.find((p) => p.id === value) ?? null) : null;
    const displayValue = open ? query : (selected ? `[${selected.sku}] ${selected.name}` : '');

    const filtered =
        query.trim() === ''
            ? products
            : products.filter((p) => {
                  const q = query.toLowerCase();
                  return (
                      p.name.toLowerCase().includes(q) ||
                      p.sku.toLowerCase().includes(q) ||
                      (p.barcode !== null && p.barcode.toLowerCase().includes(q))
                  );
              });

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key !== 'Enter') { return; }
        e.preventDefault();

        // Exact barcode match (barcode scanner sends Enter at the end)
        const barcodeMatch = products.find(
            (p) => p.barcode !== null && p.barcode.toLowerCase() === query.trim().toLowerCase(),
        );
        if (barcodeMatch) {
            onChange(barcodeMatch.id);
            setQuery('');
            setOpen(false);
            return;
        }

        // Auto-select first result if only one match
        if (filtered.length === 1) {
            onChange(filtered[0].id);
            setQuery('');
            setOpen(false);
        }
    }

    // Close on outside click
    useEffect(() => {
        function handleOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery('');
            }
        }
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <Input
                value={displayValue}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => {
                    setQuery('');
                    setOpen(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Buscar por nombre, SKU o código de barras…"
            />

            {/* Hidden input for native browser required validation */}
            <input
                type="text"
                value={value === '' ? '' : String(value)}
                required={required}
                onChange={() => {}}
                tabIndex={-1}
                aria-hidden="true"
                className="sr-only"
            />

            {open && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-md">
                    {filtered.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</div>
                    ) : (
                        filtered.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                                onMouseDown={() => {
                                    onChange(p.id);
                                    setQuery('');
                                    setOpen(false);
                                }}
                            >
                                <span className="shrink-0 font-mono text-xs text-muted-foreground">{p.sku}</span>
                                <span className="flex-1 truncate">{p.name}</span>
                                {p.barcode && (
                                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">{p.barcode}</span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
