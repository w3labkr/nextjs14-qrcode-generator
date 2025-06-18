import { generatePdfQrCode } from "../app/actions/pdf-generator";
import * as fs from "fs";
import * as path from "path";

async function runTest() {
  console.log("PDF 생성 테스트를 시작합니다...");

  // 테스트용 QR 코드 데이터 URL (실제 QR 코드 이미지일 필요는 없습니다)
  // 간단한 1x1 픽셀 투명 PNG 데이터 URL
  const testQrDataUrl =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

  try {
    const pdfDataUri = await generatePdfQrCode(testQrDataUrl);
    console.log("PDF가 성공적으로 생성되었습니다.");

    // 데이터 URI에서 base64 부분만 추출
    const base64Data = pdfDataUri.split(",")[1];
    const pdfBuffer = Buffer.from(base64Data, "base64");

    // 프로젝트 루트에 test-output.pdf로 저장
    const outputPath = path.join(process.cwd(), "test-output.pdf");
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log(`테스트 PDF 파일이 '${outputPath}'에 저장되었습니다.`);
    console.log("파일을 열어 한글이 올바르게 표시되는지 확인해주세요.");
  } catch (error) {
    console.error("PDF 생성 테스트 중 오류가 발생했습니다:", error);
  }
}

runTest();
