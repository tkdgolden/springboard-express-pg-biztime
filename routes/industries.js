const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db.js");
const slugify = require("slugify");

router.get("/", async function (req, res, next) {
    try {
        const results = await db.query('SELECT * FROM industries');
        for (row of results.rows) {
            const ind = row.ind_code;
            const results = await db.query('SELECT comp_code FROM companies_industries WHERE ind_code = $1', [ind]);
            row['companies'] = results.rows;
        }
        return res.json({ industries: results.rows });
    }
    catch (err) {
        return next(err);
    }
})

router.post("/", async function (req, res, next) {
    if (!req.body.industry) {
        const err = new ExpressError("Must Include Industry", 400);
        return next(err);
    }
    try {
        const industry = req.body.industry;
        const ind_code = slugify(industry, {lower:true});
        const results = await db.query(`INSERT INTO industries (industry, ind_code) VALUES ($1, $2) RETURNING *`, [industry, ind_code]);
        return res.status(201).json({ industry: results.rows[0] });
    }
    catch (err) {
        return next(err);
    }
})

router.post("/:industry", async function (req, res, next) {
    try {
        const ind = req.params.industry;
        const comp = req.body.code;
        const results = await db.query(`INSERT INTO companies_industries (ind_code, comp_code) VALUES ($1, $2) RETURNING ind_code, comp_code`, [ind, comp]);
        return res.json({ industry: results.rows[0] });
    }
    catch (err) {
        return next(err);
    }
})

module.exports = router;