import { Outlet } from "react-router-dom";
import { Banner } from "../components";

const HomeLayout = () => {
  return (
    <>
      <Banner />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default HomeLayout;
