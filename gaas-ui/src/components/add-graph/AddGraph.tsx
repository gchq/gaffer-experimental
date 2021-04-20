import {
  Button,
  Checkbox,
  Container,
  CssBaseline,
  Dialog,
  DialogContent,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  Zoom,
} from "@material-ui/core";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import React from "react";
import { Notifications } from "../../domain/notifications";
import { StoreType } from "../../domain/store-type";
import { CreateSimpleGraphRepo } from "../../rest/repositories/create-simple-graph-repo";
import { AlertType, NotificationAlert } from "../alerts/notification-alert";
import { GetAllGraphsRepo } from "../../rest/repositories/get-all-graphs-repo";
import { Graph } from "../../domain/graph";
import { ElementsSchema } from "../../domain/elements-schema";
import { TypesSchema } from "../../domain/types-schema";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import ClearIcon from "@material-ui/icons/Clear";
import { DropzoneArea } from "material-ui-dropzone";
import { TransitionProps } from "@material-ui/core/transitions";
import GraphIdDescriptionInput from "./graph-id-description";
import SchemaInput from "./schema-inputs";
import StoreTypeSelect from "./storetype";
import AddProxyGraphInput from "./add-proxy-graph-input";

interface IState {
  dialogIsOpen: boolean;
  graphId: string;
  description: string;
  proxyStores: Graph[];
  root: string;
  storeType: StoreType;
  outcome: AlertType | undefined;
  outcomeMessage: string;
  errors: Notifications;
  graphs: Graph[];
  elementsFiles: Array<File>;
  typesFiles: Array<File>;
  typesFieldDisabled: boolean;
  elementsFieldDisabled: boolean;
  elements: string;
  types: string;
  schemaJson: string;
  proxyURL: string;
  selectAllGraphs: boolean;
  tempGraph: [];
}
const Transition = React.forwardRef(
  (
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>
  ) => <Slide direction="up" ref={ref} {...props} />
);
export default class AddGraph extends React.Component<{}, IState> {
  constructor(props: object) {
    super(props);
    this.state = {
      schemaJson: "",
      elements: "",
      types: "",
      elementsFieldDisabled: false,
      elementsFiles: [],
      typesFieldDisabled: false,
      typesFiles: [],
      dialogIsOpen: false,
      graphId: "",
      description: "",
      storeType: StoreType.MAPSTORE,
      outcome: undefined,
      outcomeMessage: "",
      proxyStores: [],
      root: "",
      errors: new Notifications(),
      graphs: [],
      proxyURL: "",
      selectAllGraphs: false,
      tempGraph: [],
    };
  }

  private async submitNewGraph() {
    const errors: Notifications = new Notifications();
    const graphId = this.state.graphId;
    const description = this.state.description;
    const storeType = this.state.storeType;
    const proxyStores = this.state.proxyStores;
    const root = this.state.root;
    if (this.state.storeType !== StoreType.FEDERATED_STORE) {
      const elements = new ElementsSchema(this.state.elements);
      const types = new TypesSchema(this.state.types);
      errors.concat(elements.validate());
      errors.concat(types.validate());
      if (errors.isEmpty()) {
        try {
          await new CreateSimpleGraphRepo().create(
            graphId,
            description,
            storeType,
            proxyStores,
            {
              elements: elements.getElements(),
              types: types.getTypes(),
            },
            root
          );
          this.setState({
            outcome: AlertType.SUCCESS,
            outcomeMessage: `${graphId} was successfully added`,
          });
          this.resetForm();
        } catch (e) {
          this.setState({
            outcome: AlertType.FAILED,
            outcomeMessage: `Failed to Add '${graphId}' Graph. ${e.toString()}`,
          });
        }
      } else {
        this.setState({ errors });
      }
    } else {
      if (errors.isEmpty()) {
        try {
          await new CreateSimpleGraphRepo().createFederated(
            graphId,
            description,
            storeType,
            proxyStores,
            root
          );
          this.setState({
            outcome: AlertType.SUCCESS,
            outcomeMessage: `${graphId} was successfully added`,
          });
          this.resetForm();
        } catch (e) {
          this.setState({
            outcome: AlertType.FAILED,
            outcomeMessage: `Failed to Add '${graphId}' Graph. ${e.toString()}`,
          });
        }
      }
    }
  }

  private resetForm() {
    this.setState({
      graphId: "",
      description: "",
      elementsFiles: [],
      typesFiles: [],
      schemaJson: "",
      elements: "",
      types: "",
      proxyURL: "",
      proxyStores: [],
    });
  }

