'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/solid';

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editTodoId, setEditTodoId] = useState(null);
  const [editTodoText, setEditTodoText] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
      setCurrentTime(
        now.toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchTodos = async () => {
      const response = await fetch('/api/todos');
      const data = await response.json();
      setTodos(data);
    };

    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newTodo, completed: false }),
    });

    if (response.ok) {
      const newTask = await response.json();
      const newTaskObject = { _id: newTask.insertedId, text: newTodo, completed: false };
      setTodos((prev) => [...prev, newTaskObject]);
      setNewTodo('');
    }
  };

  const deleteTodo = async (id) => {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setTodos((prev) => prev.filter((todo) => todo._id !== id));
    }
  };

  const startEditing = (id, text) => {
    setEditTodoId(id);
    setEditTodoText(text);
  };

  const updateTodo = async (id) => {
    if (!editTodoText.trim()) return;

    const response = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editTodoText }),
    });

    if (response.ok) {
      const updatedTodos = todos.map((todo) =>
        todo._id === id ? { ...todo, text: editTodoText } : todo
      );
      setTodos(updatedTodos);
      setEditTodoId(null);
      setEditTodoText('');
    }
  };

  const toggleTodoCompletion = async (id, completed) => {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });

    if (response.ok) {
      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === id ? { ...todo, completed } : todo
        )
      );
    }
  };

  const handleKeyDownAdd = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const handleKeyDownEdit = (e) => {
    if (e.key === 'Enter') {
      updateTodo(editTodoId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center sm:text-left">ToDoリスト</h1>

        {/* 日付と時間の表示 */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
          <ClockIcon className="h-6 w-6 text-blue-500" />
          <div>
            <p className="text-lg font-bold">{currentDate}</p>
            <p className="text-sm text-gray-500">{currentTime}</p>
          </div>
        </div>

        {/* タスクリスト */}
        <ul className="space-y-4">
          <AnimatePresence>
            {todos.map((todo) => (
              <motion.li
                key={todo._id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-4 rounded-lg shadow space-y-2 sm:space-y-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodoCompletion(todo._id, !todo.completed)}
                    className="h-5 w-5"
                  />
                  <span
                    className={`${
                      todo.completed ? 'line-through text-gray-400' : ''
                    }`}
                  >
                    {editTodoId === todo._id ? (
                      <input
                        type="text"
                        value={editTodoText}
                        onChange={(e) => setEditTodoText(e.target.value)}
                        onKeyDown={handleKeyDownEdit}
                        className="border rounded-lg px-2 py-1"
                      />
                    ) : (
                      todo.text
                    )}
                  </span>
                </div>
                <div className="flex justify-end sm:justify-start space-x-4">
                  {editTodoId === todo._id ? (
                    <button
                      onClick={() => updateTodo(todo._id)}
                      className="text-green-500 hover:text-green-700"
                    >
                      保存
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditing(todo._id, todo.text)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <PencilIcon className="h-6 w-6" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteTodo(todo._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="h-6 w-6" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {/* 新しいタスクの入力 */}
        <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="新しいタスクを入力"
            onKeyDown={handleKeyDownAdd}
            className="flex-grow border rounded-lg px-4 py-2"
          />
          <button
            onClick={addTodo}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}