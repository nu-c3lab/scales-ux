import React, { FunctionComponent, ReactNode } from "react";
import { SpinnerProps, Spinner } from "react-bootstrap";

interface Props extends SpinnerProps {
  isVisible: boolean;
  children?: ReactNode;
}

const Loader: FunctionComponent = (props: Props) => {
  const {
    isVisible = false,
    animation = "border",
    variant = "dark",
    size = "",
    children,
  } = props;

  if (isVisible) {
    return <Spinner animation={animation} variant={variant} />;
  }

  return children;
};

export default Loader;
