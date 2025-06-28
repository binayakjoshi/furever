import { ReactNode } from "react";
import AuthHeader from "@/components/authentication/auth-header";
import AuthFooter from "@/components/authentication/auth-footer";
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
