# CollabBoard 기술 스택 명세서
## Frontend
### Core

- React 18.3+: Concurrent Features 활용 (useTransition, useDeferredValue)
- TypeScript 5.3+: 엄격한 타입 체크
- Vite 5+: 빠른 빌드 및 개발 서버

### 상태 관리

- Zustand 4+: 경량 상태 관리

선택 이유: 보일러플레이트 적음, DevTools 지원, 미들웨어 확장 가능
- Redux 대비 번들 크기 90% 작음


- Immer: 불변성 관리 (Zustand 미들웨어)
- TanStack Query v5: 서버 상태 관리, 낙관적 업데이트

### UI/UX

- @dnd-kit: Drag & Drop (React 18 호환, 접근성 내장)

- react-beautiful-dnd 대비 성능 우수, 유지보수 활발


- Tailwind CSS 3+: 유틸리티 CSS
- Headless UI / Radix UI: 접근성 보장된 기본 컴포넌트
- Framer Motion: 애니메이션 (카드 이동, 모달 등)

### 실시간 통신

- Socket.io Client 4+: WebSocket

- 선택 이유: 자동 재연결, 폴백 지원, Room 관리 용이



### 테스트

- Vitest: 유닛 테스트 (Vite 네이티브 통합)
- Testing Library: 컴포넌트 테스트
- Playwright: E2E 테스트
- MSW (Mock Service Worker): API 모킹

### 개발 도구

- Storybook 8: 컴포넌트 문서화
- ESLint + Prettier: 코드 품질
- Husky + lint-staged: Pre-commit 검증

### Backend

- Runtime & Framework

- Node.js 20+: LTS 버전
- Fastify 4+: 고성능 웹 프레임워크

- Express 대비 2-3배 빠른 처리 속도
- TypeScript 지원 우수



### 데이터베이스

- PostgreSQL 16: 메인 DB

- JSON 타입 지원 (카드 메타데이터)
- Row Level Security (멀티 테넌시)


- Redis 7: 세션, 실시간 상태 캐싱

- Socket.io Adapter로 사용 (수평 확장 대비)



- ORM/쿼리 빌더

- Prisma 5: Type-safe ORM

- 마이그레이션 관리 용이
- 자동 타입 생성



### 실시간

- Socket.io Server 4+: WebSocket 서버

- Redis Adapter: 다중 서버 대응 준비



### 인증

- Passport.js: 인증 전략
- JWT: 토큰 기반 인증
- bcrypt: 비밀번호 해싱

### 배포 & 인프라

- Vercel: 프론트엔드 배포 (무료)
- Railway / Render: 백엔드 배포 (무료 티어)

- PostgreSQL 포함

- Upstash Redis: 서버리스 Redis (무료 티어)

### 모니터링

- Sentry: 에러 트래킹
- Vercel Analytics: 프론트엔드 성능
- Pino: 구조화된 로깅

## 개발 환경
### 패키지 매니저

- pnpm 8+: 디스크 효율, 빠른 설치

### 버전 관리

- Git + GitHub: 소스 관리
- Conventional Commits: 커밋 메시지 규칙
- GitHub Actions: CI/CD

### API 문서

- Swagger / OpenAPI: REST API 문서화

## 선택 이유 요약

### 성능 중심

- Vite (빌드 속도)
- Fastify (서버 응답 속도)
- @dnd-kit (DnD 성능)
- TanStack Query (캐싱 최적화)

### 개발 경험

- TypeScript (타입 안정성)
- Prisma (DB 타입 안정성)
- Zustand (간결한 상태 관리)
- Vitest (빠른 테스트 실행)

### 확장성 고려

- Socket.io + Redis (수평 확장 가능)
- Prisma (마이그레이션 관리)
- 모노레포 구조 준비 가능

