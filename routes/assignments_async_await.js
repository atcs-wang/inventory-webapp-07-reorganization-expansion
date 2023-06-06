const DEBUG = true;

const express = require('express')
const db = require('../db/db_pool_promise');
const fs = require("fs");
const path = require("path");

let assignmentsRouter = express.Router();

const read_subjects_all_sql = fs.readFileSync(path.join(__dirname, "..",
    "db", "queries", "crud", "read_subjects_all.sql"),
    { encoding: "UTF-8" });

// define a route for the assignment list page
const read_assignments_all_sql = fs.readFileSync(path.join(__dirname, "..",
    "db", "queries", "crud", "read_assignments_all.sql"),
    { encoding: "UTF-8" });
assignmentsRouter.get("/", async (req, res) => {

    try {
        let readAssignmentsPromise = db.execute(read_assignments_all_sql, [req.oidc.user.sub]);
        let readSubjectsPromise = db.execute(read_subjects_all_sql, [req.oidc.user.sub]);
        
        let [ [results, fields], [results2, fields2]] = await Promise.all([readAssignmentsPromise, readSubjectsPromise])
        if (DEBUG) {
            console.log(results);
            console.log(results2);
        }
        let data = { hwlist: results, subjectlist: results2 }; // results is still an array, get first (only) element
        res.render('assignments', data);
    } catch (error) {
        if (DEBUG) console.log(error);
        res.status(500).send(error); //Internal Server Error
    }
    // What's passed to the rendered view: 
    //  hwlist: [
    //     { assignmentId: __ , title: __ , priority: __ , subjectName: __ , subjectId: __ ,  dueDateFormatted: __ },
    //     { assignmentId: __ , title: __ , priority: __ , subjectName: __ , subjectId: __ ,   dueDateFormatted: __ },
    //     ...                    
    //  ]
    //  subjectlist : [
    //     {subjectId: ___, subjectName: ___}, ...
    //  ]
    //  

});


// define a route for the assignment detail page
const read_assignment_detail_sql = fs.readFileSync(path.join(__dirname, "..",
    "db", "queries", "crud", "read_assignment_detail.sql"),
    { encoding: "UTF-8" });

assignmentsRouter.get("/:id", async (req, res) => {
    try {
        let readAssignmentDetailPromise = db.execute(read_assignment_detail_sql, [req.params.id, req.oidc.user.sub]);
        let readSubjectsPromise = db.execute(read_subjects_all_sql, [req.oidc.user.sub]);
            
        let [ [results, fields], [results2, fields2]] = await Promise.all([readAssignmentDetailPromise, readSubjectsPromise]);
        
        if (DEBUG) {
            console.log(results);
            console.log(results2);
        }
        if (results.length == 0)
            res.status(404).send(`No assignment found with id = "${req.params.id}"` ); // NOT FOUND
        else {
            let data = { hw: results[0], subjectlist: results2 }; // results is still an array, get first (only) element
            res.render('detail', data);    
        }
    } catch (error) {
        if (DEBUG) console.log(error);
        res.status(500).send(error); //Internal Server Error
    }
    // What's passed to the rendered view: 
    //  hw: { id: ___ , title: ___ , priority: ___ , 
    //    subject: ___ , dueDateExtended: ___ , 
    //    dueDateYMD: ___ , description: ___ 
    //  }
    //  subjectlist : [
    //     {subjectId: ___, subjectName: ___}, ...
    //  ]
    //  
});


// define a route for assignment CREATE
const create_assignment_sql = fs.readFileSync(path.join(__dirname, "..",
    "db", "queries", "crud", "insert_assignment.sql"),
    { encoding: "UTF-8" });

assignmentsRouter.post("/", async (req, res) => {
    try {
        let [results, fields] = await db.execute(create_assignment_sql,
            [req.body.title, req.body.priority, req.body.subject,
            req.body.dueDate, req.oidc.user.sub]);
        if (DEBUG) console.log(results);
        //results.insertId has the primary key (assignmentId) of the newly inserted row.
        res.redirect(`/assignments/${results.insertId}`);
    } catch (error)  {
        if (DEBUG) console.log(error);
        res.status(500).send(error); //Internal Server Error
    }
});

// define a route for assignment UPDATE
const update_assignment_sql = fs.readFileSync(path.join(__dirname, "..",
    "db", "queries", "crud", "update_assignment.sql"),
    { encoding: "UTF-8" });

assignmentsRouter.post("/:id", async (req, res) => {
    try {
        let [results, fields] = await db.execute(update_assignment_sql, 
            [req.body.title, req.body.priority, req.body.subject, req.body.dueDate, req.body.description, req.params.id]);
        if (DEBUG) console.log(results);
        res.redirect(`/assignments/${req.params.id}`);
    } catch (error) {
        if (DEBUG) console.log(error);
        res.status(500).send(error); //Internal Server Error
    }
});

// define a route for assignment DELETE
const delete_assignment_sql = fs.readFileSync(path.join(__dirname, "..",
    "db", "queries", "crud", "delete_assignment.sql"),
    { encoding: "UTF-8" });


assignmentsRouter.get("/:id/delete", async (req, res) => {
    try {
        let [results, fields] = await db.execute(delete_assignment_sql, [req.params.id, req.oidc.user.sub])
        if (DEBUG) console.log(results);
        res.redirect(`/assignments`);
    } catch (error)  {
        if (DEBUG) console.log(error);
        res.status(500).send(error); //Internal Server Error
    }

});

module.exports = assignmentsRouter;