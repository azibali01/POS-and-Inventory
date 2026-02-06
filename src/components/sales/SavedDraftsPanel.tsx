import { useEffect, useState } from "react";
import { Paper, Text, Table, Button, Group, Loader } from "@mantine/core";
import { api } from "../../lib/api";

export default function SavedDraftsPanel({
  mode,
  onRestore,
}: {
  mode?: "Quotation" | "Invoice";
  onRestore: (data: any) => void;
}) {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/drafts");
      let list = Array.isArray(data) ? data : [];
      if (mode) list = list.filter((d: any) => String(d.key).startsWith(`sales-draft:${mode}`));
      setDrafts(list.reverse());
    } catch (err) {
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [mode]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/drafts/${id}`);
      load();
    } catch (err) {
      // ignore
    }
  };

  const handleRestore = (d: any) => {
    try {
      const payload = d.data ?? {};
      onRestore(payload);
    } catch (err) {
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
        <Text size="sm" color="dimmed">
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
            {drafts.map((d) => (
              <tr key={d._id}>
                <td style={{ maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.key}</td>
                <td>{d.createdAt ? new Date(d.createdAt).toLocaleString() : "-"}</td>
                <td style={{ textAlign: "right" }}>
                  <Group justify="flex-end">
                    <Button size="xs" onClick={() => { handleRestore(d); }}>
                      Restore
                    </Button>
                    <Button color="red" size="xs" variant="light" onClick={() => handleDelete(d._id)}>
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
