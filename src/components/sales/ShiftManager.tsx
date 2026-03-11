import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useShift } from "../../hooks/useShift";

interface ShiftManagerProps {
  opened: boolean;
  onClose: () => void;
}

export default function ShiftManager({ opened, onClose }: ShiftManagerProps) {
  const {
    activeSession,
    currentSalesTotal,
    openShiftAsync,
    closeShiftAsync,
    isOpening,
    isClosing,
  } = useShift();
  const [openingBalance, setOpeningBalance] = useState<number | string>(0);
  const [closingBalance, setClosingBalance] = useState<number | string>(0);

  useEffect(() => {
    if (!opened) return;
    setOpeningBalance(0);
    setClosingBalance(currentSalesTotal);
  }, [opened, currentSalesTotal]);

  const handleOpenShift = async () => {
    await openShiftAsync({ openingBalance: Number(openingBalance || 0) });
    showNotification({
      title: "Shift opened",
      message: "You can start recording sales now.",
      color: "green",
    });
    onClose();
  };

  const handleCloseShift = async () => {
    await closeShiftAsync({ closingBalance: Number(closingBalance || 0) });
    showNotification({
      title: "Shift closed",
      message: "The current shift has been closed.",
      color: "blue",
    });
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Shift Manager" centered>
      <Stack>
        {activeSession ? (
          <>
            <Group justify="space-between">
              <Text fw={600}>Current Shift</Text>
              <Badge color="green" variant="light">
                Open
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              Started at {new Date(activeSession.startTime).toLocaleString()}
            </Text>
            <Text size="sm">
              Opening balance: Rs.{" "}
              {Number(activeSession.openingBalance || 0).toFixed(2)}
            </Text>
            <Text size="sm">
              Current sales total: Rs.{" "}
              {Number(currentSalesTotal || 0).toFixed(2)}
            </Text>
            <NumberInput
              label="Closing Balance"
              min={0}
              decimalScale={2}
              fixedDecimalScale
              value={closingBalance}
              onChange={setClosingBalance}
            />
            <Group justify="flex-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button loading={isClosing} onClick={handleCloseShift}>
                Close Shift
              </Button>
            </Group>
          </>
        ) : (
          <>
            <Text size="sm" c="dimmed">
              No shift is currently open for your account.
            </Text>
            <NumberInput
              label="Opening Balance"
              min={0}
              decimalScale={2}
              fixedDecimalScale
              value={openingBalance}
              onChange={setOpeningBalance}
            />
            <Group justify="flex-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button loading={isOpening} onClick={handleOpenShift}>
                Open Shift
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}
