import React, { FunctionComponent } from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminDashboardPage from "./components/Admin/DashboardPage";
import AdminUsersPage from "./components/Admin/UsersPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ProfilePage from "./pages/ProfilePage";
import NotebooksPage from "./pages/NotebooksPage";
import NotebookPage from "./pages/NotebookPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Notifications from "./components/Notifications";

const App: FunctionComponent = () => {
  return (
    <div className="app">
      <Notifications />
      <BrowserRouter>
        <Switch>
          <ProtectedRoute exact path="/" component={HomePage} />
          <ProtectedRoute exact path="/admin" component={AdminDashboardPage} />
          <ProtectedRoute
            exact
            path="/admin/dashboard"
            component={AdminDashboardPage}
          />
          <ProtectedRoute
            exact
            path="/admin/users"
            component={AdminUsersPage}
          />
          <ProtectedRoute exact path="/profile" component={ProfilePage} />
          <ProtectedRoute exact path="/notebooks" component={NotebooksPage} />
          <ProtectedRoute exact path="/rings" component={NotebooksPage} />
          <ProtectedRoute
            exact
            path="/notebooks/:notebookId"
            component={NotebookPage}
          />
          <Route path="/sign-in" component={SignInPage} />
          <Route path="/sign-up" component={SignUpPage} />
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          <Route path="/reset-password/:token" component={ResetPasswordPage} />
          <Route
            path="/verify-email/:token"
            component={EmailVerificationPage}
          />
          <Route component={() => <Redirect to="/" />} />
        </Switch>
      </BrowserRouter>
    </div>
  );
};

export default App;