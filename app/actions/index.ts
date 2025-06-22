// 모든 QR 코드 관련 액션들을 한 곳에서 export

// Types
export * from "@/types/qr-code-server";

// QR Code Generation
export {
  generateQrCode,
  generateHighResQrCode,
  generateAndSaveQrCode,
} from "./qr-code-generator";

// QR Code Management
export {
  getUserQrCodes,
  toggleQrCodeFavorite,
  deleteQrCode,
  updateQrCode,
  saveQrCode,
  getQrCodeStats,
} from "./qr-code-management";

// Template Management
export {
  getUserTemplates,
  saveTemplate,
  updateTemplate,
  deleteTemplate,
  getDefaultTemplate,
} from "./template-management";

// Data Management
export {
  exportUserData,
  exportQrCodes,
  exportTemplates,
  importUserData,
  importQrCodes,
  importTemplates,
} from "./data-management";

// Account Management
export { deleteAccount } from "./account-management";

// Utilities
export { inferQrCodeType } from "@/lib/utils";
