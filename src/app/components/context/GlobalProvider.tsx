import type { PropsWithChildren, Dispatch } from 'react';
import { useContext, useReducer, createContext } from 'react';

interface GlobalState {
  locale: 'en' | 'de';
  currency: string;
  cartOpen: boolean;
}

type GlobalAction =
  | { type: 'setCurrency'; payload: string }
  | { type: 'setLocale'; payload: 'en' | 'de' }
  | { type: 'setCartOpen'; payload: boolean };

const initialState: GlobalState = {
  locale: 'en',
  currency: 'eur',
  cartOpen: false,
};

const GlobalContext = createContext<{
  state: GlobalState;
  dispatch: Dispatch<GlobalAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

const reducer = (state: GlobalState, action: GlobalAction) => {
  switch (action.type) {
    case 'setCurrency':
      return { ...state, currency: action.payload };
    case 'setLocale':
      return { ...state, locale: action.payload };
    case 'setCartOpen':
      return { ...state, cartOpen: action.payload };
    default:
      throw new Error('Unknown action');
  }
};

export const GlobalProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => useContext(GlobalContext);
