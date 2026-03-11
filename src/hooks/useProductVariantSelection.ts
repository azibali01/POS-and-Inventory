import { useMemo, useState } from "react";
import type { InventoryItem, ProductVariant } from "../../types/product";

export interface VariantSelectionState {
  selectedProduct: InventoryItem | null;
  selectedThickness: string;
  selectedColor: string;
  selectedVariant: ProductVariant | null;
}

export interface VariantDropdownOptions {
  productOptions: Array<{ value: string; label: string }>;
  thicknessOptions: Array<{ value: string; label: string }>;
  colorOptions: Array<{ value: string; label: string }>;
}

/**
 * Custom hook for managing product variant selection in POS/Sales
 * Provides cascading dropdown logic: Product -> Thickness -> Color -> Variant Data
 */
export function useProductVariantSelection(products: InventoryItem[]) {
  const [selection, setSelection] = useState<VariantSelectionState>({
    selectedProduct: null,
    selectedThickness: "",
    selectedColor: "",
    selectedVariant: null,
  });

  // Memoized dropdown options
  const dropdownOptions = useMemo((): VariantDropdownOptions => {
    // Product options (unique item names)
    const productOptions = Array.from(
      new Map(
        products.map((product) => [
          product.itemName,
          { value: product._id, label: product.itemName },
        ]),
      ).values(),
    );

    // Thickness options based on selected product
    const thicknessOptions = selection.selectedProduct
      ? Array.from(
          new Set(
            selection.selectedProduct.variants?.map((v) => v.thickness) || [],
          ),
        ).map((thickness) => ({
          value: String(thickness),
          label: String(thickness),
        }))
      : [];

    // Color options based on selected product and thickness
    const colorOptions =
      selection.selectedProduct && selection.selectedThickness
        ? Array.from(
            new Set(
              selection.selectedProduct.variants
                ?.filter((v) => v.thickness === selection.selectedThickness)
                .map((v) => v.color) || [],
            ),
          ).map((color) => ({
            value: color,
            label: color,
          }))
        : [];

    return {
      productOptions,
      thicknessOptions,
      colorOptions,
    };
  }, [products, selection.selectedProduct, selection.selectedThickness]);

  // Helper function to find specific variant
  const findVariant = (
    product: InventoryItem | null,
    thickness: string,
    color: string,
    sku?: string,
  ): ProductVariant | null => {
    if (!product || !thickness || !color || !product.variants) {
      return null;
    }

    if (sku) {
      const directMatch = product.variants.find(
        (variant) => variant.sku === sku,
      );
      if (directMatch) {
        return directMatch;
      }
    }

    return (
      product.variants.find(
        (v) => v.thickness === thickness && v.color === color,
      ) || null
    );
  };

  // Action: Select product by ID
  const selectProduct = (productId: string) => {
    const product = products.find((p) => p._id === productId) || null;
    setSelection({
      selectedProduct: product,
      selectedThickness: "",
      selectedColor: "",
      selectedVariant: null,
    });
  };

  // Action: Select thickness
  const selectThickness = (thickness: string) => {
    setSelection((prev) => ({
      ...prev,
      selectedThickness: thickness,
      selectedColor: "",
      selectedVariant: null,
    }));
  };

  // Action: Select color (and determine final variant)
  const selectColor = (color: string) => {
    const variant = findVariant(
      selection.selectedProduct,
      selection.selectedThickness,
      color,
    );

    setSelection((prev) => ({
      ...prev,
      selectedColor: color,
      selectedVariant: variant,
    }));
  };

  // Action: Reset selection
  const resetSelection = () => {
    setSelection({
      selectedProduct: null,
      selectedThickness: "",
      selectedColor: "",
      selectedVariant: null,
    });
  };

  // Utility: Get current variant data for line item
  const getCurrentVariantData = () => {
    if (!selection.selectedVariant || !selection.selectedProduct) {
      return null;
    }

    return {
      productId: selection.selectedProduct._id,
      itemName: selection.selectedProduct.itemName,
      category: selection.selectedProduct.category,
      unit: selection.selectedProduct.unit,
      thickness: selection.selectedVariant.thickness,
      color: selection.selectedVariant.color,
      salesRate: selection.selectedVariant.salesRate,
      availableStock:
        selection.selectedVariant.availableStock ??
        selection.selectedVariant.openingStock ??
        0,
      minimumStockLevel: selection.selectedVariant.minimumStockLevel || 0,
      sku: selection.selectedVariant.sku,
      description: selection.selectedProduct.description,
      brand: selection.selectedProduct.brand,
    };
  };

  // Utility: Check if selection is complete
  const isSelectionComplete = (): boolean => {
    return !!(
      selection.selectedProduct &&
      selection.selectedThickness &&
      selection.selectedColor &&
      selection.selectedVariant
    );
  };

  // Utility: Generate unique line item key for the selected variant
  const generateLineItemKey = (): string => {
    if (!isSelectionComplete()) return "";
    return `${selection.selectedProduct!._id}-${selection.selectedThickness}-${selection.selectedColor}`;
  };

  return {
    // State
    selection,
    dropdownOptions,

    // Actions
    selectProduct,
    selectThickness,
    selectColor,
    resetSelection,

    // Utilities
    getCurrentVariantData,
    isSelectionComplete,
    generateLineItemKey,
    findVariant,
  };
}

