
import AirDatepicker from "air-datepicker";
import localeEn from 'air-datepicker/locale/en';

import { isToday, isTomorrow, isWithinInterval, addDays, format } from "date-fns";

import "./styles.css";

const CROSS_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
</svg>`;


// ============================================================================
// Core Functionality
// ============================================================================


class Todo {
// class for creating individual todo item instances

    constructor() {
        this.text = "";
        this.completed = false;
        this.dueDate = null;
        this.dueDateDisplay = "";
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
    addTodo() {
        const todo = new Todo();
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


    // function getAllProjects() {
    //     return [...projects];
    // };

    function getAllProjects() {
        return Object.freeze([...projects]);
    };



    // ================================ STORAGE METHODS ===================================

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

            const newTodo = new Todo();
            newTodo.text = todo.text;
            newTodo.completed = todo.completed;
            newTodo.id = todo.id;
            newTodo.dueDate = todo.dueDate ? new Date(todo.dueDate) : null; // Convert back to Date
            newTodo.dueDateDisplay = todo.dueDateDisplay;

            return newTodo;

        });

        return project;
    };


    function updateStorage() {
        localStorage.setItem("projects", JSON.stringify(projects));
    };



    // ========================== TODO FILTER FUNCTIONS =============================

    function filterTodosByDate (filterFunction) {

        return projects.flatMap(project => project.todos
            .filter(filterFunction)
            .map(todo => ({...todo, projectTitle: project.title}))
        );

    };

    
    function getDueTodayTodos() {
        return filterTodosByDate(todo => {
            if (!todo.dueDate) return false;
            return isToday(todo.dueDate);
        });
    };


    function getDueTomorrowTodos() {
        return filterTodosByDate(todo => {
            if (!todo.dueDate) return false;
            return isTomorrow(todo.dueDate);
        });
    };


    function getDueNextWeekTodos() {
        return filterTodosByDate(todo => {
            if (!todo.dueDate) return false;

            const today = new Date();
            const nextWeek = addDays(today, 7);

            return isWithinInterval(todo.dueDate, {start: addDays(today, 2), end: nextWeek});
        });
    };
    

    return {
        addProject,
        removeProject,
        getAllProjects,
        updateStorage,
        loadFromStorage,
        getDueTodayTodos,
        getDueTomorrowTodos,
        getDueNextWeekTodos
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
        this.project.addTodo();
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



// class for creating todo instances as DOM elements 
class TodoElement {

    constructor(todo, project, projectElement) {    
        this.todo = todo; // reference to todo instance
        this.project = project; // reference to parent project
        this.projectElement = projectElement; // reference to parent projectElement
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
        datePicker.value = this.todo.dueDateDisplay;
        datePicker.type = "text";
        datePicker.classList.add("date-picker");
        datePicker.placeholder = "Select Date";
        new AirDatepicker (datePicker, {
            locale: localeEn,
            dateFormat: "EEEE dd MMM",
            onSelect: ({ date, formattedDate }) => {
                this.todo.dueDate = date;
                this.todo.dueDateDisplay = formattedDate;
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


    const newProjectButton = document.querySelector("#new-project-button");
    const newProjectPopup = document.querySelector("#new-project-popup");
    const confirmBtn = document.querySelector("#confirm-button");
    const cancelBtn = document.querySelector("#cancel-button");
    const projectNameInput = document.querySelector("#project-name-input");


    const projectsBtn = document.querySelector("#my-projects");
    projectsBtn.addEventListener("click", () => {
        clearPage();
        newProjectButton.classList.remove("hidden");
        renderProjects(true);
    });

    const DueSoonBtn = document.querySelector("#due-soon");
    DueSoonBtn.addEventListener("click", () => {
        newProjectButton.classList.add("hidden");
        DueSoonUI.renderPage();
    });

    newProjectButton.addEventListener("click", openAddProjectPopup);
    confirmBtn.addEventListener("click", confirmProjectHandler);
    cancelBtn.addEventListener("click", closeAddProjectPopup);


    const projectsContainer = document.querySelector("#projects");
    const renderedProjects = new Set(); 


    function clearPage() {
        renderedProjects.clear();
        projectsContainer.innerHTML = "";
    }


    function deleteProject(id) {
        projectsContainer.querySelector(`[data-id="${id}"]`).remove();
        renderedProjects.delete(id);
        Projects.removeProject(id);
    };


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
        PageInit.welcomeLoad();
        Projects.loadFromStorage();
        renderProjects(true);
    });

    return {
        renderProjects,
        deleteProject,
        clearPage
    };

})();





const DueSoonUI = (() => {

    const projectsContainer = document.querySelector("#projects");


    function createSection(sectionTitle, todos) {

        const proj = document.createElement("li");
        proj.dataset.id = crypto.randomUUID();
        proj.classList.add("project");

        const wrapper = document.createElement("div");
        wrapper.classList.add("title-button-wrapper");

        const title = document.createElement("h2");
        title.textContent = sectionTitle;
        title.classList.add("project-title");

        wrapper.append(title);

        const todosList = document.createElement("ul");
        todosList.classList.add("todos-list");
        todos.forEach(todo => {
            const todoItem = createTodo(todo);
            todosList.append(todoItem);
        });

        proj.append(wrapper, todosList);

        projectsContainer.append(proj);
    }


    function createTodo(todo) {

        const dueTodo = document.createElement("li");
        dueTodo.dataset.id = todo.id;
        dueTodo.classList.add("todo-item");

        const wrap = document.createElement("div");
        wrap.classList.add("check-text-wrap");

        const info = document.createElement("div");
        info.classList.add("todo-info");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("done-check")

        const text = document.createElement("div");
        text.classList.add("todo-text");
        text.contentEditable = "plaintext-only";
        text.spellcheck = false;
        text.textContent = todo.text; 
        text.addEventListener("blur", () => {
            // store user text input once user clicks away from todo item
            todo.text = text.innerText;
            Projects.updateStorage();
        });

        // const removeBtn = document.createElement("button");
        // removeBtn.classList.add("remove-todo-button");
        // removeBtn.innerHTML = CROSS_SVG;
        // removeBtn.addEventListener("click", () => {
        //     this.handleRemoveClick();
        // });

        const dueBy = document.createElement("div");
        dueBy.classList.add("due-date");
        dueBy.textContent = "Due:";

        const date = document.createElement("input");
        date.value = todo.dueDateDisplay;
        date.type = "text";
        date.classList.add("date-picker");
        // datePicker.placeholder = "Select Date";
        // new AirDatepicker (datePicker, {
        //     locale: localeEn,
        //     dateFormat: "EEEE dd MMM",
        //     onSelect: ({ date, formattedDate }) => {
        //         this.todo.dueDate = date;
        //         this.todo.dueDateDisplay = formattedDate;
        //         Projects.updateStorage();
        //     }
        // });

        
        wrap.append(checkbox, text);
        info.append(dueBy, date);
        dueTodo.append(wrap, info);

        return dueTodo;
    };    




    function renderPage() {

        UI.clearPage();

        createSection("Due Today", Projects.getDueTodayTodos());
        createSection("Due Tomorrow", Projects.getDueTomorrowTodos());
        createSection("Due in The Next Week", Projects.getDueNextWeekTodos());

    };

    return {renderPage}

})();




const PageInit = (() => {

    
    function createWelcomeProject() {

        Projects.addProject("Example Project");

        const exampleProject = Projects.getAllProjects()[0]; // 

        const today = new Date();
        const tomorrow = addDays(today, 1);
        

        const exampleTodos = [
            {
                text: "Welcome to StuffNeedsDoing to-do list app!",
                dueDate: today,
                dueDateDisplay: format(today, "EEEE dd MMM")
            },
            {
                text: "Create new projects with the '+ New Project' button",
                dueDate: today,
                dueDateDisplay: format(today, "EEEE dd MMM")
            },
            {
                text: "Click '+ New Task' to add more todos",
                dueDate: tomorrow,
                dueDateDisplay: format(tomorrow, "EEEE dd MMM")
            },
            {
                text: "Click this text to edit any todo item",
                dueDate: tomorrow,
                dueDateDisplay: format(tomorrow, "EEEE dd MMM")
            },
            {
                text: "Use the date picker to set due dates (optional)",
                dueDate: addDays(today, 3),
                dueDateDisplay: format(addDays(today, 3), "EEEE dd MMM")
            },
            {
                text: "Check out the 'Due Soon' tab to see tasks by upcoming due-date",
                dueDate: addDays(today, 4),
                dueDateDisplay: format(addDays(today, 4), "EEEE dd MMM")
            }
        ];


        exampleTodos.forEach(todoData => {

            exampleProject.addTodo();
            const newTodo = exampleProject.todos[exampleProject.todos.length - 1];

            newTodo.text = todoData.text;
            newTodo.dueDate = todoData.dueDate;
            newTodo.dueDateDisplay = todoData.dueDateDisplay;

        });

        Projects.updateStorage();
    };

    // checker function for previously stored projects (returns true if no previous projects)
    function welcomeCheck() {
        return localStorage.getItem("projects") === "null" || !localStorage.getItem("projects");
    };

    // if welcomeCheck returns true (no previous projects), load example project.
    function welcomeLoad() {
        if (welcomeCheck()) {
            console.log("first time load, loading example welcome project...");
            createWelcomeProject();
        };
    };


    return {
        welcomeLoad
    };
    

})();