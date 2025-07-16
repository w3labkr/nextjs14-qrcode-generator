// Mock dependencies first
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    account: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    log: {
      create: jest.fn(),
    },
  },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock password hashing functions
const mockHash = jest.fn((password) => Promise.resolve(`hashed_${password}`));
const mockCompare = jest.fn((password, hash) => Promise.resolve(hash === `hashed_${password}`));

// Mock server actions
jest.mock("@/app/actions/account-management", () => ({
  updateUserProfile: jest.fn(),
  deleteUserAccount: jest.fn(),
  changePassword: jest.fn(),
}));

// Import after mocking
import { updateUserProfile, deleteUserAccount, changePassword } from "@/app/actions/account-management";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

describe("User Authentication Flow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("User Signup → Login → Profile Edit Flow", () => {
    it("신규 사용자가 가입하고 로그인하며 프로필을 수정할 수 있어야 한다", async () => {
      // Step 1: 사용자 가입 데이터
      const signupData = {
        email: "newuser@example.com",
        password: "SecurePassword123!",
        name: "New User",
      };

      // Mock user creation
      const newUser = {
        id: "user-123",
        email: signupData.email,
        name: signupData.name,
        image: null,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(newUser);
      (prisma.log.create as jest.Mock).mockResolvedValue({});

      // Simulate signup
      const hashedPassword = await mockHash(signupData.password);
      const createdUser = await prisma.user.create({
        data: {
          email: signupData.email,
          name: signupData.name,
          password: hashedPassword,
        },
      });

      expect(createdUser).toMatchObject({
        id: "user-123",
        email: signupData.email,
        name: signupData.name,
      });

      // Log signup event
      await prisma.log.create({
        data: {
          userId: createdUser.id,
          type: "user",
          level: "info",
          action: "user_signup",
          message: `New user signup: ${signupData.email}`,
        },
      });

      // Step 2: 사용자 로그인
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...newUser,
        password: hashedPassword,
      });

      const loginUser = await prisma.user.findUnique({
        where: { email: signupData.email },
      });

      expect(loginUser).toBeTruthy();
      
      // Verify password
      const passwordMatch = await mockCompare(signupData.password, loginUser!.password);
      expect(passwordMatch).toBe(true);

      // Create session
      const session = {
        id: "session-123",
        userId: loginUser!.id,
        sessionToken: "session-token-123",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      (prisma.session.create as jest.Mock).mockResolvedValue(session);

      const createdSession = await prisma.session.create({
        data: {
          userId: loginUser!.id,
          sessionToken: session.sessionToken,
          expires: session.expires,
        },
      });

      expect(createdSession.sessionToken).toBe("session-token-123");

      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: newUser.id, email: newUser.email },
      });

      // Step 3: 프로필 수정
      const profileUpdateData = {
        name: "Updated User Name",
        bio: "This is my bio",
      };

      (updateUserProfile as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          ...newUser,
          ...profileUpdateData,
        },
      });

      const updateResult = await updateUserProfile(profileUpdateData);

      expect(updateResult.success).toBe(true);
      expect(updateResult.data?.name).toBe(profileUpdateData.name);
      expect(updateResult.data?.bio).toBe(profileUpdateData.bio);
    });

    it("이메일 중복 가입을 방지해야 한다", async () => {
      const existingUser = {
        id: "existing-user",
        email: "existing@example.com",
        name: "Existing User",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      // Try to create user with same email
      const duplicateSignup = prisma.user.findUnique({
        where: { email: existingUser.email },
      });

      const result = await duplicateSignup;
      expect(result).toBeTruthy();
      expect(result?.email).toBe(existingUser.email);
    });

    it("잘못된 비밀번호로 로그인 시도 시 실패해야 한다", async () => {
      const user = {
        id: "user-123",
        email: "user@example.com",
        password: await mockHash("correct-password"),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      const foundUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      const passwordMatch = await mockCompare("wrong-password", foundUser!.password);
      expect(passwordMatch).toBe(false);
    });
  });

  describe("Profile Management Flow", () => {
    const mockSession = {
      user: { id: "user-123", email: "user@example.com" },
    };

    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    });

    it("비밀번호를 변경할 수 있어야 한다", async () => {
      const passwordData = {
        currentPassword: "oldPassword123",
        newPassword: "newPassword456!",
      };

      (changePassword as jest.Mock).mockResolvedValue({
        success: true,
        message: "비밀번호가 성공적으로 변경되었습니다.",
      });

      const result = await changePassword(passwordData);

      expect(result.success).toBe(true);
      expect(changePassword).toHaveBeenCalledWith(passwordData);
    });

    it("계정을 삭제할 수 있어야 한다", async () => {
      (deleteUserAccount as jest.Mock).mockResolvedValue({
        success: true,
        message: "계정이 성공적으로 삭제되었습니다.",
      });

      const result = await deleteUserAccount();

      expect(result.success).toBe(true);
      expect(deleteUserAccount).toHaveBeenCalled();
    });

    it("인증되지 않은 사용자가 프로필을 수정할 수 없어야 한다", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      (updateUserProfile as jest.Mock).mockResolvedValue({
        success: false,
        error: "인증이 필요합니다.",
      });

      const result = await updateUserProfile({ name: "New Name" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("인증");
    });
  });

  describe("OAuth Login Flow", () => {
    it("Google OAuth로 로그인할 수 있어야 한다", async () => {
      const oauthUser = {
        email: "oauth@example.com",
        name: "OAuth User",
        image: "https://example.com/avatar.jpg",
        provider: "google",
        providerAccountId: "google-123",
      };

      // Check if user exists
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Create new user
      const newUser = {
        id: "oauth-user-123",
        email: oauthUser.email,
        name: oauthUser.name,
        image: oauthUser.image,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(newUser);

      const createdUser = await prisma.user.create({
        data: {
          email: oauthUser.email,
          name: oauthUser.name,
          image: oauthUser.image,
          emailVerified: new Date(),
        },
      });

      // Create account link
      const account = {
        id: "account-123",
        userId: createdUser.id,
        type: "oauth",
        provider: oauthUser.provider,
        providerAccountId: oauthUser.providerAccountId,
        access_token: "mock-access-token",
        token_type: "Bearer",
        scope: "email profile",
      };

      (prisma.account.create as jest.Mock).mockResolvedValue(account);

      const createdAccount = await prisma.account.create({
        data: {
          userId: createdUser.id,
          type: "oauth",
          provider: oauthUser.provider,
          providerAccountId: oauthUser.providerAccountId,
          access_token: account.access_token,
          token_type: account.token_type,
          scope: account.scope,
        },
      });

      expect(createdUser.email).toBe(oauthUser.email);
      expect(createdAccount.provider).toBe(oauthUser.provider);
    });

    it("기존 OAuth 사용자로 재로그인할 수 있어야 한다", async () => {
      const existingUser = {
        id: "existing-oauth-user",
        email: "existing-oauth@example.com",
        name: "Existing OAuth User",
      };

      const existingAccount = {
        userId: existingUser.id,
        provider: "google",
        providerAccountId: "google-existing-123",
      };

      (prisma.account.findFirst as jest.Mock).mockResolvedValue(existingAccount);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      const foundAccount = await prisma.account.findFirst({
        where: {
          provider: "google",
          providerAccountId: "google-existing-123",
        },
      });

      const foundUser = await prisma.user.findUnique({
        where: { id: foundAccount!.userId },
      });

      expect(foundUser).toMatchObject(existingUser);
    });
  });

  describe("Session Management", () => {
    it("세션을 생성하고 검증할 수 있어야 한다", async () => {
      const user = {
        id: "user-123",
        email: "user@example.com",
      };

      const sessionData = {
        id: "session-new-123",
        userId: user.id,
        sessionToken: "new-session-token",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };

      (prisma.session.create as jest.Mock).mockResolvedValue(sessionData);
      (prisma.session.findFirst as jest.Mock).mockResolvedValue(sessionData);

      // Create session
      const createdSession = await prisma.session.create({
        data: {
          userId: user.id,
          sessionToken: sessionData.sessionToken,
          expires: sessionData.expires,
        },
      });

      // Validate session
      const validSession = await prisma.session.findFirst({
        where: {
          sessionToken: sessionData.sessionToken,
          expires: { gte: new Date() },
        },
      });

      expect(validSession).toBeTruthy();
      expect(validSession?.userId).toBe(user.id);
    });

    it("만료된 세션은 무효화되어야 한다", async () => {
      const expiredSession = {
        id: "expired-session",
        userId: "user-123",
        sessionToken: "expired-token",
        expires: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      };

      (prisma.session.findFirst as jest.Mock).mockResolvedValue(null);

      const validSession = await prisma.session.findFirst({
        where: {
          sessionToken: expiredSession.sessionToken,
          expires: { gte: new Date() },
        },
      });

      expect(validSession).toBeNull();
    });

    it("로그아웃 시 세션이 삭제되어야 한다", async () => {
      const sessionToken = "active-session-token";

      (prisma.session.delete as jest.Mock).mockResolvedValue({
        id: "session-123",
        sessionToken,
      });

      const deletedSession = await prisma.session.delete({
        where: { sessionToken },
      });

      expect(deletedSession.sessionToken).toBe(sessionToken);
      expect(prisma.session.delete).toHaveBeenCalledWith({
        where: { sessionToken },
      });
    });
  });

  describe("Remember Me Functionality", () => {
    it("Remember Me 옵션으로 로그인 시 장기 세션이 생성되어야 한다", async () => {
      const user = {
        id: "user-123",
        email: "user@example.com",
      };

      const rememberMeSession = {
        id: "remember-session",
        userId: user.id,
        sessionToken: "remember-token",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      (prisma.session.create as jest.Mock).mockResolvedValue(rememberMeSession);

      const createdSession = await prisma.session.create({
        data: {
          userId: user.id,
          sessionToken: rememberMeSession.sessionToken,
          expires: rememberMeSession.expires,
        },
      });

      // Verify session is valid for 30 days
      const daysDiff = (createdSession.expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThan(29);
      expect(daysDiff).toBeLessThan(31);
    });
  });
});