
import { useDataContext } from "../../Context/DataContext";
import { Table, Title, Text } from "@mantine/core";

function getLastTransaction(item: any, transactions: any[], type: 'sale' | 'purchase'): any | null {
  // type: 'sale' or 'purchase'
  let last: any = null;
  let lastDate: Date | null = null;
  for (const tx of transactions) {
    const txItems: any[] = (type === 'sale' ? tx.items || tx.products : tx.products) || [];
    const match = txItems.find(
      (it: any) =>
        String(it._id ?? it.id ?? it.productId ?? it.productName ?? it.sku ?? "") === String(item._id) ||
        String(it.productName ?? it.itemName ?? "") === String(item.itemName)
    );
    if (match) {
      const date = new Date(tx.invoiceDate || tx.date || tx.poDate || tx.createdAt || 0);
      if (!lastDate || date > lastDate) {
        last = match;
        lastDate = date;
      }
    }
  }
  return last ? { ...last, date: lastDate } : null;
}

export default function Stocksummary() {
  const { inventory, sales, purchases } = useDataContext();

  return (
    <div>
      <Title order={2} mb="md">Stock Summary</Title>
      <Table withColumnBorders withRowBorders striped highlightOnHover withTableBorder >
        <Table.Thead bg={"gray.1"}>
          <Table.Tr>
            <Table.Th>Product</Table.Th>
            <Table.Th>Current Stock</Table.Th>
            <Table.Th>Last Sale</Table.Th>
            <Table.Th>Last Purchase</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {inventory.map((item) => {
            const lastSale = getLastTransaction(item, sales, 'sale');
            const lastPurchase = getLastTransaction(item, purchases, 'purchase');
            return (
              <Table.Tr key={item._id}>
                <Table.Td>{item.itemName} (Thickness: {item.thickness ?? '-'}, Color: {item.color ?? '-'})</Table.Td>
                <Table.Td>{item.openingStock ?? item.stock ?? 0}</Table.Td>
                <Table.Td>
                  {lastSale
                    ? `-${lastSale.quantity ?? 0} @ ${lastSale.salesRate ?? lastSale.price ?? ''} (${lastSale.date?.toLocaleDateString?.() ?? ''})`
                    : <Text color="dimmed">—</Text>}
                </Table.Td>
                <Table.Td>
                  {lastPurchase
                    ? `+${lastPurchase.quantity ?? lastPurchase.received ?? 0} @ ${lastPurchase.rate ?? ''} (${lastPurchase.date?.toLocaleDateString?.() ?? ''})`
                    : <Text color="dimmed">—</Text>}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </div>
  );
}

             