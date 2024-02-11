const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db.js");

router.get("/", async function (req, res, next) {
    try {
        const results = await db.query('SELECT * FROM companies');
        return res.json({ companies: results.rows });
    }
    catch (err) {
        return next(err);
    }
})

router.get("/:code", async function (req, res, next) {
    try {
        console.log(req.params.code);
        const results = await db.query(`SELECT * FROM companies WHERE code = '${req.params.code}'`);
        return res.json({ company: results.rows });
    }
    catch (err) {
        return next(err);
    }
})

router.post("/", async function (req, res, next) {
    try {
        const { code, name, description } = req.body;
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
        return res.json({ companies: results.rows });
    }
    catch (err) {
        return next(err);
    }
})

module.exports = router;