import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = ({ title, description, variant }: ToastOptions) => {
    if (variant === "destructive") {
      sonnerToast.error(title || "오류", {
        description,
      });
    } else {
      sonnerToast.success(title || "성공", {
        description,
      });
    }
  };

  return { toast };
}
