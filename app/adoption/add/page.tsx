"use client";
import { useForm } from "@/lib/use-form";

const PostAdoption = () => {
  const [formState, inputHandler] = useForm(
    {
      name: {
        isValid: false,
        touched: false,
        value: "",
      },
    },
    false
  );
  return <h2>create adoption post</h2>;
};
export default PostAdoption;
