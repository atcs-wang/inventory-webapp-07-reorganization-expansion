-- Insert new row into assignments table
INSERT INTO assignments 
    (title, priority, subjectId, dueDate, userId) 
VALUES 
    (?, ?, ?, ?, ?);
