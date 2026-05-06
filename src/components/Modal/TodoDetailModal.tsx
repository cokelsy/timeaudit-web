import type { Todo } from '@/services/todoService';

interface TodoDetailModalProps {
  open: boolean;
  todo: Todo | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export default function TodoDetailModal({ open, todo, onClose, onDelete }: TodoDetailModalProps) {
  if (!open || !todo) return null;

  const formatDeadline = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const handleDelete = () => {
    if (onDelete && todo) {
      onDelete(todo.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-[12px] shadow-xl w-full max-w-[360px] mx-4 p-6">
        <h3 className="text-[15px] font-medium text-text-primary mb-4">待办详情</h3>
        <div className="space-y-3">
          <div>
            <span className="text-[12px] text-text-tertiary">内容</span>
            <p className={`text-[14px] mt-0.5 ${todo.completed ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
              {todo.content}
            </p>
          </div>
          {todo.deadline && (
            <div>
              <span className="text-[12px] text-text-tertiary">截止时间</span>
              <p className="text-[14px] text-text-primary mt-0.5">{formatDeadline(todo.deadline)}</p>
            </div>
          )}
          <div>
            <span className="text-[12px] text-text-tertiary">状态</span>
            <p className="text-[14px] text-text-primary mt-0.5">
              {todo.completed ? '已完成' : '未完成'}
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          {onDelete && (
            <button
              onClick={handleDelete}
              className="px-4 h-9 rounded-[8px] text-[13px] text-danger border border-danger/30 hover:bg-danger/8 transition-colors"
            >
              删除
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 h-9 rounded-[8px] text-[13px] text-text-secondary border border-border hover:bg-bg-input transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}