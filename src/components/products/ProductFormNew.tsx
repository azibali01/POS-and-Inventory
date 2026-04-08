import { useState, type FormEvent } from "react";
import {
  TextInput,
  Group,
  Button,
  NumberInput,
  Textarea,
  Box,
  Title,
  Table,
  ActionIcon,
  Divider,
  Text,
  Stack,
  Paper,
  Badge,
  Center,
  Alert,
} from "@mantine/core";
import SafeSelect from "../../lib/SafeSelect";
import { showNotification } from "@mantine/notifications";
import {
  useInventory,
  useCategories,
  useColors,
} from "../../lib/hooks/useInventory";
import { useSupplier } from "../../hooks/useSupplier";
import type {
  InventoryItem,
  InventoryItemInput,
  ProductVariantInput,
} from "../../types/product";
import { logger } from "../../lib/logger";

interface Props {
  product?: InventoryItem;
  onClose: () => void;
}

interface VariantForm {
  thickness: string;
  color: string;
  length: string;
  salesRate: string;
  purchasePrice: string;
  openingStock: string;
}

const LENGTH_OPTIONS = ["14", "16", "18"] as const;

function buildSkuPreview(
  itemName: string,
  thickness: string,
  color: string,
  length: string,
): string {
  const cleanItemName = itemName
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .substring(0, 10);
  const cleanThickness = thickness.replace(/[^0-9.]/g, "").substring(0, 6);
  const cleanColor = color
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .substring(0, 3);
  const resolvedLength = LENGTH_OPTIONS.includes(
    length as (typeof LENGTH_OPTIONS)[number],
  )
    ? length
    : "14";

  return `${cleanItemName || "ITEM"}-${cleanThickness || "THK"}-${cleanColor || "CLR"}-${resolvedLength}`;
}

