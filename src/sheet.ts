import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { showToast, Toast } from "@raycast/api";

interface SheetConfig {
  spreadsheetId: string;
  sheetId: number;
  clientEmail: string;
  privateKey: string;
}

export class VocabularySheet {
  private doc: GoogleSpreadsheet;
  private config: SheetConfig;

  constructor(config: SheetConfig) {
    try {
      this.config = config;

      console.log("Configuration:", {
        spreadsheetId: config.spreadsheetId,
        sheetId: config.sheetId,
        clientEmail: config.clientEmail,
        privateKeyLength: config.privateKey.length,
      });

      const formattedKey = config.privateKey.replace(/\\n/g, "\n").replace(/"$/, "").replace(/^"/, "");

      console.log("Private key starts with:", formattedKey.substring(0, 27));
      console.log("Private key ends with:", formattedKey.substring(formattedKey.length - 25));

      const auth = new JWT({
        email: config.clientEmail,
        key: formattedKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      this.doc = new GoogleSpreadsheet(config.spreadsheetId, auth);
    } catch (error) {
      console.error("Constructor error:", error);
      throw error;
    }
  }

  async testConnection() {
    try {
      await this.doc.loadInfo();
      console.log("Successfully connected to spreadsheet:", this.doc.title);
      return true;
    } catch (error) {
      console.error("Connection test failed:", error);
      throw error;
    }
  }

  async initializeSheet() {
    try {
      await this.doc.loadInfo();
      console.log("Available sheets:", Object.keys(this.doc.sheetsById));

      let sheet = this.doc.sheetsById[this.config.sheetId];

      if (!sheet) {
        console.log("Sheet not found, creating new sheet");
        sheet = await this.doc.addSheet({
          headerValues: ["word", "date_added", "notes"],
          title: "Vocabulary",
        });
      }

      return sheet;
    } catch (error) {
      console.error("Sheet initialization error:", error);

      await showToast({
        style: Toast.Style.Failure,
        title: "Sheet initialization failed",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message: `Error: ${(error as any).message}`,
      });
      throw error;
    }
  }

  async addWord(word: string, notes: string = "") {
    try {
      console.log("Adding word:", word);
      const sheet = await this.initializeSheet();
      await sheet.addRow({
        word,
        notes,
        date_added: formatDate(new Date()),
      });
      console.log("Word added successfully");
      return true;
    } catch (error) {
      console.error("Error adding word:", error);
      throw error;
    }
  }
}

function formatDate(date: Date): string {
  return date.toLocaleString("pl-PL", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
