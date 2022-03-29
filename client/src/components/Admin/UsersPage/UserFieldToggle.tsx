import React, { FunctionComponent, useState, ChangeEvent } from "react";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { useAuthHeader } from "store/auth";
import { useNotify } from "components/Notifications";
import config from "config";

type Props = {
  userId: number;
  fieldName: string;
  label?: string;
  value: boolean;
};

const UserFieldToggle: FunctionComponent<Props> = ({
  userId,
  fieldName,
  label,
  value,
}) => {
  const [checked, setChecked] = useState(value);
  const authHeader = useAuthHeader();
  const { notify } = useNotify();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked !== checked) {
      fetch(`${config.SERVER_API_URL}/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({
          [fieldName]: !checked,
        }),
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          try {
            if (response?.code === 200) {
              setChecked(response.data.user[fieldName]);
              notify(response.message, "success");
            }
          } catch (error) {
            console.log(error);
          }
        })
        .catch((error) => console.log(error));
    }
  };

  return (
    <FormGroup row>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={handleChange}
            color="primary"
            name={fieldName}
          />
        }
        label={label}
      />
    </FormGroup>
  );
};

export default UserFieldToggle;
