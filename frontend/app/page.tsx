"use client"

import { useState, useEffect, useRef } from "react"

interface Todo {
  id: number
  text: string
  done: boolean
  createdAt: string
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "done">("all")
  const [darkMode, setDarkMode] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const wails = () => (window as any).go.main.App

  useEffect(() => {
    wails().GetTodos().then((t: Todo[] | null) => setTodos(t || []))
  }, [])

  const addTodo = async () => {
    if (!input.trim()) return
    const todo = await wails().AddTodo(input, "medium")
    setTodos((prev) => [...prev, todo])
    setInput("")
    inputRef.current?.focus()
  }

  const toggle = async (id: number) => {
    const updated = await wails().ToggleTodo(id)
    setTodos(updated || [])
  }

  const deleteTodo = async (id: number) => {
    const updated = await wails().DeleteTodo(id)
    setTodos(updated || [])
  }

  const clearCompleted = async () => {
    const updated = await wails().ClearCompleted()
    setTodos(updated || [])
  }

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.done
    if (filter === "done") return t.done
    return true
  })

  const doneCount = todos.filter((t) => t.done).length
  const totalCount = todos.length
  const activeCount = totalCount - doneCount

  const [exportStatus, setExportStatus] = useState("")

  const exportTasks = async () => {
    console.log("Opening export dialog...")
    setExportStatus("Opening save dialog...")
    
    try {
      const result = await wails().ExportTodos()
      console.log("Export result:", result)
      
      if (!result || result === "") {
        setExportStatus("")
        return
      }
      
      const filename = result.split('/').pop() || result
      setExportStatus(`Saved as ${filename}`)
      setTimeout(() => setExportStatus(""), 4000)
    } catch (error) {
      console.error("Export error:", error)
      setExportStatus("Export failed!")
      setTimeout(() => setExportStatus(""), 3000)
    }
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <style>{`
        .dark {
          --bg-color: #1a1a1a;
          --text-color: #e0e0e0;
          --border-color: #333333;
          --card-bg: #2a2a2a;
        }
        .dark body {
          background-color: #1a1a1a;
          color: #e0e0e0;
        }
      `}</style>
      
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-50 to-white'}`}>
        {exportStatus && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-lg animate-pulse">
            {exportStatus}
          </div>
        )}

        <div className={`border-b-2 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-sm`}>
          <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <h2 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>TODO APP</h2>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode
                      ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Toggle dark mode"
                >
                  {darkMode ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.78a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2.828 2.828a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2.828 2.829a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM10 7a3 3 0 100 6 3 3 0 000-6zm.22 13.22a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zm2.828-2.829a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2.828-2.828a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm-2.828-2.829a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Open menu"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>

                  {showMenu && (
                    <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl z-50 border-2 ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                    }`}>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          exportTasks()
                          setShowMenu(false)
                        }}
                        className={`block px-4 py-2 text-sm font-medium border-b ${
                          darkMode
                            ? 'text-gray-300 hover:bg-gray-700 border-gray-700'
                            : 'text-gray-700 hover:bg-gray-100 border-gray-200'
                        }`}
                      >
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export Tasks
                      </a>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          alert("About Todo App v1.0\n\nBuilt with Go, Wails & Next.js\nWith SQLite Database")
                          setShowMenu(false)
                        }}
                        className={`block px-4 py-2 text-sm font-medium border-b ${
                          darkMode
                            ? 'text-gray-300 hover:bg-gray-700 border-gray-700'
                            : 'text-gray-700 hover:bg-gray-100 border-gray-200'
                        }`}
                      >
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        About
                      </a>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setShowMenu(false)
                        }}
                        className={`block px-4 py-2 text-sm font-medium ${
                          darkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <header className={`border-b-2 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-blue-100 bg-white'} shadow-sm`}>
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <svg className={`w-10 h-10 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Tasks</h1>
            </div>
            <p className={darkMode ? 'text-gray-400 mt-2' : 'text-gray-600 mt-2'}>Keep track of what needs to be done</p>
          
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className={`rounded-lg ${darkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-50'} p-4`}>
              <div className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{totalCount}</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Total</div>
            </div>
            <div className={`rounded-lg ${darkMode ? 'bg-green-900 bg-opacity-30' : 'bg-green-50'} p-4`}>
              <div className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{doneCount}</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Completed</div>
            </div>
            <div className={`rounded-lg ${darkMode ? 'bg-orange-900 bg-opacity-30' : 'bg-orange-50'} p-4`}>
              <div className={`text-3xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>{activeCount}</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Remaining</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className={`mb-8 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-200'} p-6 shadow-md border-2`}>
          <label className={`block mb-3 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Add a new task</label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type something you need to do..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              className={`flex-1 rounded-lg border-2 ${darkMode ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 focus:border-blue-400' : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500'} px-4 py-3 focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-200'} transition-all duration-200 text-base`}
            />
            <button
              onClick={addTodo}
              className={`rounded-lg ${darkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} px-6 py-3 font-semibold text-white transition-colors duration-200 active:scale-95 shadow-md hover:shadow-lg whitespace-nowrap flex items-center gap-2`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add</span>
            </button>
          </div>
        </div>

        {totalCount > 0 && (
          <div className={`mb-6 flex flex-wrap items-center gap-3 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 shadow-sm border`}>
            <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>View:</span>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                filter === "all"
                  ? "bg-blue-600 text-white shadow-md"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                filter === "active"
                  ? "bg-orange-500 text-white shadow-md"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilter("done")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                filter === "done"
                  ? "bg-green-600 text-white shadow-md"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Done ({doneCount})
            </button>
            {doneCount > 0 && (
              <button
                onClick={clearCompleted}
                className={`ml-auto px-4 py-2 text-sm font-medium ${darkMode ? 'text-red-400 hover:bg-red-950' : 'text-red-600 hover:bg-red-50'} rounded-lg transition-colors duration-200 flex items-center gap-1.5`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear completed
              </button>
            )}
          </div>
        )}

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className={`rounded-lg border-2 border-dashed ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'} p-12 text-center`}>
              <div className="flex justify-center mb-4">
                <svg className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {totalCount === 0
                  ? "No tasks yet!"
                  : filter === "done"
                  ? "No completed tasks."
                  : "No active tasks. Great job!"}
              </p>
              {totalCount === 0 && (
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mt-2`}>Add your first task above to get started</p>
              )}
            </div>
          ) : (
            filtered.map((todo) => (
              <div
                key={todo.id}
                className={`group flex items-start gap-4 rounded-lg border-2 ${darkMode ? 'border-gray-700 bg-gray-800 hover:border-blue-500' : 'border-gray-200 bg-white hover:border-blue-300'} p-4 hover:shadow-md transition-all duration-200`}
              >
                <button
                  onClick={() => toggle(todo.id)}
                  className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-full border-3 flex items-center justify-center transition-all duration-200
                    ${
                      todo.done
                        ? "border-green-500 bg-green-500"
                        : darkMode
                        ? "border-gray-600 hover:border-blue-400 hover:bg-blue-900"
                        : "border-gray-400 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                >
                  {todo.done && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0 pt-0.5">
                  <p
                    className={`text-lg break-words transition-all duration-200 ${
                      todo.done
                        ? darkMode
                          ? "line-through text-gray-600"
                          : "line-through text-gray-400"
                        : darkMode
                        ? "text-gray-100 font-medium"
                        : "text-gray-800 font-medium"
                    }`}
                  >
                    {todo.text}
                  </p>
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2 flex items-center gap-1`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00-.293.707l-2.829 2.829a1 1 0 101.414 1.414L8.586 14H7a1 1 0 100 2h4a1 1 0 100-2H9.414l3.293-3.293A1 1 0 0010 10V6z" clipRule="evenodd" />
                    </svg>
                    {todo.createdAt}
                  </div>
                </div>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className={`flex-shrink-0 opacity-0 group-hover:opacity-100 p-2 ${darkMode ? 'text-gray-600 hover:text-red-400 hover:bg-red-950' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'} rounded-lg transition-all duration-200`}
                  title="Delete task"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      <footer className={`mt-12 border-t ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-400' : 'border-gray-200 bg-white text-gray-500'} px-4 py-6 text-center text-sm`}>
        <p className="flex items-center justify-center gap-2">
          Built with 
          <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 20 20">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
          using Go • Wails • Next.js
        </p>
      </footer>
    </div>
    </div>
  )
}
