"use client";
import { useReducer, ChangeEvent, FormEvent } from "react";
import { validate, Errors, Values } from "@/lib/validate";

type State<T> = {
  values: T;
  errors: Errors;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
};

type Action<T> =
  | { type: "SET_FIELD"; field: keyof T; value: string }
  | { type: "SET_ERRORS"; errors: Errors }
  | { type: "SET_TOUCHED"; field: keyof T }
  | { type: "SUBMIT" }
  | { type: "RESET"; initialValues: T };

function formReducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors, isSubmitting: false };
    case "SET_TOUCHED":
      return {
        ...state,
        touched: { ...state.touched, [action.field]: true },
      };
    case "SUBMIT":
      return { ...state, isSubmitting: true };
    case "RESET":
      return {
        values: action.initialValues,
        errors: {},
        touched: {},
        isSubmitting: false,
      };
    default:
      return state;
  }
}

export function useForm<T extends Values>(
  initialValues: T,
  onSubmit: (values: T) => void
) {
  const [state, dispatch] = useReducer(formReducer<T>, {
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
  } as State<T>);

  const runValidation = (values: T) => {
    const errors = validate(values);
    dispatch({ type: "SET_ERRORS", errors });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = name as keyof T;

    dispatch({ type: "SET_FIELD", field, value });

    if (!state.touched[field]) {
      dispatch({ type: "SET_TOUCHED", field });
    }

    runValidation({ ...state.values, [field]: value });
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name as keyof T;

    if (!state.touched[field]) {
      dispatch({ type: "SET_TOUCHED", field });
      runValidation(state.values);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SUBMIT" });
    const errors = validate(state.values);
    dispatch({ type: "SET_ERRORS", errors });

    if (Object.keys(errors).length === 0) {
      onSubmit(state.values);
    }
  };

  const reset = () => dispatch({ type: "RESET", initialValues });

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  };
}
