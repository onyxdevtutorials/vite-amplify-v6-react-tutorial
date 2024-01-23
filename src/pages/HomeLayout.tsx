import { Outlet } from "react-router-dom";
import { Banner } from "../components";
import Container from "react-bootstrap/Container";

const HomeLayout = () => {
  return (
    <>
      <Banner />
      <main className="mt-3">
        <Container fluid>
          <Outlet />
        </Container>
      </main>
    </>
  );
};

export default HomeLayout;
