import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ClearSkiesNavState = {
  locationId: string | null;
  isLoading: boolean;
};

type ClearSkiesNavContextValue = ClearSkiesNavState & {
  setClearSkiesNav: (state: ClearSkiesNavState) => void;
};

const defaultClearSkiesNavState: ClearSkiesNavState = {
  locationId: null,
  isLoading: false,
};

const ClearSkiesNavContext = createContext<ClearSkiesNavContextValue>({
  ...defaultClearSkiesNavState,
  setClearSkiesNav: () => {},
});

export function ClearSkiesNavProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(defaultClearSkiesNavState);

  const value = useMemo(
    () => ({
      ...state,
      setClearSkiesNav: setState,
    }),
    [state],
  );

  return (
    <ClearSkiesNavContext.Provider value={value}>
      {children}
    </ClearSkiesNavContext.Provider>
  );
}

export function useClearSkiesNav() {
  return useContext(ClearSkiesNavContext);
}
