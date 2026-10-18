// Load saved reminders and notes
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let notes = JSON.parse(localStorage.getItem("notes")) || [];

// Add a reminder
function addTask() {
    let task = document.getElementById("task").value;
    let time = document.getElementById("time").value;

    if (task === "" || time === "") {
        alert("Please enter the task and time.");
        return;
    }

    tasks.push({ task: task, time: time });

    localStorage.setItem("tasks", JSON.stringify(tasks));

    document.getElementById("task").value = "";
    document.getElementById("time").value = "";

    showTasks();
}

// Display reminders
function showTasks() {
    let list = document.getElementById("taskList");
    list.innerHTML = "";

    tasks.forEach(function(item, index) {
        let li = document.createElement("li");

        li.textContent = item.task + " - " + item.time + " ";

        let button = document.createElement("button");
        button.textContent = "Delete";

        button.onclick = function() {
            tasks.splice(index, 1);
            localStorage.setItem("tasks", JSON.stringify(tasks));
            showTasks();
        };

        li.appendChild(button);
        list.appendChild(li);
    });
}

// Save a note
function saveNote() {
    let title = document.getElementById("noteTitle").value;
    let text = document.getElementById("noteText").value;

    if (title.trim() === "" || text.trim() === "") {
        alert("Please enter the title and note.");
        return;
    }

    notes.push({ title: title, text: text });

    localStorage.setItem("notes", JSON.stringify(notes));

    document.getElementById("noteTitle").value = "";
    document.getElementById("noteText").value = "";

    showNotes();
}

// Display saved notes
function showNotes() {
    let list = document.getElementById("noteList");
    list.innerHTML = "";

    notes.forEach(function(note, index) {
        let li = document.createElement("li");

        li.textContent = note.title + ": " + note.text + " ";

        let button = document.createElement("button");
        button.textContent = "Delete";

        button.onclick = function() {
            notes.splice(index, 1);
            localStorage.setItem("notes", JSON.stringify(notes));
            showNotes();
        };

        li.appendChild(button);
        list.appendChild(li);
    });
}

// Create storage for documents
let database;

let request = indexedDB.open("TimeBuddy", 1);

request.onupgradeneeded = function(event) {
    database = event.target.result;
    database.createObjectStore("documents", {
        keyPath: "id",
        autoIncrement: true
    });
};

request.onsuccess = function(event) {
    database = event.target.result;
    showDocuments();
};

// Save a document
function saveDocument() {
    let file = document.getElementById("file").files[0];

    if (!file) {
        alert("Please choose a document.");
        return;
    }

    if (!database) {
        alert("Please wait for storage to open.");
        return;
    }

    let transaction = database.transaction("documents", "readwrite");

    transaction.objectStore("documents").add({
        name: file.name,
        file: file
    });

    transaction.oncomplete = function() {
        document.getElementById("file").value = "";
        showDocuments();
        alert("Document saved.");
    };
}

// Display saved documents
function showDocuments() {
    if (!database) {
        return;
    }

    let list = document.getElementById("documentList");
    let transaction = database.transaction("documents", "readonly");
    let request = transaction.objectStore("documents").getAll();

    request.onsuccess = function() {
        list.innerHTML = "";

        request.result.forEach(function(doc) {
            let li = document.createElement("li");
            li.appendChild(document.createTextNode(doc.name + " "));

            let openButton = document.createElement("button");
            openButton.textContent = "Open / Download";

            openButton.onclick = function() {
                let url = URL.createObjectURL(doc.file);
                let link = document.createElement("a");

                link.href = url;
                link.download = doc.name;
                link.click();

                setTimeout(function() {
                    URL.revokeObjectURL(url);
                }, 60000);
            };

            let deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";

            deleteButton.onclick = function() {
                if (confirm("Delete this document?")) {
                    let tx = database.transaction("documents", "readwrite");
                    tx.objectStore("documents").delete(doc.id);

                    tx.oncomplete = function() {
                        showDocuments();
                    };
                }
            };

            li.appendChild(openButton);
            li.appendChild(deleteButton);
            list.appendChild(li);
        });
    };
}

// Show saved reminders and notes
showTasks();
showNotes();