import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api/api-client';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';

const loginSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .regex(
      /^(?=.*[a-zA-Z])(?=.*[0-9])/,
      '비밀번호는 영문과 숫자를 포함해야 합니다.',
    ),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const location = useLocation();
  const from = location.state?.from;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (_data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{
        user: { id: string; email: string; name: string };
        accessToken: string;
        refreshToken: string;
      }>('/auth/login', {
        email: _data.email,
        password: _data.password,
      });

      const { user, accessToken, refreshToken } = response.data;

      setAuth(user, accessToken, refreshToken);
      // 이전 페이지 존재 시 이전 페이지로 리다이렉트
      navigate(from || '/dashboard');
    } catch (err) {
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
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
          <div className="grid gap-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="password"
            >
              비밀번호
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                disabled={isLoading}
                {...register('password')}
              />
            </label>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            로그인
          </Button>
        </div>
      </form>
    </div>
  );
}
