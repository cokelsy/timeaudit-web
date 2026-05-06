import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTodosByUser, createTodo, updateTodo, deleteTodo, type Todo, type TodoFormData } from '@/services/todoService';

export function useTodos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getTodosByUser(user.uid);
      setTodos(data);
    } catch (err) {
      console.error('Failed to fetch todos:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const add = async (data: TodoFormData) => {
    if (!user) return;
    const todo = await createTodo(user.uid, data);
    setTodos((prev) => [todo, ...prev]);
    return todo;
  };

  const toggle = async (id: string, completed: boolean) => {
    await updateTodo(id, { completed });
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed } : t))
    );
  };

  const update = async (id: string, data: Partial<{ content: string; deadline: Date | null }>) => {
    await updateTodo(id, data);
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
  };

  const remove = async (id: string) => {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return { todos, loading, add, toggle, update, remove, refetch: fetchTodos };
}