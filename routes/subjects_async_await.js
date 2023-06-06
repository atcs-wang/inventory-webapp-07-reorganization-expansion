const DEBUG = true;

const express = require('express')
const db = require('../db/db_pool_promise');
const fs = require("fs");
const path = require("path");

let subjectsRouter = express.Router();

const read_subjects_all_alphabetical_sql = fs.readFileSync(path.join(__dirname,  "..", 
"db", "queries", "crud", "read_subjects_all_alphabetical.sql"),
    {encoding : "UTF-8"});

subjectsRouter.get('/', async (req, res) => {
    try {
        let [results, fields] = await db.execute(read_subjects_all_alphabetical_sql, [req.oidc.user.sub]);
        if (DEBUG) console.log(results);
        res.render("subjects", {subjectlist: results});
    } catch (error) {
        if (DEBUG) console.log(error);
        res.status(500).send(error); //Internal Server Error
    }
    
});

const create_subject_sql = fs.readFileSync(path.join(__dirname, "..", 
    "db", "queries", "crud", "insert_subject.sql"),
    {encoding : "UTF-8"});

subjectsRouter.post('/', async (req, res) => {
    try {
        let [results, fields] = await db.execute(create_subject_sql, [req.body.subjectName, req.oidc.user.sub]);
        if (DEBUG) console.log(results);
        res.redirect("/subjects");
    }
    catch (error) {
        if (DEBUG) console.log(error);
        res.status(500).send(error); //Internal Server Error
    }
});

const delete_subject_sql = fs.readFileSync(path.join(__dirname, "..", 
    "db", "queries", "crud", "delete_subject.sql"),
    {encoding : "UTF-8"});

subjectsRouter.get("/:id/delete", async (req, res) => {
    try {
        let [results, fields] = await db.execute(delete_subject_sql, [req.params.id, req.oidc.user.sub])
        if (DEBUG) console.log(results);
        res.redirect("/subjects");
    } catch(error) {
        if (DEBUG) console.log(error);
        if (error.code == "ER_ROW_IS_REFERENCED_2"){
            //special error if any assignments associated with the subject
            res.status(500).send("There are assignments still associated with that subject!")
        }
        else 
            res.status(500).send(error); //Internal Server Error    
    }
});

module.exports = subjectsRouter;