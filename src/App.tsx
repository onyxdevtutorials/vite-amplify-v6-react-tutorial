import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { HomeLayout, Landing, AddProduct, SignUp } from "./pages";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

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
]);

const App = () => {
  return (
    <React.StrictMode>
      <>
        <h1>Hello</h1>
      </>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
};

export default App;
