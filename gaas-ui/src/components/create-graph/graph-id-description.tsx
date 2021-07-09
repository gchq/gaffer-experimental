import React, {ReactElement, useState} from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import {InputLabel} from "@material-ui/core";

interface IProps {
  graphIdValue: string;
  descriptionValue: string;
  onChangeGraphId(graphId: string): void;
  onChangeDescription(graphId: string): void;
}

export default function GraphIdDescriptionInput(props: IProps): ReactElement {

    const {
      graphIdValue,
      descriptionValue,
      onChangeGraphId,
      onChangeDescription,
    } = props;
    const [errorHelperText, setErrorHelperText] = useState("");

    return (
      <>
        <Grid item xs={12} id={"id-description-fields"} aria-label="id-description-fields">
            <InputLabel aria-label="graph-id-input-label" id="graph-id-input-label" required>Graph Id</InputLabel>
          <TextField
            id="graph-id"
            inputProps={{
                name: "Graph ID",
                id: "graph-id-input",
                "aria-label": "graph-id-input"
            }}
            aria-label="graph-id-input"
            variant="outlined"
            value={graphIdValue}
            error={errorHelperText.length > 0}
            required
            fullWidth
            autoFocus
            name="graph-id"
            onChange={(event) => {
                onChangeGraphId(event.target.value);
                const regex = new RegExp("^[a-z0-9]*$")
                if(regex.test(event.target.value)) {
                    setErrorHelperText("");
                }
                else {
                    setErrorHelperText("Graph ID can only contain numbers and lowercase letters")
                }
            }}
            helperText={errorHelperText }
          />
        </Grid>
        <Grid
          item
          xs={12}
          container
          direction="row"
          justify="flex-end"
          alignItems="center"
        ></Grid>
        <Grid item xs={12}>
            <InputLabel aria-label="graph-description-input-label" id="graph-description-input-label" required>Graph Description</InputLabel>
            <TextField
            id="graph-description"
            aria-label="graph-description-input"
            inputProps={{
                name: "Graph Description",
                id: "graph-description-input",
                "aria-label": "graph-description-input"
            }}
            value={descriptionValue}
            required
            multiline
            autoFocus
            rows={5}
            fullWidth
            name="graph-description"
            variant="outlined"
            onChange={(event) => onChangeDescription(event.target.value)}
          />
        </Grid>
      </>
    );
  }