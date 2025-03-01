'use client';

import * as React from 'react';

const TOAST_LIMIT = 10;
const TOAST_REMOVE_DELAY = 1000;

export type ToastProps = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  open?: boolean;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType['ADD_TOAST'];
      toast: ToastProps;
    }
  | {
      type: ActionType['UPDATE_TOAST'];
      toast: Partial<ToastProps>;
      id: string;
    }
  | {
      type: ActionType['DISMISS_TOAST'];
      id: string;
    }
  | {
      type: ActionType['REMOVE_TOAST'];
      id: string;
    };

interface State {
  toasts: ToastProps[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { id } = action;

      if (toastTimeouts.has(id)) {
        clearTimeout(toastTimeouts.get(id));
      }

      toastTimeouts.set(
        id,
        setTimeout(() => {
          dispatch({
            type: actionTypes.REMOVE_TOAST,
            id,
          });
        }, TOAST_REMOVE_DELAY)
      );

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === id ? { ...t, open: false } : t
        ),
      };
    }

    case actionTypes.REMOVE_TOAST:
      if (toastTimeouts.has(action.id)) {
        clearTimeout(toastTimeouts.get(action.id));
        toastTimeouts.delete(action.id);
      }

      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
      };

    default:
      return state;
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    toasts: state.toasts,
    toast: (props: Omit<ToastProps, 'id'>) => {
      const id = genId();

      const update = (props: Partial<ToastProps>) =>
        dispatch({
          type: actionTypes.UPDATE_TOAST,
          id,
          toast: props,
        });

      const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, id });

      dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
          ...props,
          id,
          open: true,
          onOpenChange: (open: boolean) => {
            if (!open) dismiss();
          },
        },
      });

      return {
        id,
        dismiss,
        update,
      };
    },
    dismiss: (id: string) => dispatch({ type: actionTypes.DISMISS_TOAST, id }),
    update: (id: string, props: Partial<ToastProps>) =>
      dispatch({
        type: actionTypes.UPDATE_TOAST,
        id,
        toast: props,
      }),
  };
}
