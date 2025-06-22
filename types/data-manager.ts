export interface Template {
  id: string;
  name: string;
  settings: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImportStats {
  imported: {
    qrCodes: number;
    templates: number;
  };
  total: {
    qrCodes: number;
    templates: number;
  };
}
