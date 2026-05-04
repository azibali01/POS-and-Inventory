import { Anchor, Center, Container, Paper, Stack, Text, Title } from "@mantine/core";

const PHONE = "03079744363";
const PHONE_DISPLAY = "0307 9744363";
const TEL_HREF = `tel:+92${PHONE.slice(1)}`;

const urduFont =
  "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'Urdu Typesetting', serif";

type ContactLandingPageProps = {
  /** When true, renders only the card (for overlay on blurred dashboard). */
  embedded?: boolean;
};

const ContactLandingPage = ({ embedded = false }: ContactLandingPageProps) => {
  const card = (
    <Paper shadow="md" p="xl" radius="md" withBorder>
      <Stack gap="lg">
        <Title order={2} ta="center" c="dark.7">
          Contact
        </Title>

        <Stack gap={4}>
          <Text size="xs" c="dimmed" ta="center" fs="italic">
            For demo only — the complete software includes all full features.
          </Text>
          <Text
            size="xs"
            c="dimmed"
            ta="center"
            dir="rtl"
            style={{ fontFamily: urduFont, lineHeight: 1.8 }}
          >
            صرف ڈیمو — مکمل سافٹ ویئر میں تمام خصوصیات شامل ہیں۔
          </Text>
        </Stack>

        <Stack gap="sm" ta="center">
          <Text size="lg" c="dimmed">
            If you would like to use this software, please contact us at the number below.
          </Text>
          <Anchor href={TEL_HREF} size="xl" fw={700} c="blue.7">
            {PHONE_DISPLAY}
          </Anchor>
          <Text size="sm" c="dimmed" span>
            ({PHONE})
          </Text>
        </Stack>

        <Title order={2} ta="center" c="dark.7" mt="md">
          رابطہ
        </Title>

        <Stack gap="sm" ta="center" dir="rtl" style={{ fontFamily: urduFont }}>
          <Text size="lg" c="dimmed" lh={2}>
            اگر آپ یہ سافٹ ویئر حاصل کرنا چاہتے ہیں تو براہ کرم درج ذیل نمبر پر رابطہ کریں۔
          </Text>
          <Anchor href={TEL_HREF} size="xl" fw={700} c="blue.7" dir="ltr" display="inline-block">
            {PHONE_DISPLAY}
          </Anchor>
          <Text size="sm" c="dimmed" span dir="ltr">
            ({PHONE})
          </Text>
        </Stack>
      </Stack>
    </Paper>
  );

  if (embedded) {
    return card;
  }

  return (
    <Center mih="100dvh" p="md" bg="var(--mantine-color-gray-0)">
      <Container size="sm" w="100%">
        {card}
      </Container>
    </Center>
  );
};

export default ContactLandingPage;
