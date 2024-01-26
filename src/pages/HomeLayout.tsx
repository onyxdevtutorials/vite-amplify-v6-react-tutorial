import { Outlet } from "react-router-dom";
import { Banner } from "../components";
import Container from "react-bootstrap/Container";
import "./HomeLayout.css";

const HomeLayout = () => {
  return (
    <>
      <Banner />
      <main className="main-content">
        <Container fluid>
          <Outlet />
        </Container>
      </main>
    </>
  );
};

export default HomeLayout;
