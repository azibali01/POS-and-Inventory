import { useState } from "react";
import {
  Card,
  Group,
  Text,
  TextInput,
  SimpleGrid,
  Badge,
  Button,
  Textarea,
  NumberInput,
  Divider,
  Stack,
  ScrollArea,
  Modal,
  Tabs,
} from "@mantine/core";
import {
  IconSearch,
  IconShoppingCart,
  IconPlus,
  IconMinus,
  IconTrash,
  IconCalculator,
  IconCreditCard,
  IconCash,
  IconPrinter,
  IconGavel,
} from "@tabler/icons-react";

type Product = {
  id: number;
  name: string;
  code: string;
  price: number;
  unit: string;
  category: string;
  stock: number;
};

type CartItem = {
  id: number;
  name: string;
  code: string;
  price: number;
  quantity: number;
  unit: string;
  total: number;
};

const products: Product[] = [
  {
    id: 1,
    name: "Aluminium Sheet 4mm",
    code: "AS4",
    price: 450,
    unit: "sq ft",
    category: "Sheets",
    stock: 120,
  },
  {
    id: 2,
    name: "Aluminium Pipe 2 inch",
    code: "AP2",
    price: 280,
    unit: "ft",
    category: "Pipes",
    stock: 85,
  },
  {
    id: 3,
    name: "Aluminium Angle 25mm",
    code: "AA25",
    price: 180,
    unit: "ft",
    category: "Angles",
    stock: 200,
  },
  {
    id: 4,
    name: "Aluminium Channel 50mm",
    code: "AC50",
    price: 320,
    unit: "ft",
    category: "Channels",
    stock: 150,
  },
  {
    id: 5,
    name: "Aluminium Rod 10mm",
    code: "AR10",
    price: 95,
    unit: "ft",
    category: "Rods",
    stock: 300,
  },
  {
    id: 6,
    name: "Aluminium Wire 2.5mm",
    code: "AW25",
    price: 65,
    unit: "kg",
    category: "Wires",
    stock: 75,
  },
];

