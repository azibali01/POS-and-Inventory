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
  const {
    createInventoryItem,
    updateInventoryItem,
    categoriesForSelect,
    suppliersForSelect,
  } = useDataContext();

  const [form, setForm] = useState({
    itemName: product?.itemName || "",
    category: product?.category || "",
    thickness: product?.thickness?.toString() ?? "",
    unit: product?.unit || "",
    color: product?.color || "",
    salesRate: product?.salesRate?.toString() ?? "",
    openingStock: product?.openingStock?.toString() ?? "",
    minimumStockLevel: product?.minimumStockLevel?.toString() ?? "",
    description: product?.description || "",
    brand: product?.brand || "",
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
      thickness: form.thickness === "" ? undefined : Number(form.thickness),
      unit: form.unit || "ft",
      color: form.color || "",
      salesRate: form.salesRate === "" ? undefined : Number(form.salesRate),
      openingStock:
        form.openingStock === "" ? undefined : Number(form.openingStock),
      minimumStockLevel:
        form.minimumStockLevel === ""
          ? undefined
          : Number(form.minimumStockLevel),
      description: form.description.trim() || "",
      brand: form.brand.trim() || "",
      quantity:
        form.openingStock === "" ? undefined : Number(form.openingStock), // Map openingStock to quantity for backend
      discount: 0, // Required by InventoryItemPayload
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
        <SafeSelect
          label="Brand/Supplier"
          data={suppliersForSelect || []}
          value={form.brand}
          onChange={(v) => setForm({ ...form, brand: v || "" })}
          searchable
          clearable
          placeholder="Select brand or supplier"
        />
      </Group>

      <Group grow mt="sm">
        <NumberInput
          label="Thickness"
          value={form.thickness}
          onChange={(v) => setForm({ ...form, thickness: v?.toString() ?? "" })}
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
          onChange={(v) => setForm({ ...form, salesRate: v?.toString() ?? "" })}
        />
        <NumberInput
          label="Opening Stock"
          value={form.openingStock}
          onChange={(v) =>
            setForm({ ...form, openingStock: v?.toString() ?? "" })
          }
        />
        <NumberInput
          label="Minimum Stock Level"
          value={form.minimumStockLevel}
          onChange={(v) =>
            setForm({ ...form, minimumStockLevel: v?.toString() ?? "" })
          }
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
