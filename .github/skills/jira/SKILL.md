When reading information from Jira tickets, please follow these guidelines:

# User Stories

When the ticket is a user story, follow these guidelines:

**Description**:
To retrieve the description, read the field "Story Description" (field id: `customfield_10030`).
This field contains the main content of the user story, outlining the requirements and details of the task.
The description is usually segmented into the sections "User Story", "Akzeptanzkriterien", "Technische Hinweise", "Testfälle", "Design" and "Product Owner Notice".

# Bugs

When the ticket is a bug, follow these guidelines

**Description**:
To retrieve the description, read the field "Bug Description" (field id: `customfield_10035`).
This field contains the main content of the bug, outlining the issue, steps to reproduce, expected and actual results, and any relevant details for fixing the bug.
The description is usually segmented into the sections "Given", "When", "Then" and "Expected".

# Sub-Bugs

When the ticket is a sub-bug, follow these guidelines:

**Description**:
To retrieve the description, read the field "Bug Description" (field id: `customfield_10035`).
This field contains the main content of the sub-bug, outlining the issue, steps to reproduce, expected and actual results, and any relevant details for fixing the sub-bug.
The description is usually segmented into the sections "Given", "When", "Then" and "Expected".

In order to properly fix the sub-bug, it is crucial to also read the description of the parent item.
The parent item may contain additional context, requirements, or constraints that are essential for understanding the sub-bug and implementing an effective solution.
Always ensure to review the parent item's description to gain a comprehensive understanding of the issue at hand.

# Spike

When the ticket is a spike, follow these guidelines:

**Description**:
To retrieve the description, read the field "Description".
This field contains the main content of the spike, outlining the requirements and details of the task.
The description is usually segmented into the sections "Beschreibung", "Fragen", "Ergebnis" and "Timebox".

Typically a spike is used to research or investigate a specific topic, technology, or approach.
Always create a plan to document your findings and share them with the team.

# Task

When the ticket is a task, follow these guidelines:

**Description**:
To retrieve the description, read the field "Task Description" (field id: `customfield_10042`).
This field contains the main content of the task, outlining the requirements and details of the task.
