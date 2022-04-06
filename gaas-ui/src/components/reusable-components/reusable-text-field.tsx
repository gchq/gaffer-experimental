import React from "react";
import { TextField } from "@material-ui/core";

interface IProps {
    name: string;
    onChange(textFieldInput: string): void;
}
export default function ReusableTextField(props: IProps) {
    const { name, onChange } = props;
    const [textFieldInput, setTextFieldInput] = React.useState("");
    const onInput = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setTextFieldInput(event.target.value);
        onChange(event.target.value);
    };
    return (
        <TextField
            name={name}
            label={name}
            onChange={onInput}
            value={textFieldInput}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            autoFocus
        />
    );
}
