import { ReactNode } from "react";
import ChatWidget from "@/components/custom-elements/chat-widget";
type ProtectedRouteLayoutProps = {
  children: ReactNode;
};
const ProtectedRouteLayout = ({ children }: ProtectedRouteLayoutProps) => {
  return (
    <div>
      {children}
      <ChatWidget />
    </div>
  );
};
export default ProtectedRouteLayout;
