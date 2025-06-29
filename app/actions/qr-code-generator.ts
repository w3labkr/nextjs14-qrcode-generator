"use server";

import QRCode from "qrcode";
import { createCanvas, loadImage } from "canvas";
import { auth } from "@/auth";
import { withAuthenticatedRLSTransaction, withoutRLS } from "@/lib/rls-utils";
import { QrCodeOptions, QrCodeGenerationOptions } from "@/types/qr-code-server";
import { UnifiedLogger, inferQrType } from "@/lib/unified-logging";
import { headers } from "next/headers";

export async function generateQrCode(options: QrCodeOptions): Promise<string> {
  const session = await auth();
  const headersList = headers();

  try {
    const {
      text,
      type = "png",
      width = 1024,
      margin = 0,
      color,
      logo,
      dotsOptions,
      cornersSquareOptions,
      frameOptions,
    } = options;

    if (!text || text.trim().length === 0) {
      throw new Error("QR code text cannot be empty.");
    }

    if (width < 100 || width > 4096) {
      throw new Error("QR code width must be between 100px and 4096px.");
    }

    // QR 코드 생성 로그 기록 (로그인하지 않은 사용자 포함)
    try {
      const userAgent = headersList.get("user-agent") || undefined;
      const forwardedFor = headersList.get("x-forwarded-for");
      const cfConnectingIp = headersList.get("cf-connecting-ip");
      const realIp = headersList.get("x-real-ip");

      const ipAddress =
        forwardedFor?.split(",")[0].trim() ||
        cfConnectingIp ||
        realIp ||
        "unknown";

      // QR 타입 추론
      const qrType = inferQrType(text);

      await UnifiedLogger.logQrGeneration({
        userId: session?.user?.id,
        qrType,
        size: `${width}x${width}`,
        format: type,
        customization: {
          hasLogo: !!logo,
          hasCustomColor: !!(color?.dark && color.dark !== "#000000"),
          hasDotsOptions: !!dotsOptions,
          hasCornersSquareOptions: !!cornersSquareOptions,
          hasFrameOptions: !!frameOptions,
        },
      });
    } catch (logError) {
      console.error("QR 생성 로그 기록 실패:", logError);
      // 로그 실패가 QR 생성을 방해하지 않도록 함
    }

    // 고급 스타일링이 필요한 경우 qr-code-styling 사용
    if (logo || dotsOptions || cornersSquareOptions || frameOptions) {
      return await generateStyledQrCode(options);
    }

    // 기본 QR 코드 생성 (기존 로직)
    const qrcodeOptions: QRCode.QRCodeRenderersOptions = {
      errorCorrectionLevel: "H",
      width,
      margin,
      color: {
        dark: color?.dark || "#000000",
        light: color?.light || "#ffffff",
      },
    };

    if (type === "svg") {
      const svgString = await QRCode.toString(text, {
        ...qrcodeOptions,
        type: "svg",
      });

      // SVG에서 색상이 올바르게 적용되는지 확인하고 수정
      let modifiedSvg = svgString;

      // 배경색 설정 (SVG 전체 배경)
      if (color?.light && color.light !== "#ffffff") {
        // SVG 태그에 배경색 추가
        modifiedSvg = modifiedSvg.replace(
          /<svg([^>]*)>/,
          `<svg$1 style="background-color: ${color.light};">`,
        );

        // 기존 흰색 요소들을 새 배경색으로 변경
        modifiedSvg = modifiedSvg
          .replace(/fill="#ffffff"/g, `fill="${color.light}"`)
          .replace(/fill="#fff"/g, `fill="${color.light}"`)
          .replace(/fill="white"/g, `fill="${color.light}"`)
          .replace(/fill="rgb\(255,\s*255,\s*255\)"/g, `fill="${color.light}"`);
      }

      // 전경색(QR 코드 도트) 설정
      if (color?.dark && color.dark !== "#000000") {
        // SVG 내의 검은색 요소를 지정된 색상으로 변경
        modifiedSvg = modifiedSvg
          .replace(/fill="#000000"/g, `fill="${color.dark}"`)
          .replace(/fill="#000"/g, `fill="${color.dark}"`)
          .replace(/fill="black"/g, `fill="${color.dark}"`)
          .replace(/fill="rgb\(0,\s*0,\s*0\)"/g, `fill="${color.dark}"`)
          .replace(/stroke="#000000"/g, `stroke="${color.dark}"`)
          .replace(/stroke="#000"/g, `stroke="${color.dark}"`)
          .replace(/stroke="black"/g, `stroke="${color.dark}"`);
      }

      // Base64 인코딩으로 안정적인 브라우저 호환성 제공
      return `data:image/svg+xml;base64,${Buffer.from(modifiedSvg).toString("base64")}`;
    }

    if (type === "jpg") {
      // JPG의 경우 투명도를 지원하지 않으므로 배경색이 중요함
      return await QRCode.toDataURL(text, {
        ...qrcodeOptions,
        type: "image/jpeg",
      });
    }

    if (type === "webp") {
      return await QRCode.toDataURL(text, {
        ...qrcodeOptions,
        type: "image/webp",
      });
    }

    return await QRCode.toDataURL(text, {
      ...qrcodeOptions,
      type: "image/png",
    });
  } catch (error) {
    console.error("Error generating QR code:", error);

    // 에러 로그 기록
    await UnifiedLogger.logError({
      userId: session?.user?.id,
      error: error instanceof Error ? error : new Error(String(error)),
      additionalInfo: { options },
    });

    if (error instanceof Error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
    throw new Error("Failed to generate QR code.");
  }
}

async function generateStyledQrCode(options: QrCodeOptions): Promise<string> {
  const {
    text,
    type = "png",
    width = 1024,
    margin = 0,
    color,
    logo,
    dotsOptions,
    cornersSquareOptions,
    frameOptions,
  } = options;

  // 기본 QR 코드 생성
  const qrcodeOptions: QRCode.QRCodeRenderersOptions = {
    errorCorrectionLevel: "H",
    width,
    margin,
    color: {
      dark: color?.dark || "#000000",
      light: color?.light || "#ffffff",
    },
  };

  // Canvas로 QR 코드 생성
  const canvas = createCanvas(width, width);
  const ctx = canvas.getContext("2d");

  // QR 코드를 Canvas에 그리기
  await QRCode.toCanvas(canvas, text, qrcodeOptions);

  // 로고 추가
  if (logo) {
    try {
      const logoImage = await loadImage(logo);
      const logoSize = width * 0.2; // QR 코드 크기의 20%
      const logoX = (width - logoSize) / 2;
      const logoY = (width - logoSize) / 2;

      // 로고 배경 (흰색 원형)
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(width / 2, width / 2, logoSize / 2 + 5, 0, 2 * Math.PI);
      ctx.fill();

      // 로고 그리기
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
    } catch (error) {
      console.warn("로고 로드 실패:", error);
    }
  }

  let resultCanvas = canvas;

  // 프레임과 텍스트 추가
  if (frameOptions && (frameOptions.text || frameOptions.type !== "none")) {
    resultCanvas = await addFrameAndTextToCanvas(canvas, frameOptions, width);
  }

  // 타입에 따른 결과 반환
  if (type === "svg") {
    // Canvas를 PNG로 변환 후 SVG로 임베드
    const pngDataUrl = resultCanvas.toDataURL("image/png");
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${resultCanvas.width}" height="${resultCanvas.height}">
      <image href="${pngDataUrl}" width="${resultCanvas.width}" height="${resultCanvas.height}"/>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`;
  }

  if (type === "jpg") {
    return resultCanvas.toDataURL("image/jpeg", 0.9);
  }

  return resultCanvas.toDataURL("image/png");
}

export async function generateHighResQrCode(
  options: QrCodeOptions,
): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error(
      "High-resolution QR codes are only available for logged-in users",
    );
  }

  const highResOptions = {
    ...options,
    width: 4096,
  };

  return generateQrCode(highResOptions);
}

export async function generateAndSaveQrCode(options: QrCodeGenerationOptions) {
  try {
    const qrCodeDataUrl = await generateQrCode(options);

    const session = await auth();

    if (session?.user?.id) {
      await withAuthenticatedRLSTransaction(session, async (tx) => {
        // 사용자가 실제로 데이터베이스에 존재하는지 확인
        const existingUser = await tx.user.findFirst({
          where: { id: session.user!.id },
        });

        if (existingUser) {
          const savedQrCode = await tx.qrCode.create({
            data: {
              userId: session.user!.id,
              type: options.qrType,
              title: options.title || null,
              content: options.text,
              settings: JSON.stringify({
                type: options.type,
                color: options.color,
                width: options.width,
                margin: options.margin,
                logo: options.logo,
                dotsOptions: options.dotsOptions,
                cornersSquareOptions: options.cornersSquareOptions,
                frameOptions: options.frameOptions,
              }),
            },
          });

          return {
            qrCodeDataUrl,
            savedId: savedQrCode.id,
          };
        } else {
          console.warn(
            `User with ID ${session.user!.id} not found in database`,
          );
          return {
            qrCodeDataUrl,
            savedId: null,
          };
        }
      });
    }

    return {
      qrCodeDataUrl,
      savedId: null,
    };
  } catch (error) {
    console.error("Error generating and saving QR code:", error);
    throw error;
  }
}

async function addFrameAndText(
  qrCodeDataUrl: string,
  frameOptions: NonNullable<QrCodeOptions["frameOptions"]>,
  width: number,
): Promise<string> {
  try {
    // Base64 데이터에서 이미지 로드
    const qrImage = await loadImage(qrCodeDataUrl);

    // 프레임을 위한 여백 계산
    const textHeight = frameOptions.text ? 40 : 0;
    const borderWidth = frameOptions.borderWidth || 2;
    const padding = 20;

    // 캔버스 크기 계산
    const canvasWidth = width + (borderWidth + padding) * 2;
    const canvasHeight = width + (borderWidth + padding) * 2 + textHeight;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    // 배경색 설정
    ctx.fillStyle = frameOptions.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 테두리 그리기
    if (frameOptions.type !== "none" && borderWidth > 0) {
      ctx.strokeStyle = frameOptions.borderColor || "#000000";
      ctx.lineWidth = borderWidth;

      if (frameOptions.type === "rounded") {
        const radius = frameOptions.borderRadius || 8;
        const x = borderWidth / 2;
        const y = borderWidth / 2;
        const w = canvasWidth - borderWidth;
        const h = canvasHeight - borderWidth;

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.stroke();
      } else {
        ctx.strokeRect(
          borderWidth / 2,
          borderWidth / 2,
          canvasWidth - borderWidth,
          canvasHeight - borderWidth,
        );
      }
    }

    // QR 코드 그리기
    const qrX = borderWidth + padding;
    const qrY = borderWidth + padding;
    ctx.drawImage(qrImage, qrX, qrY, width, width);

    // 텍스트 그리기
    if (frameOptions.text) {
      const fontSize = frameOptions.fontSize || 16;
      ctx.fillStyle = frameOptions.textColor || "#000000";
      ctx.font = `900 ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const textX = canvasWidth / 2;
      // 텍스트 위치를 적절한 위치로 조정
      const textY = width + borderWidth + padding * 1.5 + textHeight / 2;
      ctx.fillText(frameOptions.text, textX, textY);
    }

    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error adding frame and text:", error);
    // 프레임 추가에 실패하면 원본 QR 코드 반환
    return qrCodeDataUrl;
  }
}

