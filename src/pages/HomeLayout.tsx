import { Outlet } from "react-router-dom";
import { Banner } from "../components";

const HomeLayout = () => {
  return (
    <>
      {/* <Banner /> */}
      <Outlet />
    </>
  );
};

export default HomeLayout;
