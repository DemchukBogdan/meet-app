import { createContext } from 'react';

import type { JoinService } from '@meet/join';

export const JoinServiceContext = createContext<JoinService | null>(null);
