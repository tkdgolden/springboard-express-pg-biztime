const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db.js");

router.get("/", async function (req, res, next) {
    try {
        const results = await db.query('SELECT * FROM invoices');
        return res.json({ invoices: results.rows });
    }
    catch (err) {
        return next(err);
    }
})

router.get("/:id", async function (req, res, next) {
    try {
        const results = await db.query(`SELECT * FROM invoices WHERE id = $1`, [req.params.id]);
        if (results.rows.length === 0) {
            const err = new ExpressError("Company Not Found", 404);
            return next(err);
        }
        return res.json({ invoice: results.rows });
    }
    catch (err) {
        return next(err);
    }
})

router.post("/", async function (req, res, next) {
    if (!req.body.comp_code || !req.body.amt) {
        const err = new ExpressError("Must Include Company Code and Amount", 400);
        return next(err);
    }
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);
        return res.json({ invoice: results.rows });
    }
    catch (err) {
        return next(err);
    }
})

module.exports = router;