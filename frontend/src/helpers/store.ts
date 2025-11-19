// store.ts
import { createStore } from 'redux';

// Define the state type
interface RootState {
  user: { username: string | null } | null;
}

// Define action types
interface SetUserAction {
  type: 'SET_USER';
  payload: { username: string };
}

interface ClearUserAction {
  type: 'CLEAR_USER';
}

type Action = SetUserAction | ClearUserAction;

// Initial state
const defaultState: RootState = {
  user: null,
};

// Reducer function with proper types
const rootReducer = (state = defaultState, action: Action): RootState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: { username: action.payload.username } };
    case 'CLEAR_USER':
      return { ...state, user: null };
    default:
      return state;
  }
};

// Create the Redux store with the typed reducer
const store = createStore(rootReducer);

export default store;
