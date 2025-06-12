import Footer from "@/Components/Authentication/auth-footer";
import { ReactNode } from "react";
import AuthFooter from "@/Components/Authentication/auth-header";

type AuthenticateLayoutProps = {
  children: ReactNode;
};
const AuthenticateLayout = ({ children }: AuthenticateLayoutProps) => {
  return (
    <div>
      <AuthFooter />
      {children}
      <Footer />
    </div>
  );
};
export default AuthenticateLayout;
