import { Link } from 'react-router-dom';

import { LoginForm } from '@/domains/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            이메일과 비밀번호를 입력하여 로그인하세요.
          </p>
        </div>
        <LoginForm />
        <p className="px-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link
            to="/register"
            className="hover:text-brand underline underline-offset-4"
          >
            계정이 없으신가요? 회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
