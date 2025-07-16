
import AirDatepicker from "air-datepicker";
import localeEn from 'air-datepicker/locale/en';

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
        this.dueDate = "";
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
// module pattern for the array containing all projects

    let projects = [];


    function addProject(title) {
        const project = new Project(title);
        projects.unshift(project); // add new projects to start of list instead of the end
        updateStorage();
    };


    function removeProject(id) {
        projects = projects.filter(proj => proj.id !== id);
        updateStorage();
    };


    function getAllProjects() {
        return [...projects];
    };



    function loadFromStorage() {

        const storedProjects = JSON.parse(localStorage.getItem("projects"));

        if (storedProjects !== null && storedProjects.length !== 0) {
            console.log("found existing projects!")
            projects = storedProjects.map(proj => reconstructProject(proj));
        };
    };


    function reconstructProject(proj) {

        console.log("reconstructing projects");

        const project = new Project(proj.title);
        project.id = proj.id;

        console.log("reconstructing todos")
        project.todos = proj.todos.map(todo => {

            const newTodo = new Todo(todo.priority);
            newTodo.text = todo.text;
            newTodo.completed = todo.completed;
            newTodo.id = todo.id;
            newTodo.dueDate = todo.dueDate;

            return newTodo;

        });

        return project;
    };


    function updateStorage() {
        localStorage.setItem("projects", JSON.stringify(projects));
    };


    // loadFromStorage();
    

    return {
        addProject,
        removeProject,
        getAllProjects,
        updateStorage,
        loadFromStorage
    };
})();




// ============================================================================
// UI & DOM 
// ============================================================================


class ProjectElement {
// class for creating project instances as DOM elements

    constructor(project) {
        this.project = project; // reference to project instance
        this.id = this.project.id; // store same id as original project instance
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

        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = CROSS_SVG;
        deleteBtn.classList.add("delete-proj-button");
        deleteBtn.addEventListener("click", () => {
            this.deleteProjectClickHandler();
        });

        wrapper.append(title, taskButton, deleteBtn);

        this.todosList = document.createElement("ul"); // store reference to this project's specific UL 
        this.todosList.classList.add("todos-list");

        proj.append(wrapper, this.todosList);

        return proj;
    }



    addTaskClickHandler() {
        this.project.addTodo("Medium");
        this.renderTodos();
    }

    deleteProjectClickHandler() {
        UI.deleteProject(this.id);
    }

    
    renderTodos() {

        this.todosList.innerHTML = ""; 

        for (const todo of this.project.todos) {

            const todoElement = new TodoElement(todo, this.project, this);
            this.todosList.append(todoElement.element);
            todoElement.text.focus(); // focus input to newly created list item

        };

        Projects.updateStorage();

    }


}

const CROSS_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
</svg>`;


// class for creating todo instances as DOM elements 
class TodoElement {

    constructor(todo, project, projectElement) {    
        this.todo = todo; // reference to todo instance
        this.project = project; // reference to parent project
        this.projectElement = projectElement; // reference to parent projectElement
        this.dueDate = this.todo.dueDate;
        this.element = this.createTodo();
    }

    // function that creates todos as DOM elements
    createTodo() {

        const todo = document.createElement("li");
        todo.dataset.id = this.todo.id;
        todo.classList.add("todo-item");

        const wrap = document.createElement("div");
        wrap.classList.add("check-text-wrap");

        const info = document.createElement("div");
        info.classList.add("todo-info");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("done-check")

        this.text = document.createElement("div");
        this.text.classList.add("todo-text");
        this.text.contentEditable = "plaintext-only";
        this.text.spellcheck = false;
        this.text.textContent = this.todo.text; 
        this.text.addEventListener("blur", () => {
            // store user text input once user clicks away from todo item
            this.handleUserTextInput();
        });

        const removeBtn = document.createElement("button");
        removeBtn.classList.add("remove-todo-button");
        removeBtn.innerHTML = CROSS_SVG;
        removeBtn.addEventListener("click", () => {
            this.handleRemoveClick();
        });

        const dueBy = document.createElement("div");
        dueBy.classList.add("due-date");
        dueBy.textContent = "Due:";

        const datePicker = document.createElement("input");
        datePicker.value = this.dueDate;
        datePicker.type = "text";
        datePicker.classList.add("date-picker");
        datePicker.placeholder = "Select Date";
        new AirDatepicker (datePicker, {
            locale: localeEn,
            dateFormat: "EEEE dd MMM",
            onSelect: ({ formattedDate }) => {
                this.todo.dueDate = formattedDate;
                console.log(this.todo.dueDate);
                Projects.updateStorage();
            }
        });

        // const prio = document.createElement("div");
        // prio.classList.add("priority-indicator");
        wrap.append(checkbox, this.text, removeBtn);
        info.append(dueBy, datePicker);
        todo.append(wrap, info);

        return todo;
    }


    // function that saves input text from user when changing todo item textcontent
    handleUserTextInput() {
        this.todo.text = this.text.innerText;
        Projects.updateStorage();
    }

    handleRemoveClick() {
        this.project.removeTodo(this.todo.id);
        this.projectElement.renderTodos();
    }
}





const UI = (() => {

    new AirDatepicker(".date-picker", {
        locale: localeEn,
        dateFormat: "EEEE dd MMM"
    });

    const newProjectButton = document.querySelector("#new-project-button");
    const newProjectPopup = document.querySelector("#new-project-popup");
    const confirmBtn = document.querySelector("#confirm-button");
    const cancelBtn = document.querySelector("#cancel-button");
    const projectNameInput = document.querySelector("#project-name-input");

    newProjectButton.addEventListener("click", openAddProjectPopup);
    confirmBtn.addEventListener("click", confirmProjectHandler);
    cancelBtn.addEventListener("click", closeAddProjectPopup);


    const projectsContainer = document.querySelector("#projects");
    const renderedProjects = new Set(); 


    function deleteProject(id) {
        projectsContainer.querySelector(`[data-id="${id}"]`).remove();
        renderedProjects.delete(id);
        Projects.removeProject(id);
    }


    function renderProjects(loadFromStorage = false) {

        Projects.getAllProjects().forEach(project => {
            if(!renderedProjects.has(project.id)) {
                const projectElement = new ProjectElement(project);
                projectElement.renderTodos();
                loadFromStorage ? // maintain correct order of project dispay (newest -> oldest)
                    projectsContainer.append(projectElement.element) : // render from storage
                    projectsContainer.prepend(projectElement.element); // render from new project added
                renderedProjects.add(project.id);
            };
        });

    };

    function openAddProjectPopup() {
        newProjectButton.classList.add("hidden");
        newProjectPopup.classList.remove("hidden");
        projectNameInput.focus();
    };

    function closeAddProjectPopup() {
        projectNameInput.value = ""; // clear text input content for next use
        newProjectPopup.classList.add("hidden");
        newProjectButton.classList.remove("hidden");
    }

    function confirmProjectHandler() {
        Projects.addProject(projectNameInput.value);
        renderProjects(false);
        closeAddProjectPopup();
    }

    document.addEventListener("DOMContentLoaded", () => {
        Projects.loadFromStorage();
        renderProjects(true);
    });

    return {
        renderProjects,
        deleteProject
    };

})();







