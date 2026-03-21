const request = require("supertest");

/**
 * ✅ MOCK SEQUELIZE
 */
jest.mock("../config/db", () => {
  const mockModel = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
  };

  return {
    define: jest.fn(() => mockModel),
    authenticate: jest.fn(),
  };
});

/**
 * ✅ MOCK USER MODEL (FIX toJSON)
 */
jest.mock("../schemas/userSchema", () => ({
  findAll: jest.fn(() =>
    Promise.resolve([
      {
        toJSON: () => ({
          id: 1,
          name: "Test User",
          email: "test@gmail.com"
        })
      }
    ])
  ),
  findOne: jest.fn(() => Promise.resolve(null)),
  create: jest.fn((data) =>
    Promise.resolve({
      toJSON: () => ({
        id: 2,
        ...data
      })
    })
  )
}));

/**
 * ✅ MOCK AUTH
 */
jest.mock("../utils/authMiddleware", () => ({
  verifyToken: (req, res, next) => next(),
  requireRole: () => (req, res, next) => next(),
}));

const app = require("../app");

describe("🧪 Integration Test - User API", () => {

  test("GET /api/users → 200", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(200);
  });

  test("POST /api/users → 201", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({
        name: "Demo",
        email: "demo@gmail.com",
        password: "123456",
        role: "EMPLOYEE"
      });

    expect([200, 201]).toContain(res.statusCode);
  });

});