import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { HomeLayout, Landing, AddProduct, SignUp, SignIn } from "./pages";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Container from "react-bootstrap/Container";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "add",
        element: (
          <Authenticator>
            <AddProduct />
          </Authenticator>
        ),
      },
    ],
  },
  {
    path: "signup",
    element: <SignUp />,
  },
  {
    path: "signin",
    element: <SignIn />,
  },
]);

const App = () => {
  return (
    <React.StrictMode>
      <Container className="p-3">
        <RouterProvider router={router} />
      </Container>
    </React.StrictMode>
  );
};

export default App;
