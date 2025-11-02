import React, { useState } from "react";
import {
  TextInput,
  Group,
  Button,
  NumberInput,
  Textarea,
  Box,
} from "@mantine/core";
import SafeSelect from "../../lib/SafeSelect";
import { showNotification } from "@mantine/notifications";
import { useDataContext } from "../../Dashboard/Context/DataContext";
import type { InventoryItem } from "../../Dashboard/Context/DataContext";

interface Props {
  product?: InventoryItem;
  onClose: () => void;
}

export function ProductForm({ product, onClose }: Props) {
  const { createInventoryItem, updateInventoryItem, categoriesForSelect } =
    useDataContext();

  const [form, setForm] = useState({
    itemName: product?.itemName || "",
    category: product?.category || "",
    thickness: product?.thickness || 0,
    unit: product?.unit || "",
    color: product?.color || "",
    salesRate: product?.salesRate || 0,
    openingStock: product?.openingStock ?? 0,
    minimumStockLevel: product?.minimumStockLevel || 0,
    description: product?.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!form.itemName.trim()) {
      showNotification({
        title: "Validation Error",
        message: "Item Name is required",
        color: "red",
      });
      return;
    }

    // Create payload that matches the InventoryItemPayload interface
    const payload = {
      itemName: form.itemName.trim(),
      category: form.category || "General",
      thickness: Number(form.thickness) || 0,
      unit: form.unit || "ft",
      color: form.color || "",
      salesRate: Number(form.salesRate) || 0,
      openingStock: Number(form.openingStock) || 0,
      minimumStockLevel: Number(form.minimumStockLevel) || 0,
      description: form.description.trim() || "",
      quantity: Number(form.openingStock) || 0, // Map openingStock to quantity for backend
    };

    try {
      console.log("Submitting payload:", payload);
      if (product && product._id !== undefined) {
        console.log("Updating product with ID:", product._id);
        await updateInventoryItem(product._id, payload);
      } else {
        console.log("Creating new product");
        await createInventoryItem(payload);
      }
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      // The error notification will be handled by the DataContext
    }
  };
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Group grow>
        <TextInput
          label="Item Name"
          required
          value={form.itemName}
          onChange={(e) =>
            setForm({ ...form, itemName: e.currentTarget.value })
          }
        />
        <SafeSelect
          label="Category"
          data={categoriesForSelect || []}
          value={form.category}
          onChange={(v) => setForm({ ...form, category: v || "" })}
          searchable
          clearable
        />
      </Group>

      <Group grow mt="sm">
        <NumberInput
          label="Thickness"
          value={form.thickness}
          onChange={(v) => setForm({ ...form, thickness: Number(v) })}
        />
        <SafeSelect
          label="Unit"
          data={["ft", "pcs", "kg", "m", "sqft"]}
          value={form.unit}
          onChange={(v) => setForm({ ...form, unit: v || "" })}
        />
        <SafeSelect
          label="Color"
          required
          data={[
            { value: "DULL", label: "DULL" },
            { value: "H23/PC-RAL", label: "H23/PC-RAL" },
            { value: "SAHRA/BRN", label: "SAHRA/BRN" },
            { value: "BLACK/MULTI", label: "BLACK/MULTI" },
            { value: "WOODCOAT", label: "WOODCOAT" },
          ]}
          value={form.color}
          onChange={(v) => setForm({ ...form, color: v || "" })}
          placeholder="Select a color"
          searchable
        />
      </Group>

      <Group grow mt="sm">
        <NumberInput
          label="Sales Rate"
          value={form.salesRate}
          onChange={(v) => setForm({ ...form, salesRate: Number(v) })}
        />
        <NumberInput
          label="Opening Stock"
          value={form.openingStock}
          onChange={(v) => setForm({ ...form, openingStock: Number(v) })}
        />
        <NumberInput
          label="Minimum Stock Level"
          value={form.minimumStockLevel}
          onChange={(v) => setForm({ ...form, minimumStockLevel: Number(v) })}
        />
      </Group>

      <Group grow mt="sm">
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.currentTarget.value })
          }
        />
      </Group>

      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {product ? "Update Product" : "Add Product"}
        </Button>
      </Group>
    </Box>
  );
}
