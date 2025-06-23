interface QrCodeCsvData {
  id: string;
  content: string;
  type: string;
  qrStyle: string;
  createdAt: string;
  updatedAt: string;
}

interface TemplateCsvData {
  id: string;
  name: string;
  settings: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export function convertQrCodesToCSV(qrCodes: any[]): string {
  if (!qrCodes || qrCodes.length === 0) {
    return "id,content,type,qrStyle,createdAt,updatedAt\n";
  }

  const headers = [
    "id",
    "content",
    "type",
    "qrStyle",
    "createdAt",
    "updatedAt",
  ];
  const csvContent = [
    headers.join(","),
    ...qrCodes.map((qr) => {
      const row = [
        escapeCSVValue(qr.id || ""),
        escapeCSVValue(qr.content || ""),
        escapeCSVValue(qr.type || ""),
        escapeCSVValue(JSON.stringify(qr.qrStyle || {})),
        escapeCSVValue(qr.createdAt || ""),
        escapeCSVValue(qr.updatedAt || ""),
      ];
      return row.join(",");
    }),
  ];

  return csvContent.join("\n");
}

export function convertTemplatesToCSV(templates: any[]): string {
  if (!templates || templates.length === 0) {
    return "id,name,settings,isDefault,createdAt,updatedAt\n";
  }

  const headers = [
    "id",
    "name",
    "settings",
    "isDefault",
    "createdAt",
    "updatedAt",
  ];
  const csvContent = [
    headers.join(","),
    ...templates.map((template) => {
      const row = [
        escapeCSVValue(template.id || ""),
        escapeCSVValue(template.name || ""),
        escapeCSVValue(template.settings || ""),
        escapeCSVValue(template.isDefault ? "true" : "false"),
        escapeCSVValue(template.createdAt || ""),
        escapeCSVValue(template.updatedAt || ""),
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
      if (header === "qrStyle") {
        try {
          qrCode[header] = JSON.parse(value);
        } catch {
          qrCode[header] = {};
        }
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
      if (header === "isDefault") {
        template[header] = value === "true";
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
