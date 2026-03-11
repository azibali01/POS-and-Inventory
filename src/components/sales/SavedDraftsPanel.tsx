import { useEffect, useState } from "react";
import { Paper, Text, Table, Button, Group, Loader } from "@mantine/core";
import { draftService, type DraftRecord, type DraftData } from "../../api";

export default function SavedDraftsPanel({
  mode,
  onRestore,
}: {
  mode?: "Quotation" | "Invoice";
  onRestore: (data: DraftData) => void;
}) {
  const [drafts, setDrafts] = useState<DraftRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      let list = await draftService.getAll();
      if (mode) {
        list = list.filter((draft) =>
          draft.key.startsWith(`sales-draft:${mode}`),
        );
      }
      setDrafts(list.reverse());
    } catch {
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [mode]);

  const handleDelete = async (id: string) => {
    try {
      await draftService.delete(id);
      await load();
    } catch {
      // ignore
    }
  };

  const handleRestore = (draft: DraftRecord) => {
    try {
      const payload = draft.data ?? {};
      onRestore(payload);
    } catch {
      // ignore
    }
  };

  return (
    <Paper withBorder p="sm" style={{ minWidth: 300 }}>
      <Group justify="space-between" style={{ marginBottom: 8 }}>
        <Text fw={700}>Saved Drafts</Text>
        {loading ? <Loader size="xs" /> : null}
      </Group>
      {drafts.length === 0 ? (
        <Text size="sm" c="dimmed">
          No saved drafts.
        </Text>
      ) : (
        <Table striped highlightOnHover verticalSpacing="xs">
          <thead>
            <tr>
              <th>Key</th>
              <th>Saved</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {drafts.map((draft) => (
              <tr key={draft._id ?? draft.key}>
                <td
                  style={{
                    maxWidth: 300,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {draft.key}
                </td>
                <td>
                  {draft.createdAt
                    ? new Date(draft.createdAt).toLocaleString()
                    : "-"}
                </td>
                <td style={{ textAlign: "right" }}>
                  <Group justify="flex-end">
                    <Button
                      size="xs"
                      onClick={() => {
                        handleRestore(draft);
                      }}
                    >
                      Restore
                    </Button>
                    <Button
                      color="red"
                      size="xs"
                      variant="light"
                      onClick={() => {
                        if (draft._id) {
                          void handleDelete(draft._id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Paper>
  );
}
