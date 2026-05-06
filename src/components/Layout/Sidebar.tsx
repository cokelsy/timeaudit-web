import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTodos } from '@/hooks/useTodos';
import TodoDetailModal from '@/components/Modal/TodoDetailModal';
import type { Todo } from '@/services/todoService';

export default function Sidebar() {
  const { user } = useAuth();
  const { todos, loading, add, toggle, remove, refetch } = useTodos();
  const [isOpen, setIsOpen] = useState(true);

  const [inputVal, setInputVal] = useState('');
  const [deadlineStr, setDeadlineStr] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [detailTodo, setDetailTodo] = useState<Todo | null>(null);

  useEffect(() => {
    if (user) refetch();
  }, [user, refetch]);

  const handleAdd = async () => {
    const content = inputVal.trim();
    if (!content) return;
    await add({
      content,
      deadline: deadlineStr ? new Date(deadlineStr) : undefined,
    });
    setInputVal('');
    setDeadlineStr('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    await toggle(id, !completed);
  };

  const formatDeadline = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const pendingTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-bg-card border border-border border-r-0 rounded-l-md px-2 py-3 text-text-secondary hover:text-text-primary lg:hidden"
      >
        {isOpen ? '▶' : '◀'}
      </button>

      <aside
        className={`
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0
          fixed right-0 top-14 bottom-0 z-30
          w-80 bg-bg-card border-l border-border
          transition-transform duration-200 ease-in-out
          flex flex-col
          lg:static lg:z-auto lg:shrink-0
        `}
      >
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">待办事项</h2>
        </div>

        <div className="p-3 border-b border-border space-y-2">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="添加待办..."
              className="flex-1 h-9 px-3 rounded-[8px] border border-border bg-bg-input text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand transition-colors"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!inputVal.trim()}
              className="h-9 px-3 rounded-[8px] bg-brand text-white text-[13px] font-medium hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              添加
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-text-tertiary whitespace-nowrap">截止时间</label>
            <input
              type="datetime-local"
              value={deadlineStr}
              onChange={(e) => setDeadlineStr(e.target.value)}
              className="flex-1 h-8 px-2 rounded-[6px] border border-border bg-bg-input text-[12px] text-text-primary focus:outline-none focus:border-brand transition-colors"
            />
            {deadlineStr && (
              <button
                type="button"
                onClick={() => setDeadlineStr('')}
                className="text-[11px] text-text-tertiary hover:text-danger transition-colors"
              >
                清除
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-[13px] text-text-secondary">加载中...</div>
          ) : todos.length === 0 ? (
            <div className="p-4 text-[13px] text-text-tertiary">暂无待办</div>
          ) : (
            <>
              {pendingTodos.length > 0 && (
                <div className="px-3 pt-3 pb-1">
                  <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wide">
                    未完成 ({pendingTodos.length})
                  </span>
                </div>
              )}
              {pendingTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="group flex items-start gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <button
                    onClick={() => handleToggle(todo.id, todo.completed)}
                    className="mt-0.5 w-[18px] h-[18px] rounded border-2 border-gray-300 hover:border-brand flex-shrink-0 flex items-center justify-center transition-colors"
                  />
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setDetailTodo(todo)}
                  >
                    <p className="text-[13px] text-text-primary leading-snug break-words">
                      {todo.content}
                    </p>
                    {todo.deadline && (
                      <p className="text-[11px] text-text-tertiary mt-0.5">
                        🕐 {formatDeadline(todo.deadline)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => remove(todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger transition-opacity text-[13px] flex-shrink-0 mt-0.5"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {completedTodos.length > 0 && (
                <>
                  <div className="px-3 pt-4 pb-1">
                    <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wide">
                      已完成 ({completedTodos.length})
                    </span>
                  </div>
                  {completedTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className="group flex items-start gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <button
                        onClick={() => handleToggle(todo.id, todo.completed)}
                        className="mt-0.5 w-[18px] h-[18px] rounded border-2 border-brand bg-brand flex-shrink-0 flex items-center justify-center transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => setDetailTodo(todo)}
                      >
                        <p className="text-[13px] text-text-tertiary line-through leading-snug break-words">
                          {todo.content}
                        </p>
                        {todo.deadline && (
                          <p className="text-[11px] text-text-tertiary mt-0.5 line-through">
                            🕐 {formatDeadline(todo.deadline)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => remove(todo.id)}
                        className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger transition-opacity text-[13px] flex-shrink-0 mt-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </aside>

      <TodoDetailModal
        open={!!detailTodo}
        todo={detailTodo}
        onClose={() => setDetailTodo(null)}
        onDelete={(id) => {
          remove(id);
          setDetailTodo(null);
        }}
      />
    </>
  );
}