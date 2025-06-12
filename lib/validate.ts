export type Values = {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

export type Errors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const validate = (values: Values): Errors => {
  const errors: Errors = {};

  if ("name" in values) {
    if (!values.name || values.name.trim() === "") {
      errors.name = "Name is required";
    } else if (values.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
  }
  if ("confirmPassword" in values) {
    if (!values.name || values.name.trim() == "") {
      errors.confirmPassword = "please enter the password again";
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = "password doesn't match";
    }
  }
  if (!values.email) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(values.email)) {
    errors.email = "Email is invalid";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
};
