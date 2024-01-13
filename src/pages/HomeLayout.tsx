import { Outlet } from "react-router-dom";
import { Banner } from "../components";

const HomeLayout = () => {
  console.log("HomeLayout");
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
