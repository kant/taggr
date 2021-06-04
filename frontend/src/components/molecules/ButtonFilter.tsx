import React from "react";
import MaterialUiButton from "@material-ui/core/Button";
import Typography from "../atoms/Typography";

import { PropType } from "../../utils/type-utils";

type MaterialUiButtonProps = React.ComponentProps<typeof MaterialUiButton>;

type Props = {
  text: string;
  active: boolean;
  disabled?: boolean;
  style?: PropType<MaterialUiButtonProps, "style">;
  onClick: () => void;
};

const ButtonFilter = ({
  text = "",
  active = false,
  disabled = false,
  style: styles = {},
  onClick = () => 1,
}: Props) => (
  <MaterialUiButton
    variant="outlined"
    size="small"
    disabled={disabled}
    style={{
      minWidth: "115px",
      textTransform: "capitalize",
      background: active
        ? "linear-gradient(70.98deg, #fe7996 9.38%, #ff9964 91.67%)"
        : "white",
      margin: "auto",
      ...styles,
    }}
    onClick={onClick}
  >
    <Typography variant="subtitle1">{text}</Typography>
  </MaterialUiButton>
);

export default ButtonFilter;
