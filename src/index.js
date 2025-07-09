import "./styles.css";


// ============================================================================
// Core Functionality
// ============================================================================


class Todo {
// class for creating individual todo item instances

    constructor(priority) {
        this.text = "";
        this.priority = priority;
        this.completed = false;
        this.id = crypto.randomUUID();
    }

    toggleComplete() {
        this.completed = !this.completed;
    }
}




class Project {
// class for creating project instances

    constructor(title) {
        this.title = title;
        this.todos = [];
        this.id = crypto.randomUUID();
    }

    // function for adding todo instances to a project
    addTodo(priority) {
        const todo = new Todo(priority);
        this.todos.push(todo);
    }

    // function for removing todo instances from a project
    removeTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
    }
}

const Projects = (() => {
// module pattern for storing projects in an array

    let projects = [];

    function addProject(title) {
        const project = new Project(title);
        projects.unshift(project);
    };

    function removeProject(id) {
        projects = projects.filter(proj => proj.id !== id);
    };

    function getAllProjects() {
        return [...projects];
    };
    
    return {
        addProject,
        removeProject,
        getAllProjects
    };
})();




// ============================================================================
// UI & DOM 
// ============================================================================


class ProjectElement {
// class for creating project instances as DOM elements

    constructor(project) {
        this.project = project; // reference to project instance
        this.element = this.createProject();
    }

    createProject() {
        const proj = document.createElement("li");
        proj.dataset.id = this.project.id;
        proj.classList.add("project");

        const wrapper = document.createElement("div");
        wrapper.classList.add("title-button-wrapper");

        const title = document.createElement("h2");
        title.textContent = this.project.title;
        title.classList.add("project-title");

        const taskButton = document.createElement("button");
        taskButton.textContent = "+ New Task";
        taskButton.classList.add("new-task-button");
        taskButton.addEventListener("click", () => {
            this.addTaskClickHandler();
        });

        wrapper.append(title, taskButton);

        this.todosList = document.createElement("ul"); // store reference to this project's specific UL 
        this.todosList.classList.add("todos-list");

        proj.append(wrapper, this.todosList);

        return proj;
    }

    addTaskClickHandler() {
        this.project.addTodo("New Task", "Medium");
        this.updateDisplayedTodos();
    }

    updateDisplayedTodos() {

        this.todosList.innerHTML = ""; 

        for (const todo of this.project.todos) {

            const todoElement = new TodoElement(todo, this.project);
            this.todosList.append(todoElement.element);
            todoElement.text.focus(); // focus input to newly created list item

        };

    }


}



// class for creating todo instances as DOM elements 
class TodoElement {

    constructor(todo, project) {    
        this.todo = todo; // reference to todo instance
        this.project = project; // reference to parent project
        this.element = this.createTodo();
    }

    // function that creates todos as DOM elements
    createTodo() {

        const todo = document.createElement("li");
        todo.dataset.id = this.todo.id;
        todo.classList.add("todo-item");

        const wrap = document.createElement("div");
        this.text = document.createElement("div");
        this.text.contentEditable = "plaintext-only";
        this.text.textContent = this.todo.text;
        const prio = document.createElement("div");

        wrap.classList.add("title-prio-wrap");
        this.text.classList.add("todo-text");
        prio.classList.add("priority-indicator");

        wrap.append(this.text, prio);
        todo.append(wrap);

        return todo;
    }
}


// function that displays projects on UI
function displayProjects() {
    const projectsContainer = document.querySelector("#projects");

    for (const project of Projects.getAllProjects()) {
        const newProj = new ProjectElement(project);
        projectsContainer.append(newProj.element);
    }
};




// Tests
Projects.addProject("Test Project");

document.addEventListener('DOMContentLoaded', () => {
    displayProjects();
});

