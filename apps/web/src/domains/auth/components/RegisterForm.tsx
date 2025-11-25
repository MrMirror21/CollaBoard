import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';
import apiClient from '@/lib/api/api-client';

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, '이름은 최소 2자 이상이어야 합니다.')
      .max(50, '이름은 50자를 초과할 수 없습니다.'),
    email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
    password: z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
      .regex(
        /^(?=.*[a-zA-Z])(?=.*[0-9])/,
        '비밀번호는 영문과 숫자를 포함해야 합니다.',
      ),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score, label: '약함', color: 'bg-red-500' };
  if (score <= 2) return { score, label: '보통', color: 'bg-yellow-500' };
  if (score <= 3) return { score, label: '강함', color: 'bg-emerald-500' };
  return { score, label: '매우 강함', color: 'bg-emerald-600' };
}

export function RegisterForm() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
    },
  });

  const watchPassword = watch('password', '');
  const passwordStrength = getPasswordStrength(watchPassword);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{
        user: { id: string; email: string; name: string };
        accessToken: string;
        refreshToken: string;
      }>('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      const { user, accessToken, refreshToken } = response.data;

      setAuth(user, accessToken, refreshToken);
      navigate('/dashboard');
    } catch (err) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response
      ) {
        const axiosError = err as {
          response: { data: { error?: { message?: string } } };
        };
        const message = axiosError.response.data?.error?.message;

        if (message?.includes('이미 존재') || message?.includes('already')) {
          setError('이미 가입된 이메일 주소입니다.');
        } else {
          setError(message || '회원가입에 실패했습니다. 다시 시도해주세요.');
        }
      } else {
        setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          {/* 이름 필드 */}
          <div className="grid gap-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="name"
            >
              이름
              <Input
                id="name"
                placeholder="홍길동"
                type="text"
                autoCapitalize="none"
                autoComplete="name"
                autoCorrect="off"
                disabled={isLoading}
                {...register('name')}
              />
            </label>
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* 이메일 필드 */}
          <div className="grid gap-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="email"
            >
              이메일
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                {...register('email')}
              />
            </label>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* 비밀번호 필드 */}
          <div className="grid gap-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="password"
            >
              비밀번호
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                disabled={isLoading}
                {...register('password')}
              />
            </label>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
            {/* 비밀번호 강도 표시 */}
            {watchPassword && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength.score >= level
                          ? passwordStrength.color
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  비밀번호 강도: {passwordStrength.label}
                </p>
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              8자 이상, 영문과 숫자를 포함해야 합니다.
            </p>
          </div>

          {/* 비밀번호 확인 필드 */}
          <div className="grid gap-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="passwordConfirm"
            >
              비밀번호 확인
              <Input
                id="passwordConfirm"
                type="password"
                autoComplete="new-password"
                disabled={isLoading}
                {...register('passwordConfirm')}
              />
            </label>
            {errors.passwordConfirm && (
              <p className="text-sm text-red-500">
                {errors.passwordConfirm.message}
              </p>
            )}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* 제출 버튼 */}
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            회원가입
          </Button>
        </div>
      </form>
    </div>
  );
}
