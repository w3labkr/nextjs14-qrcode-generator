"use server";

import QRCode from "qrcode";
import { createCanvas, loadImage } from "canvas";

interface QrCodeOptions {
  type?: "image/png" | "image/jpeg" | "svg";
  quality?: number;
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  logo?: string;
}

export async function generateQrCode(
  text: string,
  options: QrCodeOptions = {},
) {
  try {
    const { type = "image/png", logo, quality, ...otherOptions } = options;

    if (type === "svg") {
      const svgString = await QRCode.toString(text, {
        type: "svg",
        ...otherOptions,
      });
      // SVG 로고 삽입은 이 버전에서 직접 지원하지 않으므로 로고 없이 반환합니다.
      // SVG를 데이터 URL로 변환하여 일관된 반환 형식을 유지합니다.
      const b64 = Buffer.from(svgString).toString("base64");
      return `data:image/svg+xml;base64,${b64}`;
    }

    // 로고 합성을 위해 항상 내부적으로 PNG를 생성합니다.
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      type: "image/png",
      errorCorrectionLevel: "H", // 로고 삽입을 위해 오류 복원 수준을 'H'로 설정
      ...otherOptions,
    });

    if (!logo) {
      // 로고가 없는 경우, 요청된 형식으로 변환합니다.
      if (type === "image/jpeg") {
        const canvas = createCanvas(
          otherOptions.width || 400,
          otherOptions.width || 400,
        );
        const ctx = canvas.getContext("2d");
        const qrImage = await loadImage(qrCodeDataURL);
        ctx.drawImage(qrImage, 0, 0);
        return canvas.toDataURL("image/jpeg", quality);
      }
      return qrCodeDataURL; // 기본 PNG 데이터 URL 반환
    }

    // 로고가 있는 경우, 캔버스에 합성합니다.
    const canvas = createCanvas(
      otherOptions.width || 400,
      otherOptions.width || 400,
    );
    const ctx = canvas.getContext("2d");

    const qrImage = await loadImage(qrCodeDataURL);
    ctx.drawImage(qrImage, 0, 0);

    const logoImage = await loadImage(logo);
    const logoSize = (otherOptions.width || 400) * 0.2; // 로고 크기는 QR 코드의 20%
    const logoX = (canvas.width - logoSize) / 2;
    const logoY = (canvas.height - logoSize) / 2;

    // 로고 뒷배경 추가 (흰색)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);

    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

    if (type === "image/jpeg") {
      return canvas.toDataURL("image/jpeg", quality);
    }

    return canvas.toDataURL("image/png");
  } catch (err) {
    console.error(err);
    throw new Error("QR 코드 생성에 실패했습니다.");
  }
}
