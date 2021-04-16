import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import { ReactElement } from "react";

interface IProps {
  graphIdValue: string;
  descriptionValue: string;
  onChangeGraphId(graphId: string): void;
  onChangeDescription(graphId: string): void;
}

export function GraphIdDescriptionInput(props: IProps): ReactElement {

    const {
      graphIdValue,
      descriptionValue,
      onChangeGraphId,
      onChangeDescription,
    } = props;

    return (
      <>
        <Grid item xs={12}>
          <TextField
            id="graph-id"
            label="Graph Id"
            variant="outlined"
            value={graphIdValue}
            required
            fullWidth
            name="graph-id"
            autoComplete="graph-id"
            onChange={(event) => onChangeGraphId(event.target.value)}
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
          <TextField
            id="graph-description"
            style={{ width: 400 }}
            label="Graph Description"
            value={descriptionValue}
            required
            multiline
            rows={5}
            name="graph-description"
            variant="outlined"
            onChange={(event) => onChangeDescription(event.target.value)}
          />
        </Grid>
      </>
    );
  }
