process.env.NODE_ENV = "test";
const request = require("supertest");

const app = require("../app.js");
const db = require("../db.js");

let sam = {
    code: "sam",
    name: "Samsung",
    description: "Good phones, terrible appliances"
};

let i1 = {
    comp_code: 'sam',
    amt: 100,
};

let i2 = {
    comp_code: 'sam',
    amt: 200,
};

beforeEach(async function () {
    await db.query(`INSERT INTO companies (code, name, description) VALUES ('${sam.code}', '${sam.name}', '${sam.description}')`);
    output = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('${i1.comp_code}', '${i1.amt}') RETURNING id`);
    i1.id = output.rows[0].id;
})

afterEach(async function () {
    await db.query("DELETE FROM invoices");
    await db.query("DELETE FROM companies");
})

afterAll(async function () {
    await db.end();
})

describe("GET /invoices", () => {
    test("Get all invoices", async () => {
        const res = await request(app).get("/invoices");
        expect(res.statusCode).toBe(200);
        expect(res.body.invoices.length).toEqual(1);
        expect(res.body.invoices[0].add_date).toContain("2024-02");
        expect(res.body.invoices[0].amt).toEqual(i1.amt);
        expect(res.body.invoices[0].comp_code).toEqual(i1.comp_code);
        expect(res.body.invoices[0].paid).toEqual(false);
        expect(res.body.invoices[0].paid_date).toEqual(null);
    })
})

describe("GET /invoices/:id", () => {
    test("Get invoice by id", async () => {
        const res = await request(app).get(`/invoices/${i1.id}`);
        expect(res.statusCode).toBe(200)
        expect(res.body.invoice.add_date).toContain("2024-02");
        expect(res.body.invoice.amt).toEqual(i1.amt);
        expect(res.body.invoice.comp_code).toEqual(i1.comp_code);
        expect(res.body.invoice.paid).toEqual(false);
        expect(res.body.invoice.paid_date).toEqual(null);
    })

    test("Responds with 404 for invalid company", async () => {
        const res = await request(app).get(`/companies/tesla`);
        expect(res.statusCode).toBe(404)
    })
})

describe("POST /invoices", () => {
    test("Creating an invoice", async () => {
        const res = await request(app).post("/invoices").send(i2);
        expect(res.statusCode).toBe(201);
        expect(res.body.invoice.add_date).toContain("2024-02");
        expect(res.body.invoice.amt).toEqual(i2.amt);
        expect(res.body.invoice.comp_code).toEqual(i2.comp_code);
        expect(res.body.invoice.paid).toEqual(false);
        expect(res.body.invoice.paid_date).toEqual(null);
    })

    test("Responds with 400 if company code is missing", async () => {
        const res = await request(app).post("/invoices").send({
            amt: 200,
        });
        expect(res.statusCode).toBe(400);
    })

    test("Responds with 400 if amount is missing", async () => {
        const res = await request(app).post("/invoices").send({
            comp_code: 'sam',
        });
        expect(res.statusCode).toBe(400);
    })
})

describe("/PUT /invoices/:name", () => {
    test("Updating an invoice's amount", async () => {
        const res = await request(app).put(`/invoices/${i1.id}`).send({
            amt: 150,
            paid: false
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.invoice.add_date).toContain("2024-02");
        expect(res.body.invoice.amt).toEqual(150);
        expect(res.body.invoice.comp_code).toEqual(i1.comp_code);
        expect(res.body.invoice.paid).toEqual(false);
        expect(res.body.invoice.paid_date).toEqual(null);
    })

    test("Updating an invoice's paid status, should update paid date also", async () => {
        const res = await request(app).put(`/invoices/${i1.id}`).send({
            amt: 100,
            paid: true
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.invoice.add_date).toContain("2024-02");
        expect(res.body.invoice.amt).toEqual(100);
        expect(res.body.invoice.comp_code).toEqual(i1.comp_code);
        expect(res.body.invoice.paid).toEqual(true);
        expect(res.body.invoice.paid_date).toContain("2024-02");
    })

    test("Updating an invoice's paid status from true to false, should update paid date to null also", async () => {
        await request(app).put(`/invoices/${i1.id}`).send({
            amt: 100,
            paid: true
        });
        const res = await request(app).put(`/invoices/${i1.id}`).send({
            amt: 100,
            paid: false
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.invoice.add_date).toContain("2024-02");
        expect(res.body.invoice.amt).toEqual(100);
        expect(res.body.invoice.comp_code).toEqual(i1.comp_code);
        expect(res.body.invoice.paid).toEqual(false);
        expect(res.body.invoice.paid_date).toBe(null);
    })
    
    test("Updating an invoice's amt and paid status, should update paid date also", async () => {
        const res = await request(app).put(`/invoices/${i1.id}`).send({
            amt: 200,
            paid: true
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.invoice.add_date).toContain("2024-02");
        expect(res.body.invoice.amt).toEqual(200);
        expect(res.body.invoice.comp_code).toEqual(i1.comp_code);
        expect(res.body.invoice.paid).toEqual(true);
        expect(res.body.invoice.paid_date).toContain("2024-02");
    })

    test("Responds with 400 if amount is missing", async () => {
        const res = await request(app).put(`/invoices/${i1.id}`).send({
            paid: true
        });
        expect(res.statusCode).toBe(400);
    })

    test("Responds with 400 if paid is missing", async () => {
        const res = await request(app).put(`/invoices/${i1.id}`).send({
            amt: 100
        });
        expect(res.statusCode).toBe(400);
    })

    test("Responds with 404 for invalid invoice", async () => {
        const res = await request(app).put(`/invoices/999`).send({
            amt: 150,
            paid: true
        });
        expect(res.statusCode).toBe(404)
    })
})

describe("/DELETE /invoices/:id", () => {
    test("Deleting an invoice", async () => {
      const res = await request(app).delete(`/invoices/${i1.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ status: 'deleted' })

      const response = await request(app).get("/invoices");
      expect(response.body.invoices.length).toEqual(0);
    })
    
    test("Responds with 404 for deleting invalid invoice", async () => {
      const res = await request(app).delete(`/invoices/999`);
      expect(res.statusCode).toBe(404);
    })
  })