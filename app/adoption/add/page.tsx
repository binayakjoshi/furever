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
};
export default PostAdoption;
