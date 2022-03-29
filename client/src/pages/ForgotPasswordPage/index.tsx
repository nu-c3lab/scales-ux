import React, { FunctionComponent } from "react";
import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";

import Copyright from "../../components/Copyright";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBalanceScale } from "@fortawesome/free-solid-svg-icons";
import { useNotify } from "components/Notifications";
import config from "config";

interface ForgotPasswordFields {
  email: string;
}

const ForgotPasswordValidationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
});

const ForgotPassword: FunctionComponent = () => {
  const history = useHistory();
  const { notify } = useNotify();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: ForgotPasswordValidationSchema,
    onSubmit: (values: ForgotPasswordFields, { setErrors }) => {
      fetch(
        `${config.SERVER_API_URL}/users/password/forgot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      )
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
        <Col md="4">
          <Form noValidate onSubmit={formik.handleSubmit}>
            <FontAwesomeIcon
              icon={faBalanceScale}
              size="3x"
              className="mb-4"
            />
            <h1 className="h3 mb-5 fw-normal">Forgot Password?</h1>
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

            <Button
              variant="primary"
              type="submit"
              className="w-100 mb-3 text-white "
              size="lg"
            >
              Submit
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

export default ForgotPassword;
