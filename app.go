package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"sync"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type Todo struct {
	ID        int    `json:"id"`
	Text      string `json:"text"`
	Done      bool   `json:"done"`
	CreatedAt string `json:"createdAt"`
	Priority  string `json:"priority"`
}

type App struct {
	ctx context.Context
	db  *sql.DB
	mu  sync.Mutex
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.initDB()
}

func (a *App) initDB() {
	os.MkdirAll("data", 0755)

	db, err := sql.Open("sqlite3", "data/todos.db")
	if err != nil {
		panic(err)
	}

	a.db = db

	createTableSQL := `
	CREATE TABLE IF NOT EXISTS todos (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		text TEXT NOT NULL,
		done BOOLEAN DEFAULT 0,
		created_at TEXT NOT NULL,
		priority TEXT DEFAULT 'medium'
	);
	`

	_, err = a.db.Exec(createTableSQL)
	if err != nil {
		panic(err)
	}
}

func (a *App) GetTodos() []Todo {
	a.mu.Lock()
	defer a.mu.Unlock()

	rows, err := a.db.Query("SELECT id, text, done, created_at, priority FROM todos ORDER BY id DESC")
	if err != nil {
		return []Todo{}
	}
	defer rows.Close()

	var todos []Todo
	for rows.Next() {
		var todo Todo
		err := rows.Scan(&todo.ID, &todo.Text, &todo.Done, &todo.CreatedAt, &todo.Priority)
		if err != nil {
			continue
		}
		todos = append(todos, todo)
	}

	return todos
}

func (a *App) AddTodo(text string, priority string) Todo {
	a.mu.Lock()
	defer a.mu.Unlock()

	if priority == "" {
		priority = "medium"
	}

	createdAt := time.Now().Format("15:04")

	result, err := a.db.Exec(
		"INSERT INTO todos (text, done, created_at, priority) VALUES (?, ?, ?, ?)",
		text, false, createdAt, priority,
	)
	if err != nil {
		return Todo{}
	}

	id, err := result.LastInsertId()
	if err != nil {
		return Todo{}
	}

	return Todo{
		ID:        int(id),
		Text:      text,
		Done:      false,
		CreatedAt: createdAt,
		Priority:  priority,
	}
}

func (a *App) ToggleTodo(id int) []Todo {
	a.mu.Lock()
	defer a.mu.Unlock()

	var currentDone bool
	err := a.db.QueryRow("SELECT done FROM todos WHERE id = ?", id).Scan(&currentDone)
	if err != nil {
		return []Todo{}
	}

	_, err = a.db.Exec("UPDATE todos SET done = ? WHERE id = ?", !currentDone, id)
	if err != nil {
		return []Todo{}
	}

	rows, err := a.db.Query("SELECT id, text, done, created_at, priority FROM todos ORDER BY id DESC")
	if err != nil {
		return []Todo{}
	}
	defer rows.Close()

	var todos []Todo
	for rows.Next() {
		var todo Todo
		err := rows.Scan(&todo.ID, &todo.Text, &todo.Done, &todo.CreatedAt, &todo.Priority)
		if err != nil {
			continue
		}
		todos = append(todos, todo)
	}

	return todos
}

func (a *App) DeleteTodo(id int) []Todo {
	a.mu.Lock()
	defer a.mu.Unlock()

	_, err := a.db.Exec("DELETE FROM todos WHERE id = ?", id)
	if err != nil {
		return []Todo{}
	}

	rows, err := a.db.Query("SELECT id, text, done, created_at, priority FROM todos ORDER BY id DESC")
	if err != nil {
		return []Todo{}
	}
	defer rows.Close()

	var todos []Todo
	for rows.Next() {
		var todo Todo
		err := rows.Scan(&todo.ID, &todo.Text, &todo.Done, &todo.CreatedAt, &todo.Priority)
		if err != nil {
			continue
		}
		todos = append(todos, todo)
	}

	return todos
}

func (a *App) ClearCompleted() []Todo {
	a.mu.Lock()
	defer a.mu.Unlock()

	_, err := a.db.Exec("DELETE FROM todos WHERE done = 1")
	if err != nil {
		return []Todo{}
	}

	rows, err := a.db.Query("SELECT id, text, done, created_at, priority FROM todos ORDER BY id DESC")
	if err != nil {
		return []Todo{}
	}
	defer rows.Close()

	var todos []Todo
	for rows.Next() {
		var todo Todo
		err := rows.Scan(&todo.ID, &todo.Text, &todo.Done, &todo.CreatedAt, &todo.Priority)
		if err != nil {
			continue
		}
		todos = append(todos, todo)
	}

	return todos
}

func (a *App) ExportTodos() string {
	a.mu.Lock()

	rows, err := a.db.Query("SELECT id, text, done, created_at, priority FROM todos ORDER BY id DESC")
	if err != nil {
		a.mu.Unlock()
		return ""
	}
	defer rows.Close()

	var todos []Todo
	for rows.Next() {
		var todo Todo
		err := rows.Scan(&todo.ID, &todo.Text, &todo.Done, &todo.CreatedAt, &todo.Priority)
		if err != nil {
			continue
		}
		todos = append(todos, todo)
	}

	a.mu.Unlock()

	if len(todos) == 0 {
		return ""
	}

	jsonData, err := json.MarshalIndent(todos, "", "  ")
	if err != nil {
		return ""
	}

	homeDir, err := os.UserHomeDir()
	if err != nil {
		homeDir = "."
	}

	downloadsPath := homeDir + "/todo-exports"
	os.MkdirAll(downloadsPath, 0755)

	timestamp := time.Now().Format("2006-01-02_15-04-05")
	filename := downloadsPath + "/" + fmt.Sprintf("todos-%s.json", timestamp)

	err = os.WriteFile(filename, jsonData, 0644)
	if err != nil {
		return ""
	}

	return filename
}
