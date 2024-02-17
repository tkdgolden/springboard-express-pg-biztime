process.env.NODE_ENV = "test";
const request = require("supertest");

const app = require("../app.js");
const db = require("../db.js");

let sam = {
    code: "sam",
    name: "Samsung",
    description: "Good phones, terrible appliances"
};

let ikea = {
    code: "ikea",
    name: "Ikea",
    description: "Sleek and minimal, falls apart"
}

beforeEach(async function () {
    await db.query(`INSERT INTO companies (code, name, description) VALUES ('${sam.code}', '${sam.name}', '${sam.description}')`);
})

afterEach(async function () {
    await db.query("DELETE FROM companies");
})

afterAll(async function () {
    await db.end();
})

describe("GET /companies", () => {
    test("Get all companies", async () => {
        const res = await request(app).get("/companies");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ companies: [sam] });
    })
})

describe("GET /companies/:name", () => {
    test("Get company by name", async () => {
        const res = await request(app).get(`/companies/${sam.code}`);
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            "company": {
                "code": sam.code,
                "description": sam.description, "invoices": [],
                "name": sam.name,
            },
        })
    })

    test("Responds with 404 for invalid company", async () => {
        const res = await request(app).get(`/companies/tesla`);
        expect(res.statusCode).toBe(404)
    })
})

describe("POST /companies", () => {
    test("Creating a company", async () => {
        const res = await request(app).post("/companies").send(ikea);
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ company: ikea });
    })

    test("Responds with 400 if name is missing", async () => {
        const res = await request(app).post("/companies").send({
            code: "ikea",
            description: "Sleek and minimal, falls apart"
        });
        expect(res.statusCode).toBe(400);
    })

    test("Responds with 400 if description is missing", async () => {
        const res = await request(app).post("/companies").send({
            code: "ikea",
            name: "Ikea"
        });
        expect(res.statusCode).toBe(400);
    })
})

describe("/PUT /companies/:name", () => {
    test("Updating a company's name", async () => {
        const res = await request(app).put(`/companies/${sam.code}`).send({
            name: "Subaru",
            description: "Good phones, terrible appliances"
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: {
                code: "sam",
                name: "Subaru",
                description: "Good phones, terrible appliances"
            }
        });
    })

    test("Updating a company's description", async () => {
        const res = await request(app).put(`/companies/${sam.code}`).send({
            name: "Samsung",
            description: "android is better"
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: {
                code: "sam",
                name: "Samsung",
                description: "android is better"
            }
        });
    })

    test("Updating a company's name AND description", async () => {
        const res = await request(app).put(`/companies/${sam.code}`).send({
            name: "Subaru",
            description: "android is better"
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: {
                code: "sam",
                name: "Subaru",
                description: "android is better"
            }
        });
    })

    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).put(`/companies/Dawn`).send({
            name: "Subaru",
            description: "android is better"
        });
        expect(res.statusCode).toBe(404);
    })
})

describe("/DELETE /companies/:code", () => {
    test("Deleting a company", async () => {
      const res = await request(app).delete(`/companies/${sam.code}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ status: 'deleted' })

      const response = await request(app).get("/companies");
      expect(response.body.companies.length).toEqual(0);
    })
    
    
    test("Responds with 404 for deleting invalid company", async () => {
      const res = await request(app).delete(`/companies/msi`);
      expect(res.statusCode).toBe(404);
    })
  })