/*
 * Copyright 2021-2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
            label={name.charAt(0).toUpperCase() + name.slice(1)}
            type={name === "password" ? "password" : "text"}
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
