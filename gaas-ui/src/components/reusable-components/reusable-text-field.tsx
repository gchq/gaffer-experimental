import React from "react";
import { TextField } from "@material-ui/core";
import { encode } from "html-entities";
import DOMPurify from "dompurify";

interface IProps {
    name: string;
    onChange(textFieldInput: string): void;
}
export default function ReusableTextField(props: IProps) {
    const { name, onChange } = props;
    const [textFieldInput, setTextFieldInput] = React.useState("");
    const onInput = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setTextFieldInput(encode(DOMPurify.sanitize(event.target.value)));
        onChange(encode(DOMPurify.sanitize(event.target.value)));
    };
    return (
        <TextField
            id={name}
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
