import React, { ReactElement } from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import { Tooltip, Zoom, IconButton, Dialog, DialogContent, Slide } from "@material-ui/core";
import { DropzoneArea } from "material-ui-dropzone";
import Transition, { TransitionProps } from "react-transition-group/Transition";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import ClearIcon from "@material-ui/icons/Clear";

interface IProps {
    elementsValue: string,
    onChangeElements(elementsSchema:string):void,
}

export default function SchemaInput(props: IProps): ReactElement {
  const Transition = React.forwardRef((props: TransitionProps & { children?: React.ReactElement<any, any> }, ref: React.Ref<unknown>) => <Slide direction="up" ref={ref} {...props} />);
  const {elementsValue,onChangeElements} = props;
  return (
        <>
          <Grid item xs={12} container direction="row" justify="flex-end" alignItems="center">
            {/* <Tooltip TransitionComponent={Zoom} title="Add Schema From File">
              <IconButton id="attach-file-button" onClick={openDialogBox}>
                <AttachFileIcon />
              </IconButton>
            </Tooltip> */}
            {/* <Tooltip TransitionComponent={Zoom} title="Clear Schema">
              <IconButton
                onClick={() =>
                  this.setState({
                    schemaJson: "",
                  })
                }
              >
                <ClearIcon />
              </IconButton>
            </Tooltip> */}

            {/* <Dialog
              id="dropzone"
              open={this.state.dialogIsOpen}
              TransitionComponent={Transition}
              keepMounted
              onClose={closeDialogBox}
              style={{ minWidth: "500px" }}
              aria-labelledby="alert-dialog-slide-title"
              aria-describedby="alert-dialog-slide-description"
            >
              <Grid container direction="row" justify="flex-end" alignItems="flex-start">
                <IconButton id="close-dropzone-button" onClick={closeDialogBox}>
                  <ClearIcon />
                </IconButton>
              </Grid>

              <DialogContent>
                <Grid id="elements-drop-zone">
                  <DropzoneArea
                    showPreviews={true}
                    onChange={async (files) => this.uploadElementsFiles(files)}
                    showPreviewsInDropzone={false}
                    dropzoneText="Drag and drop elements.JSON"
                    useChipsForPreview
                    previewGridProps={{
                      container: { spacing: 1, direction: "row" },
                    }}
                    previewChipProps={{
                      classes: { root: this.classes.previewChip },
                    }}
                    previewText="Selected files"
                    clearOnUnmount={true}
                    acceptedFiles={["application/json"]}
                    filesLimit={1}
                  />
                </Grid>
                <Grid id="types-drop-zone">
                  <DropzoneArea
                    showPreviews={true}
                    onChange={async (files) => this.uploadTypesFiles(files)}
                    showPreviewsInDropzone={false}
                    dropzoneText="Drag and drop types.JSON"
                    useChipsForPreview
                    previewGridProps={{
                      container: { spacing: 1, direction: "row" },
                    }}
                    previewChipProps={{
                      classes: { root: this.classes.previewChip },
                    }}
                    previewText="Selected files"
                    clearOnUnmount={true}
                    acceptedFiles={["application/json"]}
                    filesLimit={1}
                  />
                </Grid>
              </DialogContent>
            </Dialog> */}
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="schema-elements"
              style={{ width: 400 }}
              value={elementsValue}
              label="Schema Elements JSON"
              // disabled={this.state.elementsFieldDisabled}
              required
              multiline
              rows={5}
              name="schema-elements"
              variant="outlined"
              onChange={(event) => onChangeElements(event.target.value)}
            />
          </Grid>
          {/* <Grid item xs={12}>
            <TextField
              id="schema-types"
              style={{ width: 400 }}
              value={this.state.types}
              disabled={this.state.typesFieldDisabled}
              name="schema-types"
              label="Schema Types JSON"
              required
              multiline
              rows={5}
              variant="outlined"
              onChange={(event) => {
                this.setState({
                  types: event.target.value,
                });
              }}
            />
          </Grid> */}
    </>
  );
}
