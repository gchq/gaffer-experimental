import React, { ReactElement } from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import { TypesSchema } from "../../domain/types-schema";
import { ElementsSchema } from "../../domain/elements-schema";

interface IProps {
  hide: boolean;
  elementsValue: string;
  typesSchemaValue: string;
  onChangeElementsSchema(elementsSchema: string): void;
  onChangeTypesSchema(typesSchema: string): void;
}

export default function SchemaInput(props: IProps): ReactElement {
  
  const {
    hide,
    elementsValue,
    onChangeElementsSchema,
    typesSchemaValue,
    onChangeTypesSchema,
  } = props;

  return (
    <>
      {!hide && (
        <>
          <Grid item xs={12}>
            <TextField
              id="schema-elements"
              style={{ width: 400 }}
              value={elementsValue}
              label="Schema Elements JSON"
              required
              multiline
              rows={5}
              name="schema-elements"
              variant="outlined"
              onChange={(event) => onChangeElementsSchema(event.target.value)}
              error={elementsValue !== "" && !new ElementsSchema(elementsValue).validate().isEmpty()}
              helperText={elementsValue !== "" ? new ElementsSchema(elementsValue).validate().errorMessage() : ""}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="schema-types"
              style={{ width: 400 }}
              value={typesSchemaValue}
              name="schema-types"
              label="Schema Types JSON"
              required
              multiline
              rows={5}
              variant="outlined"
              onChange={(event) => onChangeTypesSchema(event.target.value)}
              error={typesSchemaValue !== "" && !new TypesSchema(typesSchemaValue).validate().isEmpty()}
              helperText={typesSchemaValue !== "" ? new TypesSchema(typesSchemaValue).validate().errorMessage() : ""}
            />
          </Grid>
        </>
      )}
    </>
  );
}
