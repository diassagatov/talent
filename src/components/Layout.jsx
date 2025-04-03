import Navigation from "./Navigation";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex h-full w-full flex-col ">
      <Navigation />
      <Outlet />
    </div>
  );
};

export default Layout;
