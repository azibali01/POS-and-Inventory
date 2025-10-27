import { NumberInput, TextInput, Button, Avatar, Group } from "@mantine/core";
import Table from "../../../lib/AppTable";
import { Trash } from "lucide-react";
import type { PurchaseLineItem } from "./types";

export default function GRNLineItemsTable({
  items,
  onChange,
}: {
  items: PurchaseLineItem[];
  onChange: (items: PurchaseLineItem[]) => void;
}) {
  function update(id: string, patch: Partial<PurchaseLineItem>) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function remove(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  return (
    <Table highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th></Table.Th>
          <Table.Th>Item</Table.Th>
          <Table.Th>Color</Table.Th>
          <Table.Th>Thickness</Table.Th>
          <Table.Th>Length</Table.Th>
          <Table.Th>Qty</Table.Th>
          <Table.Th>Rate</Table.Th>
          <Table.Th>Amount</Table.Th>
          <Table.Th></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {items.map((it) => (
          <Table.Tr key={it.id}>
            <Table.Td>
              <Group>
                <Avatar radius="xl">
                  {String(it.productName || it.productId || "?")
                    .charAt(0)
                    .toUpperCase()}
                </Avatar>
              </Group>
            </Table.Td>
            <Table.Td style={{ minWidth: 200 }}>
              <TextInput
                value={it.productName}
                onChange={(e) =>
                  update(it.id, { productName: e.currentTarget.value })
                }
              />
            </Table.Td>
            <Table.Td>
              <TextInput
                value={it.color ?? ""}
                onChange={(e) =>
                  update(it.id, { color: e.currentTarget.value })
                }
              />
            </Table.Td>
            <Table.Td>
              <TextInput
                value={String(it.thickness ?? "")}
                onChange={(e) =>
                  update(it.id, { thickness: e.currentTarget.value })
                }
                placeholder="Thickness"
              />
            </Table.Td>
            <Table.Td>
              <TextInput
                value={String(it.length ?? "")}
                onChange={(e) =>
                  update(it.id, { length: e.currentTarget.value })
                }
              />
            </Table.Td>
            <Table.Td>
              <NumberInput
                value={it.quantity}
                onChange={(v) => update(it.id, { quantity: Number(v || 0) })}
              />
            </Table.Td>
            <Table.Td>
              <NumberInput
                value={it.rate}
                onChange={(v) => update(it.id, { rate: Number(v || 0) })}
              />
            </Table.Td>
            <Table.Td>
              {((it.quantity || 0) * (it.rate || 0)).toFixed(2)}
            </Table.Td>
            <Table.Td>
              <Button variant="subtle" onClick={() => remove(it.id)}>
                <Trash size={14} />
              </Button>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
