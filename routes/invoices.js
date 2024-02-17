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
            const err = new ExpressError("Invoice Not Found", 404);
            return next(err);
        }
        return res.json({ invoice: results.rows[0] });
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
        return res.status(201).json({ invoice: results.rows[0] });
    }
    catch (err) {
        return next(err);
    }
})

router.put("/:id", async function (req, res, next) {
    if (!req.body.amt || !("paid" in req.body)) {
        console.log(req.body)
        const err = new ExpressError("Must Include Amt & Paid", 400);
        return next(err);
    }
    try {
        const id = req.params.id;
        const old = await db.query(`SELECT paid FROM invoices WHERE id = $1`, [id]);
        let isPaid;
        if (old.rows.length === 0) {
            const err = new ExpressError("Invoice Not Found", 404);
            return next(err);
        }
        else {
            isPaid = old.rows[0].paid;
        }
        const { amt, paid } = req.body;
        let results;
        if (paid === false && isPaid === true) {
            results = await db.query(`UPDATE invoices SET amt = $1, paid = false, paid_date = null WHERE id = $2 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, id]);
        }
        else if (paid === true && isPaid === false) {
            const today = new Date();
            console.log(today);
            results = await db.query(`UPDATE invoices SET amt = $1, paid = true, paid_date = $3 WHERE id = $2 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, id, today]);
        }
        else {
            results = await db.query(`UPDATE invoices SET amt = $1 WHERE id = $2 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, id]);
        }
        return res.json({ invoice: results.rows[0] });
    }
    catch (err) {
        return next(err);
    }
})

router.delete("/:id", async function (req, res, next) {
    try {
        const results = await db.query(`DELETE FROM invoices WHERE id = $1`, [req.params.id]);
        if (results.rowCount === 0) {
            const err = new ExpressError("Invoice Not Found", 404);
            return next(err);
        };
        return res.json({ status: 'deleted'});
    }
    catch (err) {
        return next(err);
    }
})

module.exports = router;