import { Link } from 'react-router-dom';

import { RegisterForm } from '@/domains/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">회원가입</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            CollaBoard에 가입하고 팀과 함께 협업하세요.
          </p>
        </div>
        <RegisterForm />
        <p className="px-8 text-center text-sm text-slate-500 dark:text-slate-400">
          회원가입 시{' '}
          <Link
            to="/terms"
            className="underline underline-offset-4 hover:text-slate-900 dark:hover:text-slate-100"
          >
            이용약관
          </Link>{' '}
          및{' '}
          <Link
            to="/privacy"
            className="underline underline-offset-4 hover:text-slate-900 dark:hover:text-slate-100"
          >
            개인정보처리방침
          </Link>
          에 동의하게 됩니다.
        </p>
        <p className="px-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link
            to="/login"
            className="hover:text-brand underline underline-offset-4"
          >
            이미 계정이 있으신가요? 로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
