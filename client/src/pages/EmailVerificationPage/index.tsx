import React, { FunctionComponent } from "react";
import { useEffect, useCallback } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useNotify } from "../../components/Notifications";
import config from "config";

interface Params {
  token: string;
}

const EmailVerificationPage: FunctionComponent = () => {
  const { token } = useParams<Params>();
  const history = useHistory();
  const { notify } = useNotify();
  const verifyEmail = useCallback(async () => {
    try {
      const response = await fetch(
        `${config.SERVER_API_URL}/users/verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
          }),
        }
      );
      const { data, code, message, errors } = await response.json();
      switch (code) {
        case 200: {
          notify(message, "success");
          break;
        }
        default: {
          notify(message, "error");
          break;
        }
      }
    } catch (error) {
      console.log(error);
    }
    history.push("/sign-in");
  }, [token]);

  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  return null;
};

export default EmailVerificationPage;
