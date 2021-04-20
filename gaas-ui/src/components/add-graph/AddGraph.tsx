import {
  Button,
  Container,
  CssBaseline,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  makeStyles,
  Slide,
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
import GraphsTable from "./graphs-table";

interface IState {
  graphId: string;
  description: string;
  schemaJson: string;
  elements: string;
  elementsFiles: Array<File>;
  elementsFieldDisabled: boolean;
  types: string;
  typesFiles: Array<File>;
  typesFieldDisabled: boolean;
  dialogIsOpen: boolean;
  storeType: StoreType;
  graphs: Graph[];
  proxyURL: string;
  root: string;
  selectedGraphs: string[];
  outcome: AlertType | undefined;
  outcomeMessage: string;
  errors: Notifications;
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
      graphId: "",
      description: "",
      schemaJson: "",
      elements: "",
      elementsFiles: [],
      elementsFieldDisabled: false,
      types: "",
      typesFiles: [],
      typesFieldDisabled: false,
      dialogIsOpen: false,
      storeType: StoreType.MAPSTORE,
      proxyURL: "",
      root: "",
      graphs: [],
      selectedGraphs: [],
      errors: new Notifications(),
      outcome: undefined,
      outcomeMessage: "",
    };
  }

  public async componentDidMount() {
    this.getGraphs();
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

  private async submitNewGraph() {
    const { graphId, description, storeType, graphs, selectedGraphs, root } = this.state;
    const errors: Notifications = new Notifications();

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
            graphs,
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
          const subGraphs: Graph[] = graphs.filter((graph) => selectedGraphs.includes(graph.getId()));
          await new CreateSimpleGraphRepo().createFederated(
            graphId,
            description,
            storeType,
            subGraphs,
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
      selectedGraphs: [],
    });
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

  private disableSubmitButton(): boolean {
    const {
      storeType,
      elements,
      types,
      graphId,
      description,
      selectedGraphs,
    } = this.state;
    return (
      (storeType !== StoreType.FEDERATED_STORE && (!elements || !types)) ||
      !graphId ||
      !description ||
      (storeType === StoreType.FEDERATED_STORE && selectedGraphs.length === 0)
    );
  }

  public render() {
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
                  <StoreTypeSelect
                    value={this.state.storeType}
                    onChange={(storeType) => this.setState({ storeType })}
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
                    onChangeElementsSchema={(elements) =>
                      this.setState({ elements })
                    }
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
                  />
                  <Grid
                    item
                    xs={12}
                    container
                    direction="row"
                    justify="flex-end"
                    alignItems="center"
                  />
                </Grid>
              </form>
              <AddProxyGraphInput
                hide={federatedStoreIsNotSelected()}
                proxyURLValue={this.state.proxyURL}
                onChangeProxyURL={(proxyURL) => this.setState({ proxyURL })}
                onClickAddProxyGraph={(proxyGraph) =>
                  this.setState({
                    graphs: [...this.state.graphs, proxyGraph],
                    selectedGraphs: [...this.state.selectedGraphs, proxyGraph.getId()],
                  })
                }
              />
              <GraphsTable
                hide={federatedStoreIsNotSelected()}
                graphs={this.state.graphs}
                selectedGraphs={this.state.selectedGraphs}
                onClickCheckbox={(selectedGraphs) =>
                  this.setState({ selectedGraphs })
                }
              />
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
