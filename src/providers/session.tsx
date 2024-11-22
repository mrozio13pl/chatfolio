'use client';

import React, { createContext, useContext } from 'react';
import type { User, Session } from 'lucia';

export type SessionProviderProps =
    | {
          user?: null;
          session?: null;
          status: 'unauthorized';
      }
    | {
          user: User;
          session: Session;
          status: 'authorized';
      };

const SessionContext = createContext<SessionProviderProps>({
    user: null,
    session: null,
    status: 'unauthorized',
});

export const SessionProvider = ({
    children,
    value,
}: {
    children: React.ReactNode;
    value: SessionProviderProps;
}) => {
    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const sessionContext = useContext(SessionContext);

    if (!sessionContext) {
        throw new Error('useSession must be used within SessionProvider');
    }

    return sessionContext;
};
