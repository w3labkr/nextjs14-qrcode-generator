// QR 코드 서버 액션 관련 타입 정의

export type DotType =
  | "dots"
  | "rounded"
  | "classy"
  | "classy-rounded"
  | "square"
  | "extra-rounded";

export type CornerSquareType = "dots" | "square" | "extra-rounded";

export type FileType = "png" | "jpg" | "svg" | "webp";

export type QrCodeType =
  | "URL"
  | "TEXTAREA"
  | "WIFI"
  | "EMAIL"
  | "SMS"
  | "VCARD"
  | "LOCATION";

export interface QrCodeOptions {
  text: string;
  type?: FileType | "pdf";
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  logo?: string;
  dotsOptions?: {
    type?: DotType;
    color?: string;
  };
  cornersSquareOptions?: {
    type?: CornerSquareType;
    color?: string;
  };
  frameOptions?: {
    type?: string;
    text?: string;
    textColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    fontSize?: number;
  };
}

export interface QrCodeGenerationOptions extends QrCodeOptions {
  title?: string;
  qrType: QrCodeType;
}

export interface SaveQrCodeData {
  type: string;
  title?: string;
  content: string;
  settings: any;
}

export interface ImportData {
  qrCodes?: Array<{
    type?: string;
    title?: string;
    content: string;
    settings?: any;
    isFavorite?: boolean;
  }>;
  templates?: Array<{
    name: string;
    settings?: any;
    isDefault?: boolean;
  }>;
  replaceExisting?: boolean;
}

export interface TemplateData {
  name: string;
  settings: QrCodeOptions;
  isDefault?: boolean;
}

export interface TemplateUpdateData {
  name?: string;
  settings?: QrCodeOptions;
  isDefault?: boolean;
}