export function ProductFormNew({ product, onClose }: Props) {
  const { createInventoryAsync, updateInventoryAsync } = useInventory();
  const { categories } = useCategories();
  const { suppliers } = useSupplier();
  const { colors } = useColors();

  const categoriesForSelect = categories.map((c) => ({
    value: c.name,
    label: c.name,
  }));

  const suppliersForSelect = suppliers.map((s) => ({
    value: s.name,
    label: s.name,
  }));

  const colorsForSelect = colors.map((c) => ({
    value: c.name,
    label: c.name,
  }));

  // Master product fields
  const [masterForm, setMasterForm] = useState({
    itemName: product?.itemName || "",
    category: product?.category || "",
    unit: product?.unit || "ft",
    description: product?.description || "",
    brand: product?.brand || "",
  });

  // Dynamic variants array
  const [variants, setVariants] = useState<VariantForm[]>(() => {
    if (product?.variants && product.variants.length > 0) {
      // Load existing variants
      return product.variants.map((variant) => ({
        thickness: variant.thickness,
        color: variant.color,
        length: LENGTH_OPTIONS.includes(
          variant.length as (typeof LENGTH_OPTIONS)[number],
        )
          ? variant.length
          : "14",
        salesRate: variant.salesRate.toString(),
        purchasePrice: (variant.purchasePrice ?? 0).toString(),
        openingStock: variant.openingStock?.toString() || "0",
      }));
    } else if (product?.thickness || product?.color) {
      // Convert legacy single variant
      return [
        {
          thickness: product.thickness?.toString() || "",
          color: product.color || "",
          length: "14",
          salesRate: product.salesRate?.toString() || "",
          purchasePrice: (product.costPrice ?? 0).toString(),
          openingStock: product.openingStock?.toString() || "0",
        },
      ];
    } else {
      // Start with one empty variant
      return [
        {
          thickness: "",
          color: "",
          length: "14",
          salesRate: "",
          purchasePrice: "0",
          openingStock: "0",
        },
      ];
    }
  });

  const [loading, setLoading] = useState(false);

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        thickness: "",
        color: "",
        length: "14",
        salesRate: "",
        purchasePrice: "0",
        openingStock: "0",
      },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (
    index: number,
    field: keyof VariantForm,
    value: string,
  ) => {
    setVariants(
      variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant,
      ),
    );
  };

  const validateForm = () => {
    // Validate master fields
    if (!masterForm.itemName.trim()) {
      showNotification({
        title: "Validation Error",
        message: "Item Name is required",
        color: "red",
      });
      return false;
    }

    // Validate variants
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      if (!variant.thickness.trim()) {
        showNotification({
          title: "Validation Error",
          message: `Thickness is required for variant ${String(i + 1)}`,
          color: "red",
        });
        return false;
      }
      if (!variant.color.trim()) {
        showNotification({
          title: "Validation Error",
          message: `Color is required for variant ${String(i + 1)}`,
          color: "red",
        });
        return false;
      }
      if (!variant.length.trim()) {
        showNotification({
          title: "Validation Error",
          message: `Length is required for variant ${String(i + 1)}`,
          color: "red",
        });
        return false;
      }
      if (
        !LENGTH_OPTIONS.includes(
          variant.length as (typeof LENGTH_OPTIONS)[number],
        )
      ) {
        showNotification({
          title: "Validation Error",
          message: `Length must be one of: ${LENGTH_OPTIONS.join(", ")} for variant ${String(i + 1)}`,
          color: "red",
        });
        return false;
      }
      if (!variant.salesRate || Number(variant.salesRate) <= 0) {
        showNotification({
          title: "Validation Error",
          message: `Valid sales rate is required for variant ${String(i + 1)}`,
          color: "red",
        });
        return false;
      }
      if (!variant.purchasePrice || Number(variant.purchasePrice) < 0) {
        showNotification({
          title: "Validation Error",
          message: `Valid purchase price is required for variant ${String(i + 1)}`,
          color: "red",
        });
        return false;
      }
    }

    // Check for duplicate variants
    const uniqueVariants = new Set(
      variants.map((v) => `${v.thickness}-${v.color}-${v.length}`),
    );
    if (uniqueVariants.size !== variants.length) {
      showNotification({
        title: "Validation Error",
        message:
          "Duplicate thickness-color-length combinations are not allowed",
        color: "red",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submit button clicked!");

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    setLoading(true);
    console.log("Loading state set to true");

    // Build payload
    const variantsPayload: ProductVariantInput[] = variants.map((variant) => ({
      thickness: variant.thickness.trim(),
      color: variant.color.trim(),
      length: variant.length.trim(),
      salesRate: Number(variant.salesRate),
      purchasePrice: Number(variant.purchasePrice) || 0,
      openingStock: Number(variant.openingStock) || 0,
      availableStock: Number(variant.openingStock) || 0,
      minimumStockLevel: 0, // Default value since we simplified the UI
    }));

    const payload: InventoryItemInput = {
      itemName: masterForm.itemName.trim(),
      category: masterForm.category || "General",
      unit: masterForm.unit || "ft",
      description: masterForm.description.trim(),
      brand: masterForm.brand.trim(),
      variants: variantsPayload,
    };

    try {
      console.log("Submitting master-variant payload:", payload);
      logger.debug("Submitting master-variant payload:", payload);

      const id = product?._id;

      if (id) {
        console.log("Updating product with ID:", id);
        logger.debug("Updating product with ID:", id);
        const result = await updateInventoryAsync({ id, payload });
        console.log("Update successful:", result);
        showNotification({
          title: "Success",
          message: "Product updated successfully",
          color: "green",
        });
      } else {
        console.log("Creating new product");
        logger.debug("Creating new product");
        const result = await createInventoryAsync(payload);
        console.log("Create successful:", result);
        showNotification({
          title: "Success",
          message: "Product created successfully",
          color: "green",
        });
      }

      console.log("Closing modal...");
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "Failed to save product";
      showNotification({
        title: "Error",
        message,
        color: "red",
      });
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
    >
      <Title order={3} mb="md">
        {product ? "Edit Product" : "Create Product"}
      </Title>

      {/* Master Product Fields */}
      <Title order={4} size="md" mb="sm">
        Product Information
      </Title>

      <Group grow mb="md">
        <TextInput
          label="Item Name"
          required
          value={masterForm.itemName}
          onChange={(e) => {
            setMasterForm({ ...masterForm, itemName: e.currentTarget.value });
          }}
        />
        <SafeSelect
          label="Category"
          data={categoriesForSelect}
          value={masterForm.category}
          onChange={(v) => {
            setMasterForm({ ...masterForm, category: v || "" });
          }}
          searchable
          clearable
        />
        <SafeSelect
          label="Unit"
          data={[
            { value: "ft", label: "Feet" },
            { value: "pcs", label: "Pieces" },
            { value: "kg", label: "Kilograms" },
            { value: "m", label: "Meters" },
            { value: "sqft", label: "Square Feet" },
          ]}
          value={masterForm.unit}
          onChange={(v) => {
            setMasterForm({ ...masterForm, unit: v || "ft" });
          }}
        />
      </Group>

      <Group grow mb="md">
        <SafeSelect
          label="Brand/Supplier"
          data={suppliersForSelect}
          value={masterForm.brand}
          onChange={(v) => {
            setMasterForm({ ...masterForm, brand: v || "" });
          }}
          searchable
          clearable
          placeholder="Select brand or supplier"
        />
        <Textarea
          label="Description"
          value={masterForm.description}
          onChange={(e) => {
            setMasterForm({
              ...masterForm,
              description: e.currentTarget.value,
            });
          }}
          rows={3}
        />
      </Group>

      <Divider my="xl" />

      {/* Product Variants Section */}
      <Stack gap="md">
        <div>
          <Title order={4} size="md" mb="xs">
            Product Variants
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            Define different combinations of thickness, color, length, and
            pricing for this product. Each variant will get a unique SKU (e.g.,
            D10-1.6-SIL-14).
          </Text>
        </div>

        {/* Prominent Variants Table */}
        <Paper withBorder p="md" style={{ backgroundColor: "#fafafa" }}>
          <Alert color="blue" mb="md" variant="light">
            <Text size="sm">
              <strong>Required:</strong> At least one variant must be added.
              Each thickness-color-length combination must be unique.
            </Text>
          </Alert>

          <Table
            striped
            highlightOnHover
            withTableBorder
            withColumnBorders
            style={{
              backgroundColor: "white",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
            }}
          >
            <thead style={{ backgroundColor: "#228be6", color: "white" }}>
              <tr>
                <th
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                    width: "60px",
                  }}
                >
                  #
                </th>
                <th
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    minWidth: "140px",
                  }}
                >
                  Thickness *
                </th>
                <th
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    minWidth: "140px",
                  }}
                >
                  Color *
                </th>
                <th
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    minWidth: "130px",
                  }}
                >
                  Length (ft) *
                </th>
                <th
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    minWidth: "190px",
                  }}
                >
                  SKU Preview
                </th>
                <th
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    minWidth: "120px",
                  }}
                >
                  Sales Rate *
                </th>
                <th
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    minWidth: "130px",
                  }}
                >
                  Purchase Price *
                </th>
                <th
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    minWidth: "120px",
                  }}
                >
                  Opening Stock
                </th>
                <th
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                    width: "100px",
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {variants.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <Center py="xl">
                      <Text c="dimmed" size="sm">
                        No variants added yet. Click "Add Variant" below to get
                        started.
                      </Text>
                    </Center>
                  </td>
                </tr>
              ) : (
                variants.map((variant, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
                    }}
                  >
                    {/* Row Number */}
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>
                      <Badge size="sm" variant="outline" color="blue">
                        {index + 1}
                      </Badge>
                    </td>

                    {/* Thickness */}
                    <td>
                      <TextInput
                        value={variant.thickness}
                        onChange={(e) => {
                          updateVariant(
                            index,
                            "thickness",
                            e.currentTarget.value,
                          );
                        }}
                        placeholder="e.g., 1.6mm, 2.0mm"
                        required
                        style={{ minWidth: "140px" }}
                        error={!variant.thickness.trim() ? "Required" : null}
                      />
                    </td>

                    {/* Color */}
                    <td>
                      <SafeSelect
                        data={colorsForSelect}
                        value={variant.color}
                        onChange={(v) => {
                          updateVariant(index, "color", v || "");
                        }}
                        searchable
                        clearable
                        placeholder="Select color"
                        required
                        style={{ minWidth: "140px" }}
                        error={!variant.color.trim() ? "Required" : null}
                      />
                    </td>

                    {/* Length */}
                    <td>
                      <SafeSelect
                        data={LENGTH_OPTIONS.map((value) => ({
                          value,
                          label: value,
                        }))}
                        value={variant.length}
                        onChange={(value) => {
                          updateVariant(index, "length", value || "14");
                        }}
                        placeholder="Select length"
                        required
                        style={{ minWidth: "130px" }}
                        error={
                          !variant.length.trim() ||
                          !LENGTH_OPTIONS.includes(
                            variant.length as (typeof LENGTH_OPTIONS)[number],
                          )
                            ? "Required"
                            : null
                        }
                        allowDeselect={false}
                      />
                    </td>

                    {/* SKU Preview */}
                    <td>
                      <Text
                        size="sm"
                        fw={600}
                        c="dimmed"
                        style={{ minWidth: "190px" }}
                      >
                        {buildSkuPreview(
                          masterForm.itemName,
                          variant.thickness,
                          variant.color,
                          variant.length,
                        )}
                      </Text>
                    </td>

                    {/* Sales Rate */}
                    <td>
                      <NumberInput
                        value={
                          variant.salesRate === ""
                            ? ""
                            : Number(variant.salesRate)
                        }
                        onChange={(value) => {
                          updateVariant(index, "salesRate", String(value));
                        }}
                        placeholder="0.00"
                        min={0}
                        decimalScale={2}
                        hideControls
                        required
                        style={{ minWidth: "120px" }}
                        error={
                          !variant.salesRate || Number(variant.salesRate) <= 0
                            ? "Required"
                            : null
                        }
                      />
                    </td>

                    {/* Opening Stock */}
                    <td>
                      <NumberInput
                        value={
                          variant.purchasePrice === ""
                            ? ""
                            : Number(variant.purchasePrice)
                        }
                        onChange={(value) => {
                          updateVariant(index, "purchasePrice", String(value));
                        }}
                        placeholder="0.00"
                        min={0}
                        decimalScale={2}
                        hideControls
                        required
                        style={{ minWidth: "130px" }}
                        error={
                          !variant.purchasePrice ||
                          Number(variant.purchasePrice) < 0
                            ? "Required"
                            : null
                        }
                      />
                    </td>

                    {/* Opening Stock */}
                    <td>
                      <NumberInput
                        value={
                          variant.openingStock === ""
                            ? 0
                            : Number(variant.openingStock)
                        }
                        onChange={(value) => {
                          updateVariant(index, "openingStock", String(value));
                        }}
                        placeholder="0"
                        min={0}
                        hideControls
                        style={{ minWidth: "120px" }}
                      />
                    </td>

                    {/* Delete Action */}
                    <td style={{ textAlign: "center" }}>
                      <ActionIcon
                        color="red"
                        variant="light"
                        size="lg"
                        disabled={variants.length === 1}
                        onClick={() => {
                          removeVariant(index);
                        }}
                        title={
                          variants.length === 1
                            ? "At least one variant required"
                            : "Delete variant"
                        }
                      >
                        X
                      </ActionIcon>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {/* Prominent Add Variant Button */}
          <Center mt="md">
            <Button
              leftSection="+"
              size="md"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan" }}
              onClick={addVariant}
              style={{
                fontWeight: "bold",
                fontSize: "14px",
                padding: "12px 24px",
                borderRadius: "8px",
              }}
            >
              + Add New Variant
            </Button>
          </Center>

          {/* Helpful Information */}
          <Text size="xs" c="dimmed" mt="sm" style={{ textAlign: "center" }}>
            💡 SKUs will be auto-generated as: [Item
            Name]-[Thickness]-[Color]-[Length] (e.g., D10-1.6-SIL-14)
          </Text>
        </Paper>
      </Stack>

      {/* Action Buttons */}
      <Divider my="xl" />

      <Group justify="space-between" mt="xl">
        <Button variant="outline" onClick={onClose} size="md" color="gray">
          Cancel
        </Button>

        <Button
          type="submit"
          loading={loading}
          size="md"
          style={{
            fontWeight: "bold",
            fontSize: "16px",
            padding: "12px 32px",
            backgroundColor: loading ? undefined : "#228be6",
          }}
          leftSection={loading ? undefined : "+"}
        >
          {loading
            ? product
              ? "Updating..."
              : "Creating..."
            : product
              ? "Update Product"
              : " Save Product"}
        </Button>
      </Group>
    </Box>
  );
}
