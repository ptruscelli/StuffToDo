# StuffToDo - TOP to do list project 

Odin Project task with the aim of tying together recently learned concepts and OOP principles such as ES6 modules, classes, webpack, factory functions, jSON etc...

### Todo list must-haves:
- Each 'todo' will be a dynamically created object (so using factories or classes).
- Todo list should have `projects` or some kind of separate grouping option of `todos`, with a default project for when the user first opens the app.
- Users should be able to create different projects and choose which project their todos go into.
- Application logic should be separated (creating new todos, setting as complete, changing priority) from DOM-related stuff, so keep everything in separate modules.

- Each todo should have the following properties:
	- Title
	- Description/notes
	- DueDate
	- Priority level
	- Could add a checklist option?

- User interface should be able to do the following:
	- View all projects (and add/delete)
	- view todos in each project (maybe just title and duedate + some kind of priority tracker)
	- option to expand a todo to see all its details
	- add/delete todos

- Other potential feature ideas:
	- ability to sort todos in date added/duedate or priority level

### Things to check-out
- date-fns 
- localStorage
