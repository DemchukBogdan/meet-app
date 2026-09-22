// react
import { useCallback, useEffect, useState } from 'react';

// api
import { getClientProfile } from '../api/meetAppProfileApi';

// constants
import { PROFILE_LOAD_ERROR } from '../constants';

// errors
import { MeetAppProfileError } from '../errors';

// types
import type { ClientProfileType } from '../types';

type UseClientProfileParamsType = {
  onUnauthorized: VoidFunction;
};

export function useClientProfile({
  onUnauthorized,
}: UseClientProfileParamsType) {
  const [profile, setProfile] = useState<ClientProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextProfile = await getClientProfile();
      setProfile(nextProfile);
    } catch (error) {
      if (
        error instanceof MeetAppProfileError &&
        error.message === 'profile_unauthorized'
      ) {
        onUnauthorized();
        return;
      }

      setErrorMessage(PROFILE_LOAD_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [onUnauthorized]);

  // Load cabinet data once the client session is available.
  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return {
    profile,
    isLoading,
    errorMessage,
    loadProfile,
  };
}
