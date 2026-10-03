import type { Meeting, MeetingFilter } from '@meet/schemas';

export type JoinFailureKindType = 'failed' | 'permissionDenied';

export type JoinMeetingType = (meetingId: string) => Promise<void>;

export type ResolveJoinFailureType = (error: unknown) => JoinFailureKindType;

export type MeetingsListFilterItemType = {
  id: MeetingFilter;
  label: string;
  isActive: boolean;
};

export type UseMeetingDetailsViewModelParamsType = {
  meetingId: string;
  joinMeeting: JoinMeetingType | null;
  resolveJoinFailure?: ResolveJoinFailureType;
};

export type UseCreateMeetingViewModelParamsType = {
  onCreated: (meetingId: string) => void;
};

export type MeetingsListViewModelType = {
  title: string;
  createLabel: string;
  loadingLabel: string;
  errorLabel: string;
  emptyLabel: string;
  retryLabel: string;
  meetings: Meeting[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  filters: MeetingsListFilterItemType[];
  showPagination: boolean;
  isPreviousDisabled: boolean;
  isNextDisabled: boolean;
  previousPageLabel: string;
  nextPageLabel: string;
  paginationLabel: string;
  oppositeLanguageLabel: string;
  handleSelectFilter: (filter: MeetingFilter) => void;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handleRetry: () => void;
  handleToggleLanguage: () => void;
};

export type MeetingDetailsViewModelType = {
  meeting: Meeting | null;
  isLoading: boolean;
  isError: boolean;
  title: string;
  startsAtLabel: string;
  durationLabel: string;
  participantsLabel: string;
  rsvpStatusLabel: string;
  acceptLabel: string;
  declineLabel: string;
  joinLabel: string;
  backLabel: string;
  loadingLabel: string;
  errorLabel: string;
  notFoundLabel: string;
  retryLabel: string;
  isAcceptDisabled: boolean;
  isDeclineDisabled: boolean;
  isJoining: boolean;
  isJoinDisabled: boolean;
  rsvpErrorMessage: string | null;
  joinErrorMessage: string | null;
  handleAccept: () => void;
  handleDecline: () => void;
  handleJoin: () => void;
  handleRetry: () => void;
};

export type CreateMeetingViewModelType = {
  screenTitle: string;
  nameLabel: string;
  startsAtLabel: string;
  durationLabel: string;
  submitLabel: string;
  backLabel: string;
  title: string;
  startsAtLocal: string;
  durationMin: string;
  isSubmitting: boolean;
  titleError: string | undefined;
  startsAtError: string | undefined;
  durationError: string | undefined;
  requestErrorMessage: string | null;
  handleChangeTitle: (value: string) => void;
  handleChangeStartsAt: (value: string) => void;
  handleChangeDuration: (value: string) => void;
  handleSubmit: () => void;
};
