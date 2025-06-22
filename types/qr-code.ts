export type QrCodeFormat = "png" | "svg" | "jpeg";

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

export interface QrCodePreviewCardProps {
  qrCode: string;
  frameOptions: FrameOptions;
  format: QrCodeFormat;
  onFormatChange: (format: QrCodeFormat) => void;
  onGenerate: () => void;
  onGenerateHighRes: () => void;
  isLoading: boolean;
  isGeneratingHighRes: boolean;
  isEditMode: boolean;
  qrData: string;
  highResQrCode: string;
  getDownloadFilename: () => string;
  getHighResDownloadFilename: () => string;
  currentSettings: QrCodeGeneratorSettings;
}

export interface QrCodeGeneratorSettings {
  text: string;
  type: QrCodeFormat;
  width: number;
  color?: {
    dark: string;
    light: string;
  };
  logo?: string;
  dotsOptions?: any;
  cornersSquareOptions?: any;
  frameOptions?: FrameOptions;
}
