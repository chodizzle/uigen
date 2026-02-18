import { test, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock "server-only" to be a no-op
vi.mock("server-only", () => ({}));

// Mock next/headers cookies
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

// Mock jose to avoid jsdom TextEncoder issues
vi.mock("jose", () => {
  const mockSign = vi.fn().mockResolvedValue("mock.jwt.token");
  return {
    SignJWT: vi.fn().mockImplementation(() => ({
      setProtectedHeader: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      sign: mockSign,
    })),
    jwtVerify: vi.fn().mockImplementation(async (token: string) => {
      if (token === "mock.jwt.token") {
        return {
          payload: {
            userId: "user-123",
            email: "test@example.com",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        };
      }
      throw new Error("Invalid token");
    }),
  };
});

const { createSession, getSession, deleteSession, verifySession } =
  await import("@/lib/auth");
const { SignJWT } = await import("jose");

beforeEach(() => {
  vi.clearAllMocks();
});

test("createSession creates a JWT with correct claims", async () => {
  await createSession("user-123", "test@example.com");

  expect(SignJWT).toHaveBeenCalledWith(
    expect.objectContaining({
      userId: "user-123",
      email: "test@example.com",
    })
  );
});

test("createSession sets an httpOnly cookie", async () => {
  await createSession("user-123", "test@example.com");

  expect(mockCookieStore.set).toHaveBeenCalledOnce();
  const [name, token, options] = mockCookieStore.set.mock.calls[0];

  expect(name).toBe("auth-token");
  expect(token).toBe("mock.jwt.token");
  expect(options.httpOnly).toBe(true);
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
});

test("createSession sets cookie expiry to 7 days from now", async () => {
  const before = Date.now();
  await createSession("user-123", "test@example.com");
  const after = Date.now();

  const [, , options] = mockCookieStore.set.mock.calls[0];
  const expires = options.expires.getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  expect(expires).toBeGreaterThanOrEqual(before + sevenDays);
  expect(expires).toBeLessThanOrEqual(after + sevenDays);
});

test("getSession returns payload when valid token exists", async () => {
  mockCookieStore.get.mockReturnValue({ value: "mock.jwt.token" });

  const session = await getSession();

  expect(session).not.toBeNull();
  expect(session!.userId).toBe("user-123");
  expect(session!.email).toBe("test@example.com");
});

test("getSession returns null when no cookie exists", async () => {
  mockCookieStore.get.mockReturnValue(undefined);

  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns null for invalid token", async () => {
  mockCookieStore.get.mockReturnValue({ value: "invalid.jwt.token" });

  const session = await getSession();

  expect(session).toBeNull();
});

test("deleteSession removes the auth cookie", async () => {
  await deleteSession();

  expect(mockCookieStore.delete).toHaveBeenCalledWith("auth-token");
});

test("verifySession returns payload from request cookie", async () => {
  const request = new NextRequest("http://localhost:3000", {
    headers: { cookie: "auth-token=mock.jwt.token" },
  });

  const session = await verifySession(request);

  expect(session).not.toBeNull();
  expect(session!.userId).toBe("user-123");
  expect(session!.email).toBe("test@example.com");
});

test("verifySession returns null when no cookie on request", async () => {
  const request = new NextRequest("http://localhost:3000");

  const session = await verifySession(request);

  expect(session).toBeNull();
});

test("verifySession returns null for invalid token on request", async () => {
  const request = new NextRequest("http://localhost:3000", {
    headers: { cookie: "auth-token=garbage-token" },
  });

  const session = await verifySession(request);

  expect(session).toBeNull();
});
