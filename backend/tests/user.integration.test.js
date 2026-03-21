const request = require("supertest");
const app = require("../app");

jest.mock("../utils/authMiddleware", () => ({
  verifyToken: (req, res, next) => next(),
  requireRole: () => (req, res, next) => next(),
}));

describe("Integration Test - User API", () => {

  test("GET /users should return 200", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(200);
  });

  test("POST /api/users → 201", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({
        name: "Test User",
        email: "test@gmail.com",
        password: "123456",
        role: "EMPLOYEE"
      });

    expect([200, 201]).toContain(res.statusCode);
  });

});