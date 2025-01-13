import { Form, ActionPanel, Action, showToast, Toast, getPreferenceValues, open } from "@raycast/api";
import { VocabularySheet } from "./sheet";

interface Preferences {
  spreadsheetId: string;
  sheetId: number;
  clientEmail: string;
  privateKey: string;
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const sheet = new VocabularySheet(preferences);

  async function handleSubmit({ word, notes }: { word: string; notes?: string }) {
    try {
      await sheet.addWord(word, notes);

      const url = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word)}`;
      await open(url);

      await showToast({
        style: Toast.Style.Success,
        title: "Word saved",
        message: "Added to vocabulary list",
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to save word",
        message: String(error),
      });
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Look Up Word" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="word" title="Word" placeholder="Enter word to look up" autoFocus />
      <Form.TextField id="notes" title="Notes" placeholder="Optional notes" />
    </Form>
  );
}
