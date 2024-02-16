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

beforeEach(async function () {
    await db.query(`INSERT INTO companies (code, name, description) VALUES ('${sam.code}', '${sam.name}', '${sam.description}')`);
    await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('${i1.comp_code}', '${i1.amt}')`);

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

        expect(res.body.invoices[0].add_date).toEqual("2024-02-15T06:00:00.000Z");
        expect(res.body.invoices[0].amt).toEqual(i1.amt);
        expect(res.body.invoices[0].comp_code).toEqual(i1.comp_code);
        expect(res.body.invoices[0].paid).toEqual(false);
        expect(res.body.invoices[0].paid_date).toEqual(null);
    })
})

// describe("GET /companies/:name", () => {
//     test("Get company by name", async () => {
//         const res = await request(app).get(`/companies/${sam.code}`);
//         expect(res.statusCode).toBe(200)
//         expect(res.body).toEqual({
//             "company": {
//                 "code": sam.code,
//                 "description": sam.description, "invoices": [],
//                 "name": sam.name,
//             },
//         })
//     })

//     test("Responds with 404 for invalid company", async () => {
//         const res = await request(app).get(`/companies/tesla`);
//         expect(res.statusCode).toBe(404)
//     })
// })

// describe("POST /companies", () => {
//     test("Creating a company", async () => {
//         const res = await request(app).post("/companies").send(ikea);
//         expect(res.statusCode).toBe(201);
//         expect(res.body).toEqual({ company: ikea });
//     })

//     test("Responds with 400 if code is missing", async () => {
//         const res = await request(app).post("/companies").send({
//             name: "Ikea",
//             description: "Sleek and minimal, falls apart"
//         });
//         expect(res.statusCode).toBe(400);
//     })

//     test("Responds with 400 if name is missing", async () => {
//         const res = await request(app).post("/companies").send({
//             code: "ikea",
//             description: "Sleek and minimal, falls apart"
//         });
//         expect(res.statusCode).toBe(400);
//     })

//     test("Responds with 400 if description is missing", async () => {
//         const res = await request(app).post("/companies").send({
//             code: "ikea",
//             name: "Ikea"
//         });
//         expect(res.statusCode).toBe(400);
//     })
// })

// describe("/PUT /companies/:name", () => {
//     test("Updating a company's name", async () => {
//         const res = await request(app).put(`/companies/${sam.code}`).send({
//             name: "Subaru",
//             description: "Good phones, terrible appliances"
//         });
//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual({
//             company: {
//                 code: "sam",
//                 name: "Subaru",
//                 description: "Good phones, terrible appliances"
//             }
//         });
//     })

//     test("Updating a company's description", async () => {
//         const res = await request(app).put(`/companies/${sam.code}`).send({
//             name: "Samsung",
//             description: "android is better"
//         });
//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual({
//             company: {
//                 code: "sam",
//                 name: "Samsung",
//                 description: "android is better"
//             }
//         });
//     })

//     test("Updating a company's name AND description", async () => {
//         const res = await request(app).put(`/companies/${sam.code}`).send({
//             name: "Subaru",
//             description: "android is better"
//         });
//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual({
//             company: {
//                 code: "sam",
//                 name: "Subaru",
//                 description: "android is better"
//             }
//         });
//     })

//     test("Responds with 404 for invalid code", async () => {
//         const res = await request(app).put(`/companies/Dawn`).send({
//             name: "Subaru",
//             description: "android is better"
//         });
//         expect(res.statusCode).toBe(404);
//     })
// })

// describe("/DELETE /companies/:code", () => {
//     test("Deleting a company", async () => {
//       const res = await request(app).delete(`/companies/${sam.code}`);
//       expect(res.statusCode).toBe(200);
//       expect(res.body).toEqual({ status: 'deleted' })
//     })
    
//     test("Responds with 404 for deleting invalid company", async () => {
//       const res = await request(app).delete(`/companies/msi`);
//       expect(res.statusCode).toBe(404);
//     })
//   })