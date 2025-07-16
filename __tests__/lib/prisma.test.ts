/**
 * @jest-environment node
 */

import { prisma } from "@/lib/prisma";

describe("Prisma Client", () => {
  it("prisma 클라이언트가 정의되어야 한다", () => {
    expect(prisma).toBeDefined();
  });

  it("prisma 클라이언트가 객체여야 한다", () => {
    expect(typeof prisma).toBe("object");
  });

  it("prisma 클라이언트가 필요한 메서드를 가지고 있어야 한다", () => {
    expect(prisma).toHaveProperty("user");
    expect(prisma).toHaveProperty("qrCode");
    expect(prisma).toHaveProperty("logEntry");
    expect(prisma).toHaveProperty("applicationLog");
  });

  it("프로덕션 환경에서 안전하게 동작해야 한다", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    
    // Re-import to test production behavior
    const { prisma: productionPrisma } = require("@/lib/prisma");
    expect(productionPrisma).toBeDefined();
    
    process.env.NODE_ENV = originalEnv;
  });

  it("개발 환경에서 안전하게 동작해야 한다", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    
    // Re-import to test development behavior
    const { prisma: developmentPrisma } = require("@/lib/prisma");
    expect(developmentPrisma).toBeDefined();
    
    process.env.NODE_ENV = originalEnv;
  });
});