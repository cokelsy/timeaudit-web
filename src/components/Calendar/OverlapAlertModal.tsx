interface OverlapAlertModalProps {
  open: boolean;
  overlappingTitle: string;
  onEdit: () => void;
  onCancel: () => void;
}

export default function OverlapAlertModal({
  open,
  overlappingTitle,
  onEdit,
  onCancel,
}: OverlapAlertModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-[12px] shadow-xl w-full max-w-[360px] mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h3 className="text-[15px] font-medium text-text-primary">时间冲突</h3>
            <p className="text-[13px] text-text-secondary mt-0.5">
              此时间段已有活动「{overlappingTitle}」
            </p>
          </div>
        </div>
        <p className="text-[13px] text-text-secondary mb-5">
          是否修改该活动的时间？
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 h-9 rounded-[8px] text-[13px] text-text-secondary border border-border hover:bg-bg-input transition-colors"
          >
            取消
          </button>
          <button
            onClick={onEdit}
            className="px-4 h-9 rounded-[8px] bg-brand text-white text-[13px] font-medium hover:bg-brand-hover transition-colors"
          >
            修改该活动
          </button>
        </div>
      </div>
    </div>
  );
}