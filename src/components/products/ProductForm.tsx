import React, { useState } from "react";
import {
  TextInput,
  Group,
  Button,
  Select,
  NumberInput,
  Textarea,
  Switch,
  Box,
} from "@mantine/core";
import { useDataContext } from "../../Dashboard/Context/DataContext";
import type { InventoryItem } from "../../Dashboard/Context/DataContext";

type FormState = {
  code: string;
  name: string;
  category: string;
  supplier: string;
  gauge: string;
  unit: string;
  costPrice: number;
  oldPrice: number;
  sellingPrice: number;
  newPrice: number;
  color: string;
  colorId?: string;
  length: string | number;
  stock: number;
  minStock: number;
  remarks: string;
  isActive: boolean;
};

interface Props {
  product?: InventoryItem | null;
  onClose: () => void;
}

export function ProductForm({ product, onClose }: Props) {
  const { setInventory, colors, getColorById } = useDataContext();

  const [form, setForm] = useState<FormState>(() => ({
    code: product?.code || product?.sku || `P${Date.now()}`,
    name: product?.name || "",
    category: product?.category || "Sections",
    supplier: product?.supplier || "",
    gauge: "",
    unit: product?.unit || "ft",
    costPrice: product?.costPrice ?? 0,
    oldPrice: product?.oldPrice ?? 0,
    sellingPrice: product?.sellingPrice ?? 0,
    newPrice: product?.newPrice ?? product?.sellingPrice ?? 0,
    // keep legacy color string but prefer colorId when available
    color: product?.color ?? "",
    colorId: product?.colorId ?? undefined,
    length: product?.length ?? "",
    // msl removed; use minStock instead
    stock: product?.stock ?? 0,
    minStock: product?.minStock ?? 0,
    remarks: product?.description || "",
    isActive: product?.status === "active" ? true : false,
  }));

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const newItem: InventoryItem = {
      id: product?.id ?? Date.now(),
      name: form.name,
      code: form.code,
      sku: form.code,
      category: form.category,
      supplier: form.supplier,
      unit: form.unit,
      color: form.color,
      colorId: form.colorId,
      length: form.length,
      weight: undefined,
      costPrice: Number(form.costPrice),
      oldPrice: Number(form.oldPrice || 0),
      sellingPrice: Number(form.sellingPrice),
      newPrice: Number(form.newPrice || form.sellingPrice || 0),
      stock: Number(form.stock),
      minStock: Number(form.minStock),
      // msl removed
      maxStock: 0,
      location: "",
      description: form.remarks,
      status: form.isActive ? "active" : "inactive",
      lastUpdated: new Date().toISOString(),
    };

    if (product) {
      setInventory((prev) =>
        prev.map((p) => (p.id === product.id ? newItem : p))
      );
    } else {
      setInventory((prev) => [newItem, ...prev]);
    }

    onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Group grow>
        <TextInput
          label="Item Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.currentTarget.value })}
          disabled={!!product}
        />
        <TextInput
          label="Item Name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
        />
      </Group>

      <Group grow mt="sm">
        <Select
          label="Category"
          data={["Sections", "Channels", "Accessories", "Glass"]}
          value={form.category}
          onChange={(v) => setForm({ ...form, category: v || "Sections" })}
        />
        <TextInput
          label="Brand / Supplier"
          value={form.supplier}
          onChange={(e) =>
            setForm({ ...form, supplier: e.currentTarget.value })
          }
        />
      </Group>

      <Group grow mt="sm">
        <TextInput
          label="Gauge"
          value={form.gauge}
          onChange={(e) => setForm({ ...form, gauge: e.currentTarget.value })}
        />
        <Select
          label="Unit"
          data={["ft", "pcs", "kg", "m", "sqft"]}
          value={form.unit}
          onChange={(v) => setForm({ ...form, unit: v || "ft" })}
        />
      </Group>

      <Group grow mt="sm">
        <NumberInput
          label="Purchase Rate"
          value={form.costPrice}
          onChange={(v) =>
            setForm({
              ...form,
              costPrice: typeof v === "number" ? v : Number(v) || 0,
            })
          }
        />
        <NumberInput
          label="Sale Rate"
          value={form.sellingPrice}
          onChange={(v) =>
            setForm({
              ...form,
              sellingPrice: typeof v === "number" ? v : Number(v) || 0,
            })
          }
        />
      </Group>

      <Group grow mt="sm">
        <NumberInput
          label="Old Price"
          value={form.oldPrice}
          onChange={(v) =>
            setForm({
              ...form,
              oldPrice: typeof v === "number" ? v : Number(v) || 0,
            })
          }
        />
        <NumberInput
          label="New Price"
          value={form.newPrice}
          onChange={(v) =>
            setForm({
              ...form,
              newPrice: typeof v === "number" ? v : Number(v) || 0,
            })
          }
        />
      </Group>

      <Group grow mt="sm">
        <Select
          label="Color"
          placeholder="Select color"
          data={colors.map((c) => ({
            value: c.id,
            label:
              c.code && c.code !== c.name ? `${c.name} (${c.code})` : c.name,
          }))}
          value={form.colorId ?? null}
          onChange={(id) => {
            // id may be null when cleared
            if (!id) return setForm({ ...form, colorId: undefined });
            const c = getColorById(id);
            setForm({ ...form, color: c?.name ?? form.color, colorId: id });
          }}
          searchable
          clearable
        />
        <TextInput
          label="Length"
          value={String(form.length)}
          onChange={(e) => setForm({ ...form, length: e.currentTarget.value })}
        />
      </Group>

      <Group grow mt="sm">
        <NumberInput
          label="Opening Stock"
          value={form.stock}
          onChange={(v) =>
            setForm({
              ...form,
              stock: typeof v === "number" ? v : Number(v) || 0,
            })
          }
        />
        <NumberInput
          label="Minimum Stock Level"
          value={form.minStock}
          onChange={(v) =>
            setForm({
              ...form,
              minStock: typeof v === "number" ? v : Number(v) || 0,
            })
          }
        />
      </Group>

      {/* MSL removed - Minimum Stock Level is represented by 'minStock' */}

      <Textarea
        label="Remarks"
        value={form.remarks}
        onChange={(e) => setForm({ ...form, remarks: e.currentTarget.value })}
        mt="sm"
      />

      <Group justify="space-between" mt="md">
        <Switch
          checked={form.isActive}
          onChange={(e) =>
            setForm({ ...form, isActive: e.currentTarget.checked })
          }
          label="Active Product"
        />
        <Group>
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {product ? "Update Product" : "Add Product"}
          </Button>
        </Group>
      </Group>
    </Box>
  );
}
