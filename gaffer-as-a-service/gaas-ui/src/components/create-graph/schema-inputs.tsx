/*
 * Copyright 2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */

import React, { ReactElement } from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import { TypesSchema } from "../../domain/types-schema";
import { ElementsSchema } from "../../domain/elements-schema";
import { InputLabel } from "@material-ui/core";

interface IProps {
    hide: boolean;
    elementsValue: string;
    typesSchemaValue: string;
    onChangeElementsSchema(elementsSchema: string): void;
    onChangeTypesSchema(typesSchema: string): void;
}

export default function SchemaInput(props: IProps): ReactElement {
    const { hide, elementsValue, onChangeElementsSchema, typesSchemaValue, onChangeTypesSchema } = props;

    return (
        <>
            {!hide && (
                <>
                    <Grid item xs={12} id={"schema-elements-grid"}>
                        <InputLabel aria-label="schema-elements-input-label" required>
                            Schema Elements JSON
                        </InputLabel>
                        <TextField
                            id="schema-elements"
                            inputProps={{
                                name: "Schema Elements",
                                id: "schema-elements-input",
                                "aria-label": "schema-elements-input",
                            }}
                            fullWidth
                            value={elementsValue}
                            required
                            multiline
                            rows={5}
                            name="schema-elements"
                            variant="outlined"
                            onChange={(event) => onChangeElementsSchema(event.target.value)}
                            error={elementsValue !== "" && !new ElementsSchema(elementsValue).validate().isEmpty()}
                            helperText={
                                elementsValue !== "" ? new ElementsSchema(elementsValue).validate().errorMessage() : ""
                            }
                        />
                    </Grid>
                    <Grid item xs={12} id={"schema-types"}>
                        <InputLabel aria-label="schema-types-input-label" required>
                            Schema Types JSON
                        </InputLabel>
                        <TextField
                            id="schema-types"
                            inputProps={{
                                name: "Schema Types",
                                id: "schema-types-input",
                                "aria-label": "schema-types-input",
                            }}
                            fullWidth
                            value={typesSchemaValue}
                            name="schema-types"
                            required
                            multiline
                            rows={5}
                            variant="outlined"
                            onChange={(event) => onChangeTypesSchema(event.target.value)}
                            error={typesSchemaValue !== "" && !new TypesSchema(typesSchemaValue).validate().isEmpty()}
                            helperText={
                                typesSchemaValue !== ""
                                    ? new TypesSchema(typesSchemaValue).validate().errorMessage()
                                    : ""
                            }
                        />
                    </Grid>
                </>
            )}
        </>
    );
}
