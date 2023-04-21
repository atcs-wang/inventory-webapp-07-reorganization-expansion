-- Create the assignments table
-- This includes a foreign key constraint referencing the 
-- subject table, which must be created first.
-- userId refers to an identifier from a 3rd party auth service
-- using OpenId Connect
CREATE TABLE assignments (
  assignmentId INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(45) NOT NULL,
  priority INT NULL,
  subjectId INT NOT NULL,
  dueDate DATE NULL,
  userId VARCHAR(255) NULL,
  description VARCHAR(150) NULL,
  PRIMARY KEY (assignmentId),
  INDEX assignmentSubject_idx (subjectId ASC),
  CONSTRAINT assignmentSubject
    FOREIGN KEY (subjectId)
    REFERENCES subjects (subjectId)
    ON DELETE RESTRICT
    ON UPDATE CASCADE);

    