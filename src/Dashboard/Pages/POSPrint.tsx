import { Paper, Table, Group, Stack, Text, Divider } from "@mantine/core";

type Row = {
  section: string;
  color: string;
  thick: string;
  size: string;
  lengths: string;
  totalFeet: string;
  rate: string;
  grossAmount: string;
  discount: string;
  amount: string;
};

type POSPrintProps = {
  invoiceNo: string;
  customerName: string;
  customerPhone: string;
  gpNo: string;
  ms: string;
  date: string;
  rows: Row[];
  totalAmount: number;
  receivedAmount: string;
};

export function POSPrint({
  invoiceNo,
  customerName,
  customerPhone,
  gpNo,
  ms,
  date,
  rows,
  totalAmount,
  receivedAmount,
}: POSPrintProps) {
  return (
    <Paper
      shadow="xs"
      p="md"
      radius={0}
      withBorder={false}
      style={{ background: "#fff" }}
    >
      {/* Header */}
      <Stack gap={0} mb="xs">
        <Group justify="space-between">
          <Group gap="xs">
            <Text fw={900} fz={22} c="green">
              SEVEN STAR TRADERS
            </Text>
            <Text fw={700} fz="sm" c="teal">
              THE NAME OF QUALITY
            </Text>
          </Group>
          <Text fw={700} fz="lg" c="red">
            سیون اسٹار ٹریڈرز
          </Text>
        </Group>
        <Group justify="space-between" mt={2}>
          <Text fz="sm">0307-5699005</Text>
          <Text fz="sm">حسن احمد</Text>
        </Group>
        <Divider my={4} />
        <Group gap="md" mb={2}>
          <Text fw={500} fz="sm">
            Sr. No.: {invoiceNo}
          </Text>
          <Text fw={500} fz="sm">
            G.P No.: {gpNo}
          </Text>
          <Text fw={500} fz="sm">
            Date: {date}
          </Text>
        </Group>
        <Text fw={500} fz="sm" mb={2}>
          M/S: {ms}
        </Text>
        <Group gap="md" mb={2}>
          <Text fw={500} fz="sm">
            Customer Name: {customerName}
          </Text>
          <Text fw={500} fz="sm">
            Customer Phone No.: {customerPhone}
          </Text>
        </Group>
      </Stack>

      {/* Table */}
      <Table withColumnBorders highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Sr.#</Table.Th>
            <Table.Th>Section</Table.Th>
            <Table.Th>Color</Table.Th>
            <Table.Th>Thick</Table.Th>
            <Table.Th>Size ft</Table.Th>
            <Table.Th>No. of Lengths</Table.Th>
            <Table.Th>Total Feet</Table.Th>
            <Table.Th>Rate</Table.Th>
            <Table.Th>Gross Amount</Table.Th>
            <Table.Th>Discount</Table.Th>
            <Table.Th>Amount</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row, idx) => (
            <Table.Tr key={idx}>
              <Table.Td>{idx + 1}</Table.Td>
              <Table.Td>{row.section}</Table.Td>
              <Table.Td>{row.color}</Table.Td>
              <Table.Td>{row.thick}</Table.Td>
              <Table.Td>{row.size}</Table.Td>
              <Table.Td>{row.lengths}</Table.Td>
              <Table.Td>{row.totalFeet}</Table.Td>
              <Table.Td>{row.rate}</Table.Td>
              <Table.Td>{row.grossAmount}</Table.Td>
              <Table.Td>{row.discount}</Table.Td>
              <Table.Td>{row.amount}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
        <Table.Tfoot>
          <Table.Tr>
            <Table.Td colSpan={9} />
            <Table.Td fw={700}>Total</Table.Td>
            <Table.Td fw={700}>{totalAmount.toFixed(2)}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td colSpan={9} />
            <Table.Td fw={700}>Received Amount</Table.Td>
            <Table.Td fw={700}>{receivedAmount}</Table.Td>
          </Table.Tr>
        </Table.Tfoot>
      </Table>

      {/* Footer */}
      <Divider my="md" />
      <Stack gap={0}>
        <Text fw={700} fz="sm" c="gray">
          Extrusion & Powder Coating
        </Text>
        <Text fz="sm" c="teal">
          Aluminum Window, Door, Profiles & All Kinds of Pipes
        </Text>
        <Text fz="xs" c="dimmed">
          Nasir Gardezi Road, Chowk Fawara, Bohar Gate Multan.
        </Text>
        <Group justify="apart" mt="sm">
          <Text fw={700}>By __________________</Text>
          <Text fw={700}>Signature __________________</Text>
        </Group>
      </Stack>
    </Paper>
  );
}
