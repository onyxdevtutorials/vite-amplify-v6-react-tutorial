import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { HomeLayout, Landing, AddProduct } from "./pages";

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
        element: <AddProduct />,
      },
    ],
  },
]);

const App = () => {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
};

export default App;
