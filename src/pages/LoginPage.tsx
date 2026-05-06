import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const schema = yup.object({
  email: yup.string().email('请输入有效的邮箱地址').required('邮箱不能为空'),
  password: yup.string().required('密码不能为空'),
});

type LoginForm = yup.InferType<typeof schema>;

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

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      navigate('/app');
    } catch (e: any) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        setError('邮箱或密码错误');
      } else if (e.code === 'auth/too-many-requests') {
        setError('登录尝试过多，请稍后重试');
      } else {
        setError('登录失败，请稍后重试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-page px-4">
      <div className="w-full max-w-[360px] flex flex-col items-center">
        <BrandLogo />

        <h1 className="text-[24px] font-medium text-text-primary tracking-tight mb-10 text-center">
          登录
        </h1>

        {error && (
          <div className="w-full mb-6 p-3 rounded-[8px] bg-danger/8 text-danger text-[13px] leading-snug text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <div className="mb-5">
            <input
              type="email"
              {...register('email')}
              className="w-full h-12 px-4 rounded-[8px] border border-border bg-bg-input text-text-primary text-[14px] placeholder:text-text-tertiary transition-all duration-200"
              placeholder="用户名或邮箱"
            />
            {errors.email && (
              <p className="mt-1.5 text-[12px] text-danger text-center">{errors.email.message}</p>
            )}
          </div>

          <div className="relative mb-6">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className="w-full h-12 px-4 pr-11 rounded-[8px] border border-border bg-bg-input text-text-primary text-[14px] placeholder:text-text-tertiary transition-all duration-200"
              placeholder="密码"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
            {errors.password && (
              <p className="mt-1.5 text-[12px] text-danger text-center">{errors.password.message}</p>
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
            {submitting ? '登录中...' : '登录'}
          </button>
        </form>

        <Link
          to="/forgot-password"
          className="mt-6 text-[13px] text-text-secondary hover:text-text-primary transition-colors"
        >
          忘记密码？
        </Link>

        <div className="mt-20 w-full">
          <Link
            to="/register"
            className="block w-full h-12 rounded-[8px] border border-border text-text-primary text-[14px] font-medium text-center leading-[48px] hover:border-text-tertiary transition-all duration-200"
          >
            注册新账号
          </Link>
        </div>
      </div>
    </div>
  );
}