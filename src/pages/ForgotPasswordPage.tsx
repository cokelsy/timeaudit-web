import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const schema = yup.object({
  email: yup.string().email('请输入有效的邮箱地址').required('邮箱不能为空'),
});

type ForgotPasswordForm = yup.InferType<typeof schema>;

function BrandLogo() {
  return (
    <div className="flex flex-col items-center gap-2.5 mb-8">
      <div className="w-11 h-11 bg-text-primary rounded-[10px] flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
          <rect x="3" y="4" width="22" height="4" rx="1.5" fill="white" />
          <rect x="12" y="4" width="4" height="18" rx="1.5" fill="white" />
          <rect x="18" y="12" width="7" height="4" rx="1.5" fill="white" />
        </svg>
      </div>
      <span className="text-[13px] font-medium tracking-[0.15em] text-text-secondary uppercase">
        TimeAudit
      </span>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setError('');
    setSubmitting(true);
    try {
      await resetPassword(data.email);
      setSent(true);
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        setError('该邮箱未注册');
      } else {
        setError('发送失败，请稍后重试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-page px-4">
      <div className="w-full max-w-[360px] flex flex-col items-center">
        <BrandLogo />

        <h1 className="text-[24px] font-medium text-text-primary tracking-tight mb-2 text-center">
          重置密码
        </h1>
        <p className="text-[14px] text-text-secondary mb-10 text-center">
          输入邮箱，我们将发送重置链接。
        </p>

        {sent ? (
          <div className="w-full flex flex-col items-center">
            <div className="w-14 h-14 mb-6 rounded-full bg-brand/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="text-[15px] text-text-primary font-medium mb-1.5 text-center">
              查看邮箱
            </p>
            <p className="text-[14px] text-text-secondary mb-3 text-center">
              重置链接已发送到您的邮箱。
            </p>
            <p className="text-[12px] text-text-tertiary mb-8 text-center">
              若未收到邮件，请检查垃圾邮件文件夹
            </p>
            <Link
              to="/login"
              className="block w-full h-12 rounded-[8px] bg-brand text-white text-[14px] font-medium text-center leading-[48px] hover:bg-brand-hover transition-all duration-200"
            >
              返回登录
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="w-full mb-6 p-3 rounded-[8px] bg-danger/8 text-danger text-[13px] leading-snug text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
              <div className="mb-6">
                <input
                  type="email"
                  {...register('email')}
                  className="w-full h-12 px-4 rounded-[8px] border border-border bg-bg-input text-text-primary text-[14px] placeholder:text-text-tertiary transition-all duration-200"
                  placeholder="邮箱地址"
                />
                {errors.email && (
                  <p className="mt-1.5 text-[12px] text-danger text-center">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-[8px] bg-brand text-white text-[14px] font-medium hover:bg-brand-hover disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {submitting && (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="15" strokeLinecap="round" />
                  </svg>
                )}
                {submitting ? '发送中...' : '发送重置链接'}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-[13px] text-text-secondary">
                想起密码了？{' '}
                <Link to="/login" className="text-brand hover:text-brand-hover transition-colors">
                  登录
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}