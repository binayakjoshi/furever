"use client";

import type React from "react";
import { useReducer, useEffect } from "react";
import { validate, type Validator } from "@/lib/validators";
import styles from "./input.module.css";

interface InputState {
  value: string;
  isTouched: boolean;
  isValid: boolean;
}

interface InputAction {
  type: "CHANGE" | "TOUCH";
  val?: string;
  validators?: Validator[];
}

interface RadioOption {
  value: string;
  label: string;
}

interface CustomInputProps {
  id: string;
  element: "input" | "textarea" | "radio";
  type?: string;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  initialValue?: string;
  initialValid?: boolean;
  validators?: Validator[];
  errorText?: string;
  onInput: (id: string, value: string, isValid: boolean) => void;
  name?: string;
  options?: RadioOption[];
  className?: string;
}

const inputReducer = (state: InputState, action: InputAction): InputState => {
  switch (action.type) {
    case "CHANGE":
      if (action.val === undefined || !action.validators) {
        return state;
      }
      return {
        ...state,
        value: action.val,
        isValid: validate(action.val, action.validators),
      };
    case "TOUCH":
      return {
        ...state,
        isTouched: true,
      };
    default:
      return state;
  }
};

const Input: React.FC<CustomInputProps> = (props) => {
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: props.initialValue || "",
    isTouched: false,
    isValid: props.initialValid || false,
  });

  const { id, onInput } = props;
  const { value, isValid } = inputState;

  useEffect(() => {
    onInput(id, value, isValid);
  }, [id, value, isValid, onInput]);

  const changeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    dispatch({
      type: "CHANGE",
      val: event.target.value,
      validators: props.validators,
    });
  };

  const touchHandler = () => {
    dispatch({ type: "TOUCH" });
  };

  let element: React.ReactNode;

  const baseInputClass = `${styles.inputBase} ${
    !inputState.isValid && inputState.isTouched ? styles.inputError : ""
  }`;

  const baseTextareaClass = `${styles.inputBase} ${
    !inputState.isValid && inputState.isTouched ? styles.inputError : ""
  }`;

  if (props.element === "input") {
    element = (
      <input
        id={props.id}
        type={props.type || "text"}
        readOnly={props.readOnly}
        placeholder={props.placeholder}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value}
        className={baseInputClass}
      />
    );
  } else if (props.element === "textarea") {
    element = (
      <textarea
        id={props.id}
        rows={props.rows || 3}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value}
        readOnly={props.readOnly}
        placeholder={props.placeholder}
        className={baseTextareaClass}
      />
    );
  } else if (props.element === "radio" && props.options) {
    element = (
      <div id={props.id} className={styles.radioGroup} onBlur={touchHandler}>
        {props.options.map((option, index) => (
          <div key={option.value} className={styles.radioItem}>
            <input
              id={`${props.id}-${index}`}
              type="radio"
              name={props.name}
              value={option.value}
              checked={inputState.value === option.value}
              onChange={changeHandler}
            />
            <label htmlFor={`${props.id}-${index}`}>{option.label}</label>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${props.className || ""}`}>
      {props.label && (
        <label htmlFor={props.id} className={styles.label}>
          {props.label}
        </label>
      )}
      {element}
      {!inputState.isValid && inputState.isTouched && props.errorText && (
        <p className={styles.errorText}>{props.errorText}</p>
      )}
    </div>
  );
};

export default Input;
