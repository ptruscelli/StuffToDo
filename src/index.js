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
// module pattern for the array containing all projects

    let projects = [];

    function addProject(title) {
        const project = new Project(title);
        projects.unshift(project); // add new projects to start of list instead of the end
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
        deleteBtn.textContent = "DLT";
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
        this.project.addTodo("New Task", "Medium");
        this.renderTodos();
    }

    deleteProjectClickHandler() {
        UI.deleteProject(this.id);
    }

    
    renderTodos() {

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
        wrap.classList.add("title-prio-wrap");

        this.text = document.createElement("div");
        this.text.classList.add("todo-text");
        this.text.contentEditable = "plaintext-only";
        this.text.textContent = this.todo.text; 
        this.text.addEventListener("blur", () => {
            // store user inputted todo text once user clicks away from todo item
            this.handleUserTextInput();
        });

        const prio = document.createElement("div");
        prio.classList.add("priority-indicator");

        wrap.append(this.text, prio);
        todo.append(wrap);

        return todo;
    }


    // function that saves input text from user when changing todo item textcontent
    handleUserTextInput() {
        this.todo.text = this.text.innerText;
    }
}




const UI = (() => {

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


    function renderProjects() {

        Projects.getAllProjects().forEach(project => {
            if(!renderedProjects.has(project.id)) {
                const projectElement = new ProjectElement(project);
                projectsContainer.prepend(projectElement.element);
                renderedProjects.add(project.id);
            };
        });

    };

    function openAddProjectPopup() {
        newProjectButton.classList.add("hidden");
        newProjectPopup.classList.remove("hidden");
    };

    function closeAddProjectPopup() {
        newProjectPopup.classList.add("hidden");
        newProjectButton.classList.remove("hidden");
    }

    function confirmProjectHandler() {
        Projects.addProject(projectNameInput.value);
        renderProjects();
        closeAddProjectPopup();
    }

    return {
        renderProjects,
        deleteProject
    };

})();







