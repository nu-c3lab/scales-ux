import React, { ChangeEvent, FunctionComponent } from "react";
import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import Copyright from "components/Copyright";
import { UserSignInFields, UserSignInValidationSchema } from "../SignInPage";
import { Container, Form, Button, Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBalanceScale } from "@fortawesome/free-solid-svg-icons";
import { useNotify } from "components/Notifications";
import config from "config";

interface UserSignUpFields extends UserSignInFields {
  firstName: string;
  lastName: string;
  usage: string;
  tos: boolean;
}

export const UserSignUpValidationSchema = UserSignInValidationSchema.concat(
  yup.object({
    firstName: yup.string().required("First Name is required"),
    lastName: yup.string().required("Last Name is required"),
    usage: yup
      .string()
      .max(255, "Must be maximum 255 characters.")
      .required("Usage Field is required"),
    password: yup
      .string()
      .required()
      .matches(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
        "Password must contain at least 8 characters, one uppercase, one number and one special case character"
      ),
    tos: yup
      .boolean()
      .required("The terms and conditions must be accepted.")
      .oneOf([true], "The terms and conditions must be accepted."),
  })
);

const SignUpPage: FunctionComponent = () => {
  const history = useHistory();
  const { notify } = useNotify();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      usage: "",
      tos: false,
    },
    validationSchema: UserSignUpValidationSchema,
    onSubmit: (values: UserSignUpFields, { setErrors }) => {
      fetch(`${config.SERVER_API_URL}/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
        .then((response) => response.json())
        .then((response) => {
          try {
            switch (response.code) {
              case 200: {
                notify(response.message, "success");
                history.push("/sign-in");
                break;
              }
              default: {
                if (response.errors) {
                  setErrors(response.errors);
                }
                notify(response.message, "error");
                break;
              }
            }
          } catch (error) {
            console.log(error);
          }
        });
    },
  });

  return (
    <Container className="h-100">
      <Row className="h-100 justify-content-center align-items-center text-center">
        <Col md="5">
          <Form noValidate onSubmit={formik.handleSubmit}>
            <FontAwesomeIcon icon={faBalanceScale} size="3x" className="mb-4" />
            <h1 className="h3 mb-3 fw-normal">Please sign in</h1>

            <Row className="mb-3">
              <Col>
                <div className="form-floating">
                  <Form.Control
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    isInvalid={
                      formik.touched.firstName &&
                      Boolean(formik.errors?.firstName)
                    }
                  />
                  <Form.Label>First Name</Form.Label>
                </div>
              </Col>
              <Col>
                <div className="form-floating">
                  <Form.Control
                    type="text"
                    name="lastName"
                    placeholder="First Name"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    isInvalid={
                      formik.touched.lastName &&
                      Boolean(formik.errors?.lastName)
                    }
                  />
                  <Form.Label>Last Name</Form.Label>
                </div>
              </Col>
            </Row>

            <div className="form-floating mb-3">
              <Form.Control
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                isInvalid={
                  formik.touched.email && Boolean(formik.errors?.email)
                }
              />
              <Form.Label>Email address</Form.Label>
            </div>
            <div className="form-floating mb-3">
              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
                value={formik.values.password}
                onChange={formik.handleChange}
                isInvalid={
                  formik.touched.password && Boolean(formik.errors?.password)
                }
              />
              <Form.Label>Password</Form.Label>
            </div>
            <div className="form-floating mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                name="usage"
                placeholder="Account Usage"
                value={formik.values.usage}
                onChange={formik.handleChange}
                style={{ height: "100px" }}
                isInvalid={
                  formik.touched.usage && Boolean(formik.errors?.usage)
                }
              />
              <Form.Label>Account Usage</Form.Label>
            </div>
            <Form.Group className="mb-4">
              <Form.Check
                type="switch"
                label="I agree with the TOS."
                className="text-start"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  formik.setFieldValue("tos", event.target.checked)
                }
              />
              {formik.touched.tos && formik.errors.tos && (
                <Form.Text className="text-danger float-start mb-3">
                  {formik.errors.tos}
                </Form.Text>
              )}
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100 mb-3 text-white"
              size="lg"
            >
              Sign in
            </Button>
            <Row className="mb-5">
              <Col className="text-end">
                <a href="/sign-in" className="small">
                  Already have an account? Sign in
                </a>
              </Col>
            </Row>
            <Copyright />
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default SignUpPage;
