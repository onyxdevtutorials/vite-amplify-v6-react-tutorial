import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  HomeLayout,
  Landing,
  AddProduct,
  AddReview,
  EditProduct,
  EditReview,
  SignUp,
  SignUpConfirm,
  SignIn,
  SignInConfirm,
  ChangePassword,
  ProductDetail,
  ProductDelete,
  ReviewDetail,
  DeleteReview,
} from "./pages";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Container from "react-bootstrap/Container";
import { AuthContextProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
        path: "products/new",
        element: (
          <Authenticator>
            <AddProduct />
          </Authenticator>
        ),
      },
      {
        path: "products/:productId",
        element: <ProductDetail />,
      },
      {
        path: "products/:productId/edit",
        element: (
          <Authenticator>
            <EditProduct />
          </Authenticator>
        ),
      },
      {
        path: "products/:productId/delete",
        element: (
          <Authenticator>
            <ProductDelete />
          </Authenticator>
        ),
      },
      {
        path: "products/:productId/reviews/new",
        element: (
          <Authenticator>
            <AddReview />
          </Authenticator>
        ),
      },
      {
        path: "reviews/:reviewId",
        element: (
          <Authenticator>
            <ReviewDetail />
          </Authenticator>
        ),
      },
      {
        path: "reviews/:reviewId/edit",
        element: (
          <Authenticator>
            <EditReview />
          </Authenticator>
        ),
      },
      {
        path: "reviews/:reviewId/delete",
        element: (
          <Authenticator>
            <DeleteReview />
          </Authenticator>
        ),
      },
      // {
      //   path: "edit/:id",
      //   element: (
      //     <Authenticator>
      //       <EditProduct />
      //     </Authenticator>
      //   ),
      // },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "signin",
        element: <SignIn />,
      },
      {
        path: "signinconfirm",
        element: <SignInConfirm />,
      },
      {
        path: "changepassword",
        element: <ChangePassword />,
      },
      {
        path: "signupconfirm/:username?",
        element: <SignUpConfirm />,
      },
    ],
  },
]);

const App = () => {
  return (
    <React.StrictMode>
      <AuthContextProvider>
        <>
          <RouterProvider router={router} />
          <ToastContainer />
        </>
      </AuthContextProvider>
    </React.StrictMode>
  );
};

export default App;
