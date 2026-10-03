import { RtkJoinGateway, useMeetDispatch } from '@meet/api';
import { ZoomNativeJoin } from '@meet/join';
import { useMemo, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ZoomJoinHost } from '../components/ZoomJoinHost';
import { JoinServiceContext } from '../join/join-service-context';
import { PermittedZoomSession } from '../join/permitted-zoom-session';
import { ZoomSessionBridge } from '../join/zoom-session-bridge';
import { CreateMeetingScreen } from './CreateMeetingScreen';
import { MeetingDetailsScreen } from './MeetingDetailsScreen';
import { MeetingsScreen } from './MeetingsScreen';

import type { ReactNode } from 'react';

type MeetingsRoute =
  | { name: 'list' }
  | { name: 'create' }
  | { name: 'details'; meetingId: string };

type MeetingsRouteAction =
  | { type: 'open-create' }
  | { type: 'open-details'; meetingId: string }
  | { type: 'back' };

function meetingsRouteReducer(
  _state: MeetingsRoute,
  action: MeetingsRouteAction,
): MeetingsRoute {
  switch (action.type) {
    case 'open-create':
      return { name: 'create' };
    case 'open-details':
      return { name: 'details', meetingId: action.meetingId };
    case 'back':
      return { name: 'list' };
  }
}

export function MeetingsRoot() {
  const dispatch = useMeetDispatch();
  const { t } = useTranslation();
  const bridge = useRef(new ZoomSessionBridge()).current;
  const userName = t('common.userName');
  const [route, routeDispatch] = useReducer(meetingsRouteReducer, {
    name: 'list',
  });
  const service = useMemo(
    () =>
      new ZoomNativeJoin(
        new RtkJoinGateway(dispatch),
        new PermittedZoomSession(bridge),
        userName,
      ),
    [bridge, dispatch, userName],
  );

  return (
    <JoinServiceContext.Provider value={service}>
      <ZoomJoinHost bridge={bridge}>
        <MeetingsRouteView
          route={route}
          onBack={() => {
            routeDispatch({ type: 'back' });
          }}
          onCreate={() => {
            routeDispatch({ type: 'open-create' });
          }}
          onOpen={(meetingId) => {
            routeDispatch({ type: 'open-details', meetingId });
          }}
        />
      </ZoomJoinHost>
    </JoinServiceContext.Provider>
  );
}

type MeetingsRouteViewProps = {
  route: MeetingsRoute;
  onBack: () => void;
  onCreate: () => void;
  onOpen: (meetingId: string) => void;
};

function MeetingsRouteView({
  route,
  onBack,
  onCreate,
  onOpen,
}: MeetingsRouteViewProps): ReactNode {
  switch (route.name) {
    case 'create':
      return <CreateMeetingScreen onBack={onBack} onCreated={onOpen} />;
    case 'details':
      return (
        <MeetingDetailsScreen meetingId={route.meetingId} onBack={onBack} />
      );
    case 'list':
      return <MeetingsScreen onCreate={onCreate} onOpen={onOpen} />;
  }
}
