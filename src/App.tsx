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
        element: (
          <Authenticator>
            <ProductDetail />
          </Authenticator>
        ),
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
        path: "reviews/new",
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
        <Container className="p-3">
          <RouterProvider router={router} />
        </Container>
      </AuthContextProvider>
    </React.StrictMode>
  );
};

export default App;