async function addFrameAndTextToCanvas(
  qrCanvas: any,
  frameOptions: NonNullable<QrCodeOptions["frameOptions"]>,
  qrWidth: number,
): Promise<any> {
  try {
    // 프레임을 위한 여백 계산
    const textHeight = frameOptions.text ? 40 : 0;
    const borderWidth = frameOptions.borderWidth || 2;
    const padding = 20;

    // 캔버스 크기 계산
    const canvasWidth = qrWidth + (borderWidth + padding) * 2;
    const canvasHeight = qrWidth + (borderWidth + padding) * 2 + textHeight;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    // 배경색 설정
    ctx.fillStyle = frameOptions.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 테두리 그리기
    if (frameOptions.type !== "none" && borderWidth > 0) {
      ctx.strokeStyle = frameOptions.borderColor || "#000000";
      ctx.lineWidth = borderWidth;

      if (frameOptions.type === "rounded") {
        const radius = frameOptions.borderRadius || 8;
        const x = borderWidth / 2;
        const y = borderWidth / 2;
        const w = canvasWidth - borderWidth;
        const h = canvasHeight - borderWidth;

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.stroke();
      } else {
        ctx.strokeRect(
          borderWidth / 2,
          borderWidth / 2,
          canvasWidth - borderWidth,
          canvasHeight - borderWidth,
        );
      }
    }

    // QR 코드 그리기
    const qrX = borderWidth + padding;
    const qrY = borderWidth + padding;
    ctx.drawImage(qrCanvas, qrX, qrY, qrWidth, qrWidth);

    // 텍스트 그리기
    if (frameOptions.text) {
      const fontSize = frameOptions.fontSize || 16;
      ctx.fillStyle = frameOptions.textColor || "#000000";
      ctx.font = `900 ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const textX = canvasWidth / 2;
      // 텍스트 위치를 적절한 위치로 조정
      const textY = qrWidth + borderWidth + padding * 1.5 + textHeight / 2;
      ctx.fillText(frameOptions.text, textX, textY);
    }

    return canvas;
  } catch (error) {
    console.error("Error adding frame and text to canvas:", error);
    // 프레임 추가에 실패하면 원본 QR 코드 캔버스 반환
    return qrCanvas;
  }
}
