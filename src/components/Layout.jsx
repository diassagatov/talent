import Navigation from "./Navigation";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex h-full w-full flex-col ">
      <Navigation />
      <div className="w-full box-border grow overflow-y-hidden pt-[60px]">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
