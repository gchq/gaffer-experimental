import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import React from "react";

interface IProps {
    onChangeGraphId(graphId: string): void;
    onChangeDescription(graphId: string): void;
}

export class GraphIdDescriptionInput extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
    this.state = {};
  }

  public render() {
    return (
      <>
        <Grid item xs={12}>
          <TextField
            id="graph-id"
            label="Graph Id"
            variant="outlined"
            value={this.state.graphId}
            required
            fullWidth
            name="graph-id"
            autoComplete="graph-id"
            onChange={(event) => {
              this.setState({
                graphId: event.target.value,
              });
            }}
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
            value={this.state.description}
            required
            multiline
            rows={5}
            name="graph-description"
            variant="outlined"
            onChange={(event) => {
              this.setState({
                description: event.target.value,
              });
            }}
          />
        </Grid>
      </>
    );
  }
}