/**
 * Utility function for backward compatibility with legacy single-variant products
 * Converts legacy product structure to master-variant structure
 */
export function convertLegacyProduct(product: InventoryItem): InventoryItem {
  // If product already has variants, return as-is
  if (product.variants && product.variants.length > 0) {
    return product;
  }

  // Convert legacy single product to master-variant structure
  const legacyVariant: ProductVariant = {
    sku: `${product._id}-${String(product.thickness ?? "standard")}-${product.color || "default"}`,
    thickness: product.thickness?.toString() || "Standard",
    color: product.color || "Default",
    salesRate: product.salesRate || 0,
    openingStock: product.openingStock || 0,
    availableStock: product.availableStock ?? product.openingStock ?? 0,
    minimumStockLevel: product.minimumStockLevel || 0,
  };

  return {
    ...product,
    variants: [legacyVariant],
    // Keep legacy fields for backward compatibility
    thickness: product.thickness,
    color: product.color,
    salesRate: product.salesRate,
    openingStock: product.openingStock,
    minimumStockLevel: product.minimumStockLevel,
  };
}

/**
 * Utility function to extract all unique thickness values from products
 */
export function getAllThicknesses(products: InventoryItem[]): string[] {
  const thicknesses = new Set<string>();

  products.forEach((product) => {
    if (product.variants) {
      product.variants.forEach((variant) => {
        thicknesses.add(variant.thickness);
      });
    } else if (product.thickness) {
      // Legacy support
      thicknesses.add(product.thickness.toString());
    }
  });

  return Array.from(thicknesses).sort();
}

/**
 * Utility function to extract all unique colors from products
 */
export function getAllColors(products: InventoryItem[]): string[] {
  const colors = new Set<string>();

  products.forEach((product) => {
    if (product.variants) {
      product.variants.forEach((variant) => {
        colors.add(variant.color);
      });
    } else if (product.color) {
      // Legacy support
      colors.add(product.color);
    }
  });

  return Array.from(colors).sort();
}

/**
 * Utility function to get stock level status for a variant
 */
export function getStockStatus(variant: ProductVariant): {
  status: "in-stock" | "low-stock" | "out-of-stock" | "negative-stock";
  statusText: string;
  color: string;
} {
  const stock = variant.availableStock ?? variant.openingStock ?? 0;
  const minLevel = variant.minimumStockLevel || 0;

  if (stock < 0) {
    return {
      status: "negative-stock",
      statusText: "Negative Stock",
      color: "red",
    };
  } else if (stock === 0) {
    return {
      status: "out-of-stock",
      statusText: "Out of Stock",
      color: "orange",
    };
  } else if (stock <= minLevel) {
    return {
      status: "low-stock",
      statusText: "Low Stock",
      color: "yellow",
    };
  } else {
    return {
      status: "in-stock",
      statusText: "In Stock",
      color: "green",
    };
  }
}
