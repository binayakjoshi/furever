import { ReactNode } from "react";
import AuthHeader from "@/Components/Authentication/auth-header";
import AuthFooter from "@/Components/Authentication/auth-footer";
type AuthenticateLayoutProps = {
  children: ReactNode;
};
const AuthenticateLayout = ({ children }: AuthenticateLayoutProps) => {
  return (
    <div>
      <AuthHeader />
      {children}
      <AuthFooter />
    </div>
  );
};
export default AuthenticateLayout;