export default function POS() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(18);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [notes, setNotes] = useState<string>("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [amountReceived, setAmountReceived] = useState<number | undefined>(
    undefined
  );
  const [bankRef, setBankRef] = useState<string>("");
  const [onlineTxn, setOnlineTxn] = useState<string>("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [showGatePass, setShowGatePass] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string>(() => {
    // Generate invoice number starting from 01 and increment for each invoice
    const storedNum = localStorage.getItem("haq_invoice_num");
    const num = storedNum ? parseInt(storedNum, 10) : 1;
    localStorage.setItem("haq_invoice_num", (num + 1).toString());
    return `INV-${num.toString().padStart(2, "0")}`;
  });

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price,
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          code: product.code,
          price: product.price,
          quantity: 1,
          unit: product.unit,
          total: product.price,
        },
      ]);
    }
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(
      cart.map((item) =>
        item.id === id
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      )
    );
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setNotes("");
    setCustomerName("");
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * tax) / 100;
  const grandTotal = taxableAmount + taxAmount;

  const handleGatePass = () => {
    setShowGatePass(true);
    setTimeout(() => {
      window.print();
      setShowGatePass(false);
      clearCart();
    }, 100);
  };

  const handlePrintInvoice = () => {
    setShowInvoice(true);
    setTimeout(() => {
      window.print();
      setShowInvoice(false);
    }, 100);
  };

  const handleCompleteSale = () => {
    // Complete sale logic
    setIsPaymentModalOpen(false);
    clearCart();
  };

  return (
    <div>
      <Text fw={700} fz="xl" mb="md">
        POS
      </Text>
      <SimpleGrid cols={1} spacing="md">
        <div>
          <Group align="flex-start" gap="md">
            {/* Product Selection */}
            <Card
              withBorder
              radius="md"
              p="md"
              bg="#F5F5F5"
              style={{ flex: 2 }}
            >
              <Group mb="sm">
                <IconSearch size={18} />
                <Text fw={500}>Product Search</Text>
              </Group>
              <TextInput
                placeholder="Search products by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                mb="md"
              />
              <SimpleGrid cols={3} spacing="md">
                {filteredProducts.map((product) => (
                  <Card key={product.id} withBorder radius="md" p="md">
                    <Text fw={600}>{product.name}</Text>
                    <Text c="dimmed" fz="sm">
                      Code: {product.code}
                    </Text>
                    <Text fw={600} mt="sm">
                      {product.price}/{product.unit}
                    </Text>
                    <Text fz="sm" c="dimmed">
                      Stock: {product.stock}
                    </Text>
                    <Group justify="space-between" mt="sm">
                      <Badge color="gray">{product.category}</Badge>
                      <Button
                        size="xs"
                        color="#5E78D9"
                        onClick={() => addToCart(product)}
                      >
                        <IconPlus size={16} />
                      </Button>
                    </Group>
                  </Card>
                ))}
              </SimpleGrid>
            </Card>
            <Stack gap="md" style={{ flex: 1, minWidth: 320, maxWidth: 380 }}>
              {/* Cart */}
              <Card withBorder radius="md" p="md">
                <Group mb="sm">
                  <IconShoppingCart size={18} />
                  <Text fw={500}>Cart ({cart.length} items)</Text>
                </Group>
                <ScrollArea h={180}>
                  {cart.length === 0 ? (
                    <Text c="dimmed" ta="center" py="md">
                      Cart is empty
                    </Text>
                  ) : (
                    cart.map((item) => (
                      <Group key={item.id} align="center" mb="xs">
                        <Stack gap={0} style={{ flex: 1 }}>
                          <Text fw={500} fz="sm">
                            {item.name}
                          </Text>
                          <Text fz="xs" c="dimmed">
                            {item.price}/{item.unit}
                          </Text>
                        </Stack>
                        <Group>
                          <Button
                            size="xs"
                            variant="default"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <IconMinus size={14} />
                          </Button>
                          <Text
                            fz="sm"
                            style={{ width: 24, textAlign: "center" }}
                          >
                            {item.quantity}
                          </Text>
                          <Button
                            size="xs"
                            variant="default"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <IconPlus size={14} />
                          </Button>
                          <Button
                            size="xs"
                            color="red"
                            variant="light"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <IconTrash size={14} />
                          </Button>
                        </Group>
                        <Text
                          fw={600}
                          fz="sm"
                          style={{ width: 60, textAlign: "right" }}
                        >
                          {item.total}
                        </Text>
                      </Group>
                    ))
                  )}
                </ScrollArea>
                {cart.length > 0 && (
                  <Button
                    variant="light"
                    color="red"
                    onClick={clearCart}
                    fullWidth
                    mt="md"
                  >
                    Clear Cart
                  </Button>
                )}
              </Card>

              {/* Billing Details */}
              <Card withBorder radius="md" p="md" bg="#F5F5F5">
                <Group mb="sm">
                  <IconCalculator size={18} />
                  <Text fw={500}>Billing Details</Text>
                </Group>
                <TextInput
                  label="Invoice No."
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.currentTarget.value)}
                  mb="sm"
                />
                <TextInput
                  label="Customer Name"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.currentTarget.value)}
                  mb="sm"
                />
                <Group grow mb="sm">
                  <NumberInput
                    label="Discount (%)"
                    value={discount}
                    min={0}
                    max={100}
                    onChange={(value) =>
                      setDiscount(
                        typeof value === "number" ? value : Number(value)
                      )
                    }
                  />
                  <NumberInput
                    label="Tax (%)"
                    value={tax}
                    min={0}
                    max={100}
                    onChange={(value) =>
                      setTax(typeof value === "number" ? value : Number(value))
                    }
                  />
                </Group>
                <Textarea
                  label="Notes"
                  placeholder="Additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.currentTarget.value)}
                  mb="md"
                />
                <Divider mb="sm" />
                <Stack gap={4}>
                  <Group justify="space-between">
                    <Text fz="sm">Subtotal:</Text>
                    <Text fz="sm">{subtotal.toFixed(2)}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text fz="sm">Discount ({discount}%):</Text>
                    <Text fz="sm">-{discountAmount.toFixed(2)}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text fz="sm">Tax ({tax}%):</Text>
                    <Text fz="sm">{taxAmount.toFixed(2)}</Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text fw={600} fz="lg">
                      Total:
                    </Text>
                    <Text fw={600} fz="lg">
                      {grandTotal.toFixed(2)}
                    </Text>
                  </Group>
                </Stack>
                <Group grow mt="md">
                  <Button
                    variant="default"
                    onClick={handleGatePass}
                    disabled={cart.length === 0}
                  >
                    Gate Pass
                  </Button>
                  <Button
                    color="#5E78D9"
                    onClick={() => setIsPaymentModalOpen(true)}
                    disabled={cart.length === 0}
                  >
                    Payment
                  </Button>
                </Group>
              </Card>
            </Stack>
          </Group>
        </div>
      </SimpleGrid>

      {/* Payment Modal */}
      <Modal
        opened={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={
          <Text fw={600} fz={20}>
            Process Payment
          </Text>
        }
        centered
        size="lg"
      >
        <Stack>
          <Text fz={16} fw={500} mb={8}>
            Total Amount: {grandTotal.toFixed(2)}
          </Text>
          <Tabs
            value={paymentMethod}
            onChange={(value) => {
              if (value !== null) setPaymentMethod(value);
            }}
            variant="outline"
            radius="md"
          >
            <Tabs.List grow mb="md">
              <Tabs.Tab value="cash">Cash</Tabs.Tab>
              <Tabs.Tab value="bank">Bank</Tabs.Tab>
              <Tabs.Tab value="online">Online</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="cash">
              <Group mb={8}>
                <IconCash size={20} />
                <Text fw={500}>Cash Payment</Text>
              </Group>
              <NumberInput
                label="Amount received"
                value={amountReceived}
                onChange={(value) =>
                  setAmountReceived(
                    typeof value === "number" ? value : Number(value)
                  )
                }
                min={0}
                mb="md"
              />
            </Tabs.Panel>
            <Tabs.Panel value="bank">
              <Group mb={8}>
                <IconCreditCard size={20} />
                <Text fw={500}>Bank Payment</Text>
              </Group>
              <TextInput
                label="Bank Reference No."
                value={bankRef}
                onChange={(e) => setBankRef(e.currentTarget.value)}
                mb="md"
              />
            </Tabs.Panel>
            <Tabs.Panel value="online">
              <Group mb={8}>
                <IconPrinter size={20} />
                <Text fw={500}>Online Payment</Text>
              </Group>
              <TextInput
                label="Transaction ID"
                value={onlineTxn}
                onChange={(e) => setOnlineTxn(e.currentTarget.value)}
                mb="md"
              />
            </Tabs.Panel>
          </Tabs>
          <Group grow mt={16}>
            <Button
              variant="default"
              leftSection={<IconPrinter size={18} />}
              onClick={handlePrintInvoice}
            >
              Print Invoice
            </Button>
            <Button
              color="#5E78D9"
              leftSection={<IconGavel size={18} />}
              onClick={handleCompleteSale}
            >
              Complete Sale
            </Button>
          </Group>
        </Stack>
      </Modal>

      {showInvoice && (
        <div
          id="invoice-print"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "white",
            zIndex: 9999,
            padding: 32,
          }}
        >
          <Card
            withBorder
            radius="md"
            p="xl"
            style={{ maxWidth: 600, margin: "40px auto" }}
          >
            {/* Header */}
            <Stack align="center" mb={16}>
              <Text fw={900} fz={28} c="#5E78D9">
                Haq Aluminum
              </Text>
              <Text fw={700} fz={20} mb={8}>
                INVOICE
              </Text>
            </Stack>
            <Divider mb={16} />
            <Text fz={16} mb={4}>
              Invoice No.: {invoiceNumber}
            </Text>
            <Text fz={16} mb={4}>
              Customer: {customerName || "Walk-in Customer"}
            </Text>
            <Text fz={16} mb={4}>
              Date: {new Date().toLocaleDateString()}
            </Text>
            <Divider mb={16} />
            <Stack gap={4}>
              {cart.map((item) => (
                <Group key={item.id} justify="space-between">
                  <Text>
                    {item.name} ({item.unit}) x {item.quantity}
                  </Text>
                  <Text>{item.total.toFixed(2)}</Text>
                </Group>
              ))}
            </Stack>
            <Divider mb={16} />
            <Group justify="space-between">
              <Text>Subtotal:</Text>
              <Text>{subtotal.toFixed(2)}</Text>
            </Group>
            <Group justify="space-between">
              <Text>Discount:</Text>
              <Text>-{discountAmount.toFixed(2)}</Text>
            </Group>
            <Group justify="space-between">
              <Text>Tax:</Text>
              <Text>{taxAmount.toFixed(2)}</Text>
            </Group>
            <Divider mb={16} />
            <Group justify="space-between">
              <Text fw={600} fz={18}>
                Total:
              </Text>
              <Text fw={600} fz={18}>
                {grandTotal.toFixed(2)}
              </Text>
            </Group>
            <Divider mb={16} />
            <Text fz={14} mb={4}>
              Payment Method:{" "}
              {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
            </Text>
            <Text fz={14} mb={4}>
              Amount Received: {amountReceived || 0}
            </Text>
            {paymentMethod === "bank" && (
              <Text fz={14} mb={4}>
                Bank Reference No.: {bankRef || "-"}
              </Text>
            )}
            {paymentMethod === "online" && (
              <Text fz={14} mb={4}>
                Transaction ID: {onlineTxn || "-"}
              </Text>
            )}
            <Text fz={14} mb={4}>
              Notes: {notes}
            </Text>
            {/* Footer */}
            <Divider mt={24} mb={8} />
            <Stack align="center" gap={0}>
              <Text fz={14} color="#888">
                Thank you for your business!
              </Text>
              <Text fz={12} color="#aaa">
                Haq Aluminum, All rights reserved.
              </Text>
            </Stack>
          </Card>
        </div>
      )}

      {showGatePass && (
        <div
          id="gatepass-print"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "white",
            zIndex: 9999,
            padding: 32,
          }}
        >
          <Card
            withBorder
            radius="md"
            p="xl"
            style={{ maxWidth: 600, margin: "40px auto" }}
          >
            {/* Header */}
            <Stack align="center" mb={16}>
              <Text fw={900} fz={28} color="#5E78D9">
                Haq Aluminum
              </Text>
              <Text fw={700} fz={20} mb={8}>
                GATE PASS
              </Text>
            </Stack>
            <Divider mb={16} />
            <Text fz={16} mb={4}>
              Invoice No.: {invoiceNumber}
            </Text>
            <Text fz={16} mb={4}>
              Customer: {customerName || "Walk-in Customer"}
            </Text>
            <Text fz={16} mb={4}>
              Date: {new Date().toLocaleDateString()}
            </Text>
            <Divider mb={16} />
            <Stack gap={4}>
              {cart.map((item) => (
                <Group key={item.id} justify="space-between">
                  <Text>
                    {item.name} ({item.unit}) x {item.quantity}
                  </Text>
                </Group>
              ))}
            </Stack>
            <Divider mb={16} />
            <Text fz={14} mb={4}>
              Notes: {notes}
            </Text>
            {/* Footer */}
            <Divider mt={24} mb={8} />
            <Stack align="center" gap={0}>
              <Text fz={14} color="#888">
                Goods issued as per above details.
              </Text>
              <Text fz={12} color="#aaa">
                Haq Aluminum, All rights reserved.
              </Text>
            </Stack>
          </Card>
        </div>
      )}
    </div>
  );
}
