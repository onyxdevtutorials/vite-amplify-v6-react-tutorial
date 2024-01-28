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
  ReviewDetail,
  UserProfile,
  EditUserProfile,
  NotAuthorized,
} from "./pages";
import "@aws-amplify/ui-react/styles.css";
import { AuthContextProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProtectedRoute } from "./components";

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
          <ProtectedRoute role="admin">
            <AddProduct />
          </ProtectedRoute>
        ),
      },
      {
        path: "products/:productId",
        element: <ProductDetail />,
      },
      {
        path: "products/:productId/edit",
        element: (
          <ProtectedRoute role="admin">
            <EditProduct />
          </ProtectedRoute>
        ),
      },
      {
        path: "products/:productId/reviews/new",
        element: (
          <ProtectedRoute role="user">
            <AddReview />
          </ProtectedRoute>
        ),
      },
      {
        path: "reviews/:reviewId",
        element: <ReviewDetail />,
      },
      {
        path: "reviews/:reviewId/edit",
        element: (
          <ProtectedRoute role="user">
            <EditReview />
          </ProtectedRoute>
        ),
      },
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
        element: (
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        ),
      },
      {
        path: "signupconfirm/:username?",
        element: <SignUpConfirm />,
      },
      {
        path: "users/:userId",
        element: <UserProfile />,
      },
      {
        path: "users/:userId/edit",
        element: (
          <ProtectedRoute>
            <EditUserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/not-authorized",
        element: <NotAuthorized />,
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
