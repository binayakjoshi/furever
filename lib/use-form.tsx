"use client";

import { useCallback, useReducer } from "react";

export interface InputState {
  value: string | File | undefined;
  isValid: boolean;
  touched: boolean;
}

export interface VaccinationRecord {
  id: string;
  name: string;
  VaccDate: string;
  nextVaccDate: string;
}

export interface FormState {
  inputs: Record<string, InputState>;
  vaccinations: VaccinationRecord[];
  isValid: boolean;
}

export interface FormAction {
  type:
    | "INPUT_CHANGE"
    | "SET_DATA"
    | "SET_TOUCHED"
    | "ADD_VACCINATION"
    | "REMOVE_VACCINATION"
    | "UPDATE_VACCINATION";
  inputId?: string;
  value?: string | File | undefined;
  isValid?: boolean;
  touched?: boolean;
  inputs?: Record<string, InputState>;
  formIsValid?: boolean;
  vaccination?: VaccinationRecord;
  vaccinationId?: string;
  vaccinationField?: keyof Omit<VaccinationRecord, "id">;
  vaccinationValue?: string;
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

      // Check if vaccinations are valid (at least one vaccination with all fields filled)
      const hasValidVaccination =
        state.vaccinations.length > 0 &&
        state.vaccinations.every(
          (vacc) => vacc.name.trim() && vacc.VaccDate && vacc.nextVaccDate
        );

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
        isValid: formIsValid && hasValidVaccination,
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
        ...state,
        inputs,
        isValid: formIsValid,
      };
    }
    case "ADD_VACCINATION": {
      const newVaccination: VaccinationRecord = {
        id: Date.now().toString(),
        name: "",
        VaccDate: "",
        nextVaccDate: "",
      };
      return {
        ...state,
        vaccinations: [...state.vaccinations, newVaccination],
      };
    }
    case "REMOVE_VACCINATION": {
      const { vaccinationId } = action;
      if (!vaccinationId) return state;
      const updatedVaccinations = state.vaccinations.filter(
        (vacc) => vacc.id !== vaccinationId
      );

      // Recalculate form validity
      let formIsValid = true;
      for (const key in state.inputs) {
        const inputState = state.inputs[key];
        if (inputState) {
          formIsValid = formIsValid && inputState.isValid;
        }
      }
      const hasValidVaccination =
        updatedVaccinations.length > 0 &&
        updatedVaccinations.every(
          (vacc) => vacc.name.trim() && vacc.VaccDate && vacc.nextVaccDate
        );

      return {
        ...state,
        vaccinations: updatedVaccinations,
        isValid: formIsValid && hasValidVaccination,
      };
    }
    case "UPDATE_VACCINATION": {
      const { vaccinationId, vaccinationField, vaccinationValue } = action;
      if (!vaccinationId || !vaccinationField || vaccinationValue === undefined)
        return state;

      const updatedVaccinations = state.vaccinations.map((vacc) =>
        vacc.id === vaccinationId
          ? { ...vacc, [vaccinationField]: vaccinationValue }
          : vacc
      );

      // Recalculate form validity
      let formIsValid = true;
      for (const key in state.inputs) {
        const inputState = state.inputs[key];
        if (inputState) {
          formIsValid = formIsValid && inputState.isValid;
        }
      }
      const hasValidVaccination =
        updatedVaccinations.length > 0 &&
        updatedVaccinations.every(
          (vacc) => vacc.name.trim() && vacc.VaccDate && vacc.nextVaccDate
        );

      return {
        ...state,
        vaccinations: updatedVaccinations,
        isValid: formIsValid && hasValidVaccination,
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
  (id: string) => void,
  () => void,
  (id: string) => void,
  (
    id: string,
    field: keyof Omit<VaccinationRecord, "id">,
    value: string
  ) => void
] => {
  const [formState, dispatch] = useReducer(formReducer, {
    inputs: initialInputs,
    vaccinations: [],
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

  const addVaccination = useCallback(() => {
    dispatch({ type: "ADD_VACCINATION" });
  }, []);

  const removeVaccination = useCallback((id: string) => {
    dispatch({
      type: "REMOVE_VACCINATION",
      vaccinationId: id,
    });
  }, []);

  const updateVaccination = useCallback(
    (id: string, field: keyof Omit<VaccinationRecord, "id">, value: string) => {
      dispatch({
        type: "UPDATE_VACCINATION",
        vaccinationId: id,
        vaccinationField: field,
        vaccinationValue: value,
      });
    },
    []
  );

  return [
    formState,
    inputHandler,
    setFormData,
    setTouched,
    addVaccination,
    removeVaccination,
    updateVaccination,
  ];
};
