interface QrCodeCsvData {
  type: string;
  title: string;
  content: string;
  settings: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TemplateCsvData {
  name: string;
  settings: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export function convertQrCodesToCSV(qrCodes: any[]): string {
  if (!qrCodes || qrCodes.length === 0) {
    return "type,title,content,settings,isFavorite,createdAt,updatedAt\n";
  }

  const headers = [
    "type",
    "title",
    "content",
    "settings",
    "isFavorite",
    "createdAt",
    "updatedAt",
  ];
  const csvContent = [
    headers.join(","),
    ...qrCodes.map((qr) => {
      const row = [
        escapeCSVValue(qr.type || ""),
        escapeCSVValue(qr.title || ""),
        escapeCSVValue(qr.content || ""),
        escapeCSVValue(JSON.stringify(qr.settings || {})),
        escapeCSVValue(qr.isFavorite ? "true" : "false"),
        escapeCSVValue(
          qr.createdAt ? new Date(qr.createdAt).toISOString() : "",
        ),
        escapeCSVValue(
          qr.updatedAt ? new Date(qr.updatedAt).toISOString() : "",
        ),
      ];
      return row.join(",");
    }),
  ];

  return csvContent.join("\n");
}

export function convertTemplatesToCSV(templates: any[]): string {
  if (!templates || templates.length === 0) {
    return "name,settings,isDefault,createdAt,updatedAt\n";
  }

  const headers = ["name", "settings", "isDefault", "createdAt", "updatedAt"];
  const csvContent = [
    headers.join(","),
    ...templates.map((template) => {
      const row = [
        escapeCSVValue(template.name || ""),
        escapeCSVValue(JSON.stringify(template.settings || {})),
        escapeCSVValue(template.isDefault ? "true" : "false"),
        escapeCSVValue(
          template.createdAt ? new Date(template.createdAt).toISOString() : "",
        ),
        escapeCSVValue(
          template.updatedAt ? new Date(template.updatedAt).toISOString() : "",
        ),
      ];
      return row.join(",");
    }),
  ];

  return csvContent.join("\n");
}

export function parseQrCodesFromCSV(csvContent: string): any[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length <= 1) return [];

  const headers = parseCSVLine(lines[0]);
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) continue;

    const qrCode: any = {};
    headers.forEach((header, index) => {
      const value = values[index];
      if (header === "settings") {
        try {
          qrCode[header] = JSON.parse(value);
        } catch {
          qrCode[header] = {};
        }
      } else if (header === "isFavorite") {
        qrCode[header] = value === "true";
      } else if (header === "createdAt" || header === "updatedAt") {
        qrCode[header] = value ? new Date(value) : null;
      } else {
        qrCode[header] = value;
      }
    });

    data.push(qrCode);
  }

  return data;
}

export function parseTemplatesFromCSV(csvContent: string): any[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length <= 1) return [];

  const headers = parseCSVLine(lines[0]);
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) continue;

    const template: any = {};
    headers.forEach((header, index) => {
      const value = values[index];
      if (header === "settings") {
        try {
          template[header] = JSON.parse(value);
        } catch {
          template[header] = {};
        }
      } else if (header === "isDefault") {
        template[header] = value === "true";
      } else if (header === "createdAt" || header === "updatedAt") {
        template[header] = value ? new Date(value) : null;
      } else {
        template[header] = value;
      }
    });

    data.push(template);
  }

  return data;
}

function escapeCSVValue(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCSVLine(line: string): string[] {
  const result = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"' && inQuotes) {
      if (i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i += 2;
      } else {
        inQuotes = false;
        i++;
      }
    } else if (char === '"' && !inQuotes) {
      inQuotes = true;
      i++;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      i++;
    } else {
      current += char;
      i++;
    }
  }

  result.push(current);
  return result;
}
