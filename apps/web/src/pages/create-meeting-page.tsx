import { Button, FieldError, Input, Label, TextField } from '@heroui/react';
import { useCreateMeetingViewModel } from '@meet/meetings';
import { buttonVariants } from '@meet/ui';
import { ArrowLeft, CalendarClock, Timer, PenLine, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { usePageTitle } from '../components/app-shell';

export function CreateMeetingPage() {
  const navigate = useNavigate();
  const viewModel = useCreateMeetingViewModel({
    onCreated: (meetingId) => {
      navigate(`/meetings/${meetingId}`);
    },
  });
  usePageTitle(viewModel.screenTitle);

  return (
    <form
      className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        viewModel.handleSubmit();
      }}
    >
      <TextField
        value={viewModel.title}
        onChange={viewModel.handleChangeTitle}
        isInvalid={Boolean(viewModel.titleError)}
      >
        <Label className="inline-flex items-center gap-2">
          <PenLine className="size-4" aria-hidden />
          {viewModel.nameLabel}
        </Label>
        <Input />
        <FieldError>{viewModel.titleError}</FieldError>
      </TextField>
      <TextField
        value={viewModel.startsAtLocal}
        onChange={viewModel.handleChangeStartsAt}
        isInvalid={Boolean(viewModel.startsAtError)}
      >
        <Label className="inline-flex items-center gap-2">
          <CalendarClock className="size-4" aria-hidden />
          {viewModel.startsAtLabel}
        </Label>
        <Input type="datetime-local" />
        <FieldError>{viewModel.startsAtError}</FieldError>
      </TextField>
      <TextField
        value={viewModel.durationMin}
        onChange={viewModel.handleChangeDuration}
        isInvalid={Boolean(viewModel.durationError)}
      >
        <Label className="inline-flex items-center gap-2">
          <Timer className="size-4" aria-hidden />
          {viewModel.durationLabel}
        </Label>
        <Input inputMode="numeric" />
        <FieldError>{viewModel.durationError}</FieldError>
      </TextField>
      {viewModel.requestErrorMessage ? (
        <p role="alert">{viewModel.requestErrorMessage}</p>
      ) : null}
      <div className="flex gap-2">
        <Button
          type="submit"
          isPending={viewModel.isSubmitting}
          className={buttonVariants({ intent: 'primary' })}
        >
          <Plus className="size-4" aria-hidden />
          {viewModel.submitLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className={buttonVariants({ intent: 'secondary' })}
          onPress={() => {
            navigate('/');
          }}
        >
          <ArrowLeft className="size-4" aria-hidden />
          {viewModel.backLabel}
        </Button>
      </div>
    </form>
  );
}