  private async getGraphs() {
    try {
      const graphs: Graph[] = await new GetAllGraphsRepo().getAll();
      this.setState({ graphs, outcomeMessage: "" });
    } catch (e) {
      this.setState({
        outcomeMessage: `Failed to get all graphs. ${e.toString()}`,
      });
    }
  }

  private async uploadElementsFiles(elementsFiles: File[]) {
    this.setState({ elementsFiles: elementsFiles });
    if (elementsFiles.length > 0) {
      const elementsSchemaFiles = await elementsFiles[0].text();
      this.setState({
        elementsFieldDisabled: true,
        elements: elementsSchemaFiles,
      });
    } else {
      this.setState({
        elementsFieldDisabled: false,
      });
    }
  }

  private async uploadTypesFiles(typesFiles: File[]) {
    this.setState({ typesFiles: typesFiles });
    if (typesFiles.length > 0) {
      const typesSchemaFiles = await typesFiles[0].text();
      this.setState({
        typesFieldDisabled: true,
        types: typesSchemaFiles,
      });
    } else {
      this.setState({
        typesFieldDisabled: false,
      });
    }
  }

  public async componentDidMount() {
    this.getGraphs();
  }

  private disableSubmitButton(): boolean {
    return (
      (this.state.storeType !== StoreType.FEDERATED_STORE &&
        (!this.state.elements || !this.state.types)) ||
      !this.state.graphId ||
      !this.state.description ||
      (this.state.storeType === StoreType.FEDERATED_STORE &&
        !(this.state.proxyStores.length > 0))
    );
  }

  private checkSelections(graph: Graph): boolean {
    if (this.state.proxyStores.length === 0) {
      return false;
    }
    if (this.state.proxyStores.includes(graph)) {
      return true;
    }
    if (this.state.proxyStores.length === this.state.graphs.length) {
      return true;
    }
    return false;
  }

