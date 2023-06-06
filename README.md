# Part 07: More CRUD operations, code reorganization

This tutorial follows after:
[# Part 06: Authentication and Authorization ](https://github.com/atcs-wang/inventory-webapp-05-handling-forms-post-crud)

Our app currently has a set of CRUD operations allowing us to Create, Read, Update, and Delete data in the `assignments` table.

In this tutorial, we will implement more CRUD data operations - this time, for data in the other table in our database, `subjects`. 

In the process, we will explore a few more things that can be done with forms, GET/POST requests, and database queries. 




## (7.0) REORGANIZATION

However, as our codebase grows, it is becoming essential to reorganize our codebase before we ambitiously aim to nearly double its size.

### (7.0.1) REORGNIZATION (PART 1/3) Using external SQL files. 


See files in `db/queries/`



### (7.0.2) REORGNIZATION (PART 2/3) Using partials. 

See the file `views/partials/navbar`, and how other `views/` files have:
```js
    <%- include('partials/navbar') %>
```

Partials are incredibly flexible, and can even be parameterized. SEe 

### (7.0.3) REORGNIZATION (PART 3/3) Using Routers. 



## (7.1) The big picture for CRUD operations

Here's a table that summarizes each operation we currently have:


| Operation           | HTTP Request + URL           | SQL Command   | HTTP response                    |
|---------------------|------------------------------|---------------|----------------------------------|
| READ full hw list   | GET  /assignments            | `SELECT`      | render assignments.ejs           |
| READ  hw details    | GET  /assignments/:id        | `SELECT`      | render details.ejs               |
| CREATE hw           | POST /assignments            | `INSERT`      | redirect to GET /assignments/:id |
| UPDATE hw           | POST /assignments/:id        | `UPDATE`      | redirect to GET /assignments/:id |
| DELETE hw           | GET  /assignments/:id/delete | `DELETE`      | redirect to GET /assignments     |

Here's a table that summarizes the subject-related operations we will add:


| Operation             | HTTP Request + URL           | SQL Command   | HTTP response                    |
|-----------------------|------------------------------|---------------|----------------------------------|
| READ full subject list| GET  /subjects               | `SELECT`      | render subjects.ejs              |
| READ subject (hw list)| GET  /subjects/:sid          | `SELECT`      | render assignments.ejs           |
| CREATE hw             | POST /subjects               | `INSERT`      | redirect to GET /assignments/:id |
| DELETE hw             | GET  /subjects/:id/delete    | `DELETE`      | redirect to GET /assignments     |

We will also be making some updates to the implementation of the two READ operations for hw.

## (7.1) READ (list), CREATE, and DELETE for subjects

//TODO

## (7.2) First Improvements to the READ hw list/details pages

In the last tutorial, we already (partially) implemented the 2 READ operations: one for a specific item, and one for the entire inventory.

First, we will review what is already implemented, then add some additional improvements that are needed, now that the `subjects` table will change frequently.

Here's the code in `app.js` that defines the two READ assignments routes:

```js
// define a route for the assignment list page
const read_assignments_all_sql = `
    SELECT 
        assignmentId, title, priority, subjectName, 
        assignments.subjectId as subjectId,
        DATE_FORMAT(dueDate, "%m/%d/%Y (%W)") AS dueDateFormatted
    FROM assignments
    JOIN subjects
        ON assignments.subjectId = subjects.subjectId
    ORDER BY assignments.assignmentId DESC
`
app.get( "/assignments", ( req, res ) => {
    db.execute(read_assignments_all_sql, (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);
        if (error)
            res.status(500).send(error); //Internal Server Error
        else
            res.send(results);
    });
});

// define a route for the assignment detail page
const read_assignment_detail_sql = `
    SELECT
        assignmentId, title, priority, subjectName,
        assignments.subjectId as subjectId,
        DATE_FORMAT(dueDate, "%W, %M %D %Y") AS dueDateExtended, 
        DATE_FORMAT(dueDate, "%Y-%m-%d") AS dueDateYMD, 
        description
    FROM assignments
    JOIN subjects
        ON assignments.subjectId = subjects.subjectId
    WHERE assignmentId = ?
`
app.get( "/assignments/:id", ( req, res ) => {
    db.execute(read_assignment_detail_sql, [req.params.id], (error, results) => {
        if (DEBUG)
            console.log(error ? error : results)
        if (error)
            res.status(500).send(error); //Internal Server Error
        else if (results.length == 0)
            res.status(404).send(`No assignment found with id = "${req.params.id}"` ); // NOT FOUND
        else
            res.send(results[0]); // results is still an array
        });
});
```

Here's the 4 steps again, but broken down specifically for the Read operations:

>```
> Browser --- request: GET URL -------> App Server
>                                       App Server --- SELECT query--> Database
>                                       App Server <-- results ARRAY ---- Database
> Browser <- response: RENDERED PAGE -- App Server
>```

1. **The web server receives a GET HTTP request from a browser** - either by entering the URL into their browser, or clicking a hyperlink.
2. **The web server makes a SELECT query to the database**. If the URL is `/assignments`, we SELECT for all rows in the `assignments` table. If the URL is `/assignments/:id`, we only SELECT for the one row in `assignment` where the `assignmentId` column matches the URL parameter `id`.
3. **The web server waits for results of the query**; if successful, the results are an *array* of objects representing a set of row entries.
4. **The web server uses the query results to RENDER a page and sends it in the HTTP response back to the browser**; in both cases, HTML pages are rendered from an EJS template (either `assignments.ejs` or `detail.ejs`) using the query results. The browser receives the HTML and displays it.

### (7.2.1) Adding a second query for `subjects`

Our `assignments` and `details` views both include forms which are necessary for our next two operations, CREATE and UPDATE. Both forms include a `<select>` element with some hard-coded options for the assignment's subject. These options are not dynamically rendered, and don't necessarily represent the current options in the database's `subjects` table. 

In order to populate the forms with all the options of the database, the web app server must make *two* queries to the database - one for the `assignments` data, the second for the list of `subjects` - before responding with the rendered page. The flow, then, is a little more complex than before:

>```
> Browser --- request: GET URL ------> App Server
>                                      App Server --- SELECT `assignments` --> Database
>                                      App Server <-- results ARRAY #1 ------- Database
>                                      App Server --- SELECT `subjects`  ----> Database
>                                      App Server <-- results ARRAY #2 ------- Database
> Browser <- response: RENDERED PAGE-- App Server
>```

The `subjects` query looks like this:

```sql
    SELECT 
        subjectId, subjectName
    FROM
        subjects
```

## (7.3) READ subject + hw list


## (7.4)  Using Promises

# TODO

Callbacks often produce ugly nesting formats ("callback hell").

Promises can be used instead to handle asynchronous operations in a more readable fashion than callbacks. They are fundamentally equivalent, but can be easier to work with once you understand them.

See `db_pool_promise.js` compared to `db_pool.js`, which simply changes to use the built-in "promisified" API of the mysql2 library.

Here's the main idea. In the promisified API for the mysql connection/pool, `db.execute` no longer takes a callback as a parameter, but instead returns a Promise object - representing the eventual success or failure of the intended operation. 

Then, two *separate* callback functions can be attached to that promise object, handling the results or error separately. 

Promises have a bit more going on than that - there can be operations chained to results, and can also be combined in and/or ways - but the basic idea can be seen below in this pseudocode:

```js
//using callbacks...

db.execute(sql, [params], (error, results, fields) => {
    //handle error, or results (and fields)
})

//using promises...

let promise = db.execute(sql, [params]);
promise.then( ([results, fields]) => {
    //handle results (and fields)
}).catch( (error) => {
    //handle error 
});

```


Note that what actually gets returned for a success is an array with 2 things - the `results`, and another value called `fields`. the `fields` parameter for the callback version of `execute` is optional, and we have not been using it thus far. 

Promises can alternatively be used with *async-await* syntax to really make code feel more like normal synchronous code. 


See differences between 
- assignments_callbacks.js
- assignments_promises.js
- assignments_async_await.js

and 

- subjects_callbacks.js
- subjects_promises.js
- subjects_async_await.js

Note the use of Promise.all() in some of the routes, which combines multiple queries into a single Promise that can be handled more cleanly than using nested callbacks.