"use client";

import { useCallback, useReducer } from "react";

// Types
export interface InputState {
  value: string | File | undefined;
  isValid: boolean;
  touched: boolean;
}

export interface FormState {
  inputs: Record<string, InputState>;
  isValid: boolean;
}

export interface FormAction {
  type: "INPUT_CHANGE" | "SET_DATA" | "SET_TOUCHED";
  inputId?: string;
  value?: string | File | undefined;
  isValid?: boolean;
  touched?: boolean;
  inputs?: Record<string, InputState>;
  formIsValid?: boolean;
}

// Reducer
const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "INPUT_CHANGE": {
      const { inputId, value, isValid } = action;
      if (!inputId || isValid === undefined) {
        return state;
      }
      let formIsValid = true;
      for (const key in state.inputs) {
        const inputState = state.inputs[key];
        if (!inputState) continue;
        if (key === inputId) {
          formIsValid = formIsValid && isValid;
        } else {
          formIsValid = formIsValid && inputState.isValid;
        }
      }
      return {
        ...state,
        inputs: {
          ...state.inputs,
          [inputId]: {
            value: value,
            isValid,
            touched: true,
          },
        },
        isValid: formIsValid,
      };
    }
    case "SET_TOUCHED": {
      const { inputId } = action;
      if (!inputId) return state;
      const prev = state.inputs[inputId];
      if (!prev) return state;
      return {
        ...state,
        inputs: {
          ...state.inputs,
          [inputId]: {
            ...prev,
            touched: true,
          },
        },
      };
    }
    case "SET_DATA": {
      const { inputs, formIsValid } = action;
      if (!inputs || formIsValid === undefined) {
        return state;
      }
      return {
        inputs,
        isValid: formIsValid,
      };
    }
    default:
      return state;
  }
};

// Custom hook
export const useForm = (
  initialInputs: Record<string, InputState>,
  initialFormValidity: boolean
): [
  FormState,
  (id: string, value: string | File | undefined, isValid: boolean) => void,
  (inputData: Record<string, InputState>, formValidity: boolean) => void,
  (id: string) => void
] => {
  const [formState, dispatch] = useReducer(formReducer, {
    inputs: initialInputs,
    isValid: initialFormValidity,
  });

  const inputHandler = useCallback(
    (id: string, value: string | File | undefined, isValid: boolean) => {
      dispatch({
        type: "INPUT_CHANGE",
        inputId: id,
        value,
        isValid,
      });
    },
    []
  );

  const setFormData = useCallback(
    (inputData: Record<string, InputState>, formValidity: boolean) => {
      dispatch({
        type: "SET_DATA",
        inputs: inputData,
        formIsValid: formValidity,
      });
    },
    []
  );

  const setTouched = useCallback((id: string) => {
    dispatch({
      type: "SET_TOUCHED",
      inputId: id,
    });
  }, []);

  return [formState, inputHandler, setFormData, setTouched];
};
