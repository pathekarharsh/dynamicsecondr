const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let tasks = [];
let idCounter = 1;

// Get all tasks
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

// Add new task
app.post('/api/tasks', (req, res) => {
    const { title } = req.body;

    const newTask = {
        id: idCounter++,
        title: title,
        completed: false
    };

    tasks.push(newTask);

    res.json(newTask);
});

// Toggle complete
app.put('/api/tasks/:id', (req, res) => {

    const task = tasks.find(t => t.id == req.params.id);

    if (!task) {
        return res.status(404).json({error: "Task not found"});
    }

    task.completed = !task.completed;

    res.json(task);
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {

    tasks = tasks.filter(t => t.id != req.params.id);

    res.json({message: "Task deleted"});
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
