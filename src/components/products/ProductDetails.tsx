import { Card, Text, Group, Divider, Badge } from "@mantine/core";
import type { InventoryItem } from "../../Dashboard/Context/DataContext";
import { useDataContext } from "../../Dashboard/Context/DataContext";

interface Props {
  product: InventoryItem;
}

export function ProductDetails({ product }: Props) {
  const { colors } = useDataContext();
  const color = product.colorId
    ? colors?.find((c) => c.name === product.colorId)
    : undefined;
  return (
    <div>
      <Card>
        <Group>
          <div>
            <Text size="xs" c="dimmed">
              Purchase Rate
            </Text>
            <Text fw={600}>{product.costPrice}</Text>
          </div>

          <div>
            <Text size="xs" c="dimmed">
              Sale Rate
            </Text>
            <Text fw={600}>
              {(product as any).salesRate ?? product.sellingPrice}
            </Text>
          </div>

          <div>
            <Badge>{product.category}</Badge>
          </div>

          <div>
            <Text size="xs" color="dimmed">
              Brand / Supplier
            </Text>
            <Text>{product.supplier}</Text>
          </div>

          <Divider />

          <div>
            <Text size="xs" color="dimmed">
              Purchase Rate
            </Text>
            <Text fw={600}>{product.costPrice}</Text>
          </div>

          <div>
            <Text size="xs" c="dimmed">
              Sale Rate
            </Text>
            <Text fw={600}>{product.sellingPrice}</Text>
          </div>

          <div>
            <Text size="xs" c="dimmed">
              Old Price
            </Text>
            <Text fw={600}>{product.oldPrice ?? "-"}</Text>
          </div>

          <div>
            <Text size="xs" c="dimmed">
              New Price
            </Text>
            <Text fw={600}>{product.newPrice ?? product.sellingPrice}</Text>
          </div>

          <Divider />

          <div>
            <Text size="xs" c="dimmed">
              Stock
            </Text>
            <Text fw={600}>
              {(product as any).openingStock ?? product.stock} {product.unit}
            </Text>
          </div>

          <div>
            <Text size="xs" c="dimmed">
              Color
            </Text>
            <Text fw={600}>
              {color
                ? `${color.name}${color.name ? ` (${color.name})` : ""}`
                : product.color ?? "-"}
            </Text>
          </div>

          <div>
            <Text size="xs" c="dimmed">
              Length
            </Text>
            <Text fw={600}>{product.length ?? "-"}</Text>
          </div>

          <div>
            <Text size="xs" c="dimmed">
              MSL
            </Text>
            <Text fw={600}>
              {(product as any).minimumStockLevel ?? product.minStock}
            </Text>
          </div>
        </Group>
      </Card>
    </div>
  );
}
