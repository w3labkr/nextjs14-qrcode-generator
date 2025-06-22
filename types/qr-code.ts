export type QrCodeFormat = "png" | "svg" | "jpeg" | "pdf";

export type QrCodeType =
  | "URL"
  | "TEXT"
  | "WIFI"
  | "EMAIL"
  | "SMS"
  | "VCARD"
  | "LOCATION";

export type FrameType = "none" | "scan-me" | "simple" | "rounded" | "custom";

export interface FrameOptions {
  type: FrameType;
  text?: string;
  textColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

export interface QrCodeSettings {
  foregroundColor: string;
  backgroundColor: string;
  logo: string | null;
  format: QrCodeFormat;
  width: number;
  frameOptions: FrameOptions;
}

export interface QrCodeState {
  qrData: string;
  activeTab: string;
  qrCode: string;
  highResQrCode: string;
  isLoading: boolean;
  isGeneratingHighRes: boolean;
}

export interface EditModeState {
  isEditMode: boolean;
  editingQrCodeId: string | null;
}

export interface TemplateState {
  templateApplied: boolean;
  defaultTemplateLoaded: boolean;
}
