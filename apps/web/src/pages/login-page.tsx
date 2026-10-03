import { Button, FieldError, Input, Label, TextField } from '@heroui/react';
import { buttonVariants } from '@meet/ui';
import { Lock, LogIn, Phone } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';

import { usePageTitle } from '../components/app-shell';
import { useAuthSession } from '../features/auth/auth-session-context';
import { useLoginViewModel } from '../features/auth/hooks/use-login-view-model';

function readReturnPath(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('from' in state)) {
    return '/';
  }

  const from: unknown = state.from;
  if (typeof from !== 'object' || from === null || !('pathname' in from)) {
    return '/';
  }

  const { pathname } = from;
  if (typeof pathname !== 'string') {
    return '/';
  }

  if (
    pathname === '/login' ||
    !pathname.startsWith('/') ||
    pathname.startsWith('//')
  ) {
    return '/';
  }

  const search =
    'search' in from && typeof from.search === 'string' ? from.search : '';
  const hash = 'hash' in from && typeof from.hash === 'string' ? from.hash : '';

  return `${pathname}${search}${hash}`;
}

export function LoginPage() {
  const location = useLocation();
  const { isAuthenticated } = useAuthSession();
  const viewModel = useLoginViewModel();
  usePageTitle(viewModel.title);

  if (isAuthenticated) {
    return <Navigate to={readReturnPath(location.state)} replace />;
  }

  return (
    <form
      className="flex max-w-md flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        viewModel.handleSubmit();
      }}
    >
      <TextField
        value={viewModel.phone}
        onChange={viewModel.handleChangePhone}
        isInvalid={Boolean(viewModel.phoneError)}
      >
        <Label className="inline-flex items-center gap-2">
          <Phone className="size-4" aria-hidden />
          {viewModel.phoneLabel}
        </Label>
        <Input type="tel" autoComplete="username" />
        <FieldError>{viewModel.phoneError}</FieldError>
      </TextField>
      <TextField
        value={viewModel.password}
        onChange={viewModel.handleChangePassword}
        isInvalid={Boolean(viewModel.passwordError)}
      >
        <Label className="inline-flex items-center gap-2">
          <Lock className="size-4" aria-hidden />
          {viewModel.passwordLabel}
        </Label>
        <Input type="password" autoComplete="current-password" />
        <FieldError>{viewModel.passwordError}</FieldError>
      </TextField>
      <p className="text-sm text-stone-500">{viewModel.hint}</p>
      <Button
        type="submit"
        isPending={viewModel.isSubmitting}
        className={buttonVariants({ intent: 'primary' })}
      >
        <LogIn className="size-4" aria-hidden />
        {viewModel.submitLabel}
      </Button>
    </form>
  );
}