  public render() {
    const { graphs } = this.state;
    const federatedStoreIsNotSelected = (): boolean =>
      this.state.storeType !== StoreType.FEDERATED_STORE;
    const openDialogBox = () => {
      this.setState({ dialogIsOpen: true });
    };
    const closeDialogBox = () => {
      this.setState({ dialogIsOpen: false });
    };

    return (
      <main>
        {this.state.outcome && (
          <NotificationAlert
            alertType={this.state.outcome}
            message={this.state.outcomeMessage}
          />
        )}
        {!this.state.errors.isEmpty() && (
          <NotificationAlert
            alertType={AlertType.FAILED}
            message={`Error(s): ${this.state.errors.errorMessage()}`}
          />
        )}
        <Toolbar />
        <Grid container justify="center">
          <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={this.classes.paper}>
              <Grid
                item
                xs={12}
                container
                direction="row"
                justify="center"
                alignItems="center"
                style={{ margin: 10 }}
              >
                <Typography variant="h4" align={"center"}>
                  Create Graph
                </Typography>
              </Grid>
              <form className={this.classes.form} noValidate>
                <Grid container spacing={2}>
                  <GraphIdDescriptionInput
                    graphIdValue={this.state.graphId}
                    onChangeGraphId={(graphId) => this.setState({ graphId })}
                    descriptionValue={this.state.description}
                    onChangeDescription={(description) =>
                      this.setState({ description })
                    }
                  />
                  <Grid
                    item
                    xs={12}
                    container
                    direction="row"
                    justify="flex-end"
                    alignItems="center"
                  />
                  {federatedStoreIsNotSelected() && (
                    <>
                      <Grid
                        item
                        xs={12}
                        container
                        direction="row"
                        justify="flex-end"
                        alignItems="center"
                      >
                        <Tooltip
                          TransitionComponent={Zoom}
                          title="Add Schema From File"
                        >
                          <IconButton
                            id="attach-file-button"
                            onClick={openDialogBox}
                          >
                            <AttachFileIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          TransitionComponent={Zoom}
                          title="Clear Schema"
                        >
                          <IconButton
                            onClick={() =>
                              this.setState({
                                schemaJson: "",
                              })
                            }
                          >
                            <ClearIcon />
                          </IconButton>
                        </Tooltip>

                        <Dialog
                          id="dropzone"
                          open={this.state.dialogIsOpen}
                          TransitionComponent={Transition}
                          keepMounted
                          onClose={closeDialogBox}
                          style={{ minWidth: "500px" }}
                          aria-labelledby="alert-dialog-slide-title"
                          aria-describedby="alert-dialog-slide-description"
                        >
                          <Grid
                            container
                            direction="row"
                            justify="flex-end"
                            alignItems="flex-start"
                          >
                            <IconButton
                              id="close-dropzone-button"
                              onClick={closeDialogBox}
                            >
                              <ClearIcon />
                            </IconButton>
                          </Grid>

                          <DialogContent>
                            <Grid id="elements-drop-zone">
                              <DropzoneArea
                                showPreviews={true}
                                onChange={async (files) =>
                                  this.uploadElementsFiles(files)
                                }
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
                                onChange={async (files) =>
                                  this.uploadTypesFiles(files)
                                }
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
                        </Dialog>
                      </Grid>
                    </>
                  )}
                  <SchemaInput
                    hide={!federatedStoreIsNotSelected()}
                    elementsValue={this.state.elements}
                    onChangeElementsSchema={(elements) => this.setState({ elements })}
                    typesSchemaValue={this.state.types}
                    onChangeTypesSchema={(types) => this.setState({ types })}
                  />
                  <Grid
                    item
                    xs={12}
                    container
                    direction="row"
                    justify="flex-end"
                    alignItems="center"
                  ></Grid>
                  <StoreTypeSelect value={this.state.storeType} onChange={((storeType) => this.setState({storeType}))} />
                </Grid>
              </form>
              <Grid
                item
                xs={12}
                container
                direction="row"
                justify="flex-end"
                alignItems="center"
              ></Grid>
              {!federatedStoreIsNotSelected() && (
                <>
                  <AddProxyGraphInput
                    hide={federatedStoreIsNotSelected()}
                    proxyURLValue={this.state.proxyURL}
                    onChangeProxyURL={(proxyURL) => this.setState({proxyURL})} 
                    onClickAddProxyGraph={(proxyGraph) => this.setState({graphs: [...this.state.graphs, proxyGraph], proxyStores: [...this.state.proxyStores, proxyGraph]})} />
                  <Grid
                    item
                    xs={12}
                    container
                    direction="row"
                    justify="flex-end"
                    alignItems="center"
                  ></Grid>
                  <TableContainer>
                    <Table
                      size="medium"
                      className={this.classes.table}
                      aria-label="Graphs Table"
                    >
                      <TableHead>
                        <TableRow style={{ background: "#F4F2F2" }}>
                          <TableCell component="th">Graph ID</TableCell>
                          <TableCell align="center">Description</TableCell>
                          <TableCell align="right">
                            <Checkbox
                              checked={
                                this.state.graphs.length > 0 &&
                                this.state.proxyStores.length ===
                                  this.state.graphs.length
                              }
                              onChange={(event) => {
                                if (event.target.checked) {
                                  this.setState({
                                    proxyStores: this.state.graphs,
                                  });
                                } else {
                                  this.setState({ proxyStores: [] });
                                }
                              }}
                            />{" "}
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {graphs.map((graph: Graph) => (
                          <TableRow key={graph.getId()} hover>
                            <TableCell scope="row">{graph.getId()}</TableCell>
                            <TableCell align="center">
                              {graph.getDescription()}
                            </TableCell>
                            <TableCell
                              align="right"
                              id={`${graph.getId()}-checkbox-cell`}
                            >
                              <Checkbox
                                id={`${graph.getId()}-checkbox`}
                                required
                                checked={this.checkSelections(graph)}
                                onChange={(event) => {
                                  if (
                                    event.target.checked &&
                                    !this.state.proxyStores.includes(graph)
                                  ) {
                                    this.setState({
                                      proxyStores: [
                                        ...this.state.proxyStores,
                                        graph,
                                      ],
                                    });
                                  } else {
                                    const tempProxyStore = this.state.proxyStores.filter(
                                      (obj) => obj.getId() !== graph.getId()
                                    );
                                    this.setState({
                                      proxyStores: tempProxyStore,
                                    });
                                  }
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      {graphs.length === 0 && <caption>No Graphs.</caption>}
                    </Table>
                  </TableContainer>
                </>
              )}
            </div>
          </Container>
          <Grid
            container
            style={{ margin: 10 }}
            direction="row"
            justify="center"
            alignItems="center"
          >
            <Button
              id="add-new-graph-button"
              onClick={() => {
                this.submitNewGraph();
              }}
              startIcon={<AddCircleOutlineOutlinedIcon />}
              type="submit"
              variant="contained"
              color="primary"
              className={this.classes.submit}
              disabled={this.disableSubmitButton()}
            >
              Add Graph
            </Button>
          </Grid>
        </Grid>
      </main>
    );
  }

  private classes: any = makeStyles((theme) => ({
    root: {
      width: "100%",
      marginTop: 40,
    },
    paper: {
      marginTop: theme.spacing(2),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    form: {
      width: "100%", // Fix IE 11 issue.
      marginTop: theme.spacing(3),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
    button: {
      margin: "10px",
    },
    previewChip: {
      minWidth: 160,
      maxWidth: 210,
    },
  }));
}
