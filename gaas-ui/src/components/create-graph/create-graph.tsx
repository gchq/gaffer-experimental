import {
  Box,
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
import AddRoundedIcon from "@material-ui/icons/AddRounded";
import React from "react";
import {CreateStoreTypesGraphRepo, ICreateGraphConfig,} from "../../rest/repositories/create-storetypes-graph-repo";
import {AlertType, NotificationAlert} from "../alerts/notification-alert";
import {GetAllGraphsRepo} from "../../rest/repositories/get-all-graphs-repo";
import {Graph} from "../../domain/graph";
import {ElementsSchema} from "../../domain/elements-schema";
import {TypesSchema} from "../../domain/types-schema";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import ClearIcon from "@material-ui/icons/Clear";
import {DropzoneArea} from "material-ui-dropzone";
import {TransitionProps} from "@material-ui/core/transitions";
import GraphIdDescriptionInput from "./graph-id-description";
import SchemaInput from "./schema-inputs";
import StoreTypeSelect from "./storetype";
import AddProxyGraphInput from "./add-proxy-graph-input";
import ProxyGraphsTable from "./proxy-graphs-table";
import {GetStoreTypesRepo, IStoreTypes} from "../../rest/repositories/get-store-types-repo";
import {CreateFederatedGraphRepo} from "../../rest/repositories/create-federated-graph-repo";
import { Copyright } from "../copyright/copyright";

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
  storeType: string;
  storeTypes: string[];
  federatedStoreTypes: string[];
  graphs: Graph[];
  proxyURL: string;
  root: string;
  selectedGraphs: string[];
  outcome: AlertType | undefined;
  outcomeMessage: string;
}

const Transition = React.forwardRef(
  (
      props: TransitionProps & { children?: React.ReactElement<any, any> },
  ) => <Slide direction="up"  {...props} />
);

export default class CreateGraph extends React.Component<{}, IState> {
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
          storeType: "",
          storeTypes: [],
          federatedStoreTypes: [],
          proxyURL: "",
          root: "",
          graphs: [],
          selectedGraphs: [],
          outcome: undefined,
          outcomeMessage: "",
      };
  }

  public async componentDidMount() {
      this.getGraphs();
      this.getAllStoreTypes();
  }

  private async getGraphs() {
      try {
          const graphs: Graph[] = await new GetAllGraphsRepo().getAll();
          this.setState({graphs});
      } catch (e:any) {
          this.setState({
              outcome: AlertType.FAILED,
              outcomeMessage: `Failed to get all graphs. ${e.toString()}`,
          });
      }
  }

  private async getAllStoreTypes() {
      try {
          const storeTypes: IStoreTypes = await new GetStoreTypesRepo().get();
              this.setState({
                  storeTypes: storeTypes.storeTypes,
                  federatedStoreTypes: storeTypes.federatedStoreTypes
              });
      } catch (e:any) {
          this.setState({
              outcome: AlertType.FAILED,
              outcomeMessage: `Storetypes unavailable: ${e.toString()}`,
          });
      }
  }

  private async submitNewGraph() {
      //TODO: separate functions
      const {graphId, description, storeType, graphs, selectedGraphs} = this.state;

      let config: ICreateGraphConfig;
      if (this.currentStoreTypeIsFederated()) {
          const subGraphs: Array<{ graphId: string; url: string; }> = graphs
              .filter((graph) => selectedGraphs.includes(graph.getId()))
              .map((subGraph: Graph) => ({
                  graphId: subGraph.getId(),
                  url: subGraph.getUrl(),
              }));
          config = {proxyStores: subGraphs};

      } else {
          const elements = new ElementsSchema(this.state.elements);
          const types = new TypesSchema(this.state.types);
          elements.validate();
          types.validate();
          config = {
              schema: {elements: elements.getElements(), types: types.getTypes()},
          };
      }

      try {
          if(!this.currentStoreTypeIsFederated()){
              await new CreateStoreTypesGraphRepo().create(graphId, description, storeType, config);

          } else {
              await new CreateFederatedGraphRepo().create(graphId, description, storeType, config);
          }
          this.setState({
              outcome: AlertType.SUCCESS,
              outcomeMessage: `${graphId} was successfully added`,
          });
          this.resetForm();
      } catch (e:any) {
          this.setState({
              outcome: AlertType.FAILED,
              outcomeMessage: `Failed to Add '${graphId}' Graph. ${e.toString()}`,
          });
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
      this.setState({elementsFiles: elementsFiles});
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
      this.setState({typesFiles: typesFiles});
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
      const { elements, types, graphId, description, selectedGraphs} = this.state;
      return (
          (!this.currentStoreTypeIsFederated() && (!elements || !types)) ||
          !graphId ||
          !description ||
          (this.currentStoreTypeIsFederated() && selectedGraphs.length === 0) ||
          (!this.currentStoreTypeIsFederated() && !new ElementsSchema(elements).validate().isEmpty()) ||
          (!this.currentStoreTypeIsFederated() && !new TypesSchema(types).validate().isEmpty())
      );
  }

  private currentStoreTypeIsFederated(): boolean{
      return (this.state.federatedStoreTypes.includes(this.state.storeType))}


  public render() {
      const federatedStoreIsNotSelected = (): boolean =>
           !this.currentStoreTypeIsFederated();
      const openDialogBox = () => {
          this.setState({dialogIsOpen: true});
      };
      const closeDialogBox = () => {
          this.setState({dialogIsOpen: false});
      };

      return (
          <main aria-label="create-graph-Page" id={"create-graph-page"}>
              {this.state.outcome && (
                  <NotificationAlert
                      alertType={this.state.outcome}
                      message={this.state.outcomeMessage}
                  />
              )}
              <Toolbar/>

              <Grid container justify="center">
                  <Container maxWidth="md">
                      <CssBaseline/>
                      <div className={this.classes.paper}>
                          <Grid
                              item
                              xs={12}
                              container
                              direction="row"
                              justify="center"
                              alignItems="center"
                              style={{margin: 10}}
                          >
                              <Box my={4}>
                                  <Typography variant="h4" align={"center"} id={"create-graph-title"}
                                              aria-label={"create-graph-title"}>
                                      Create Graph
                                  </Typography>
                              </Box>

                          </Grid>
                          <form className={this.classes.form} noValidate>
                              <Grid container spacing={2}>
                                  <GraphIdDescriptionInput
                                      graphIdValue={this.state.graphId}
                                      onChangeGraphId={(graphId) => this.setState({graphId})}
                                      descriptionValue={this.state.description}
                                      onChangeDescription={(description) =>
                                          this.setState({description})
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
                                  <StoreTypeSelect aria-label="store-type-select"
                                                   allStoreTypes={this.state.storeTypes.concat(this.state.federatedStoreTypes)}
                                                   value={this.state.storeType}
                                                   onChangeStoreType={(storeType) => {
                                                       this.setState(
                                                           {
                                                               storeType
                                                           });
                                                   }}
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
                                              id={"test"}
                                          >
                                              <Tooltip
                                                  TransitionComponent={Zoom}
                                                  title="Add Empty Elements and Types Schema Templates"
                                              >
                                                  <IconButton
                                                      onClick={() => {
                                                          this.setState({
                                                              elements: '{"entities":{}, "edges":{}}',
                                                              types: '{"types":{}}'
                                                          });
                                                      }}
                                                  >
                                                      <AddRoundedIcon/>
                                                  </IconButton>
                                              </Tooltip>
                                              <Tooltip
                                                  TransitionComponent={Zoom}
                                                  title="Add Elements and Types Schemas From File"
                                              >
                                                  <IconButton
                                                      id="attach-file-button"
                                                      onClick={openDialogBox}
                                                  >
                                                      <AttachFileIcon/>
                                                  </IconButton>
                                              </Tooltip>
                                              <Tooltip
                                                  TransitionComponent={Zoom}
                                                  title="Clear All Schemas"
                                              >
                                                  <IconButton
                                                      onClick={() =>
                                                          this.setState({
                                                              elements: "",
                                                              elementsFiles: [],
                                                              types: "",
                                                              typesFiles: []
                                                          })
                                                      }
                                                  >
                                                      <ClearIcon/>
                                                  </IconButton>
                                              </Tooltip>

                                              <Dialog
                                                  id="dropzone"
                                                  open={this.state.dialogIsOpen}
                                                  TransitionComponent={Transition}
                                                  keepMounted
                                                  onClose={closeDialogBox}
                                                  style={{minWidth: "500px"}}
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
                                                          <ClearIcon/>
                                                      </IconButton>
                                                  </Grid>

                                                  <DialogContent>
                                                      <Grid id="elements-drop-zone">
                                                          <DropzoneArea
                                                              showPreviews={true}
                                                              onChange={async(files) =>
                                                                  this.uploadElementsFiles(files)
                                                              }
                                                              showPreviewsInDropzone={false}
                                                              dropzoneText="Drag and drop elements.JSON"
                                                              useChipsForPreview
                                                              previewGridProps={{
                                                                  container: {spacing: 1, direction: "row"},
                                                              }}
                                                              previewChipProps={{
                                                                  classes: {root: this.classes.previewChip},
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
                                                              onChange={async(files) =>
                                                                  this.uploadTypesFiles(files)
                                                              }
                                                              showPreviewsInDropzone={false}
                                                              dropzoneText="Drag and drop types.JSON"
                                                              useChipsForPreview
                                                              previewGridProps={{
                                                                  container: {spacing: 1, direction: "row"},
                                                              }}
                                                              previewChipProps={{
                                                                  classes: {root: this.classes.previewChip},
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
                                          this.setState({elements})
                                      }
                                      typesSchemaValue={this.state.types}
                                      onChangeTypesSchema={(types) => this.setState({types})}
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
                              onChangeProxyURL={(proxyURL) => this.setState({proxyURL})}
                              onClickAddProxyGraph={(proxyGraph) => this.setState({
                                  graphs: [...this.state.graphs, proxyGraph],
                                  selectedGraphs: [
                                      ...this.state.selectedGraphs,
                                      proxyGraph.getId(),
                                  ],
                              })
                              }
                          />
                          <ProxyGraphsTable
                              hide={federatedStoreIsNotSelected()}
                              graphs={this.state.graphs}
                              selectedGraphs={this.state.selectedGraphs}
                              onClickCheckbox={(selectedGraphs) =>
                                  this.setState({selectedGraphs})
                              }
                          />
                      </div>
                  </Container>
                  <Grid
                      container
                      style={{margin: 10}}
                      direction="row"
                      justify="center"
                      alignItems="center"
                  >
                      <Button
                          id="create-new-graph-button"
                          onClick={() => {
                              this.submitNewGraph();
                          }}
                          startIcon={<AddCircleOutlineOutlinedIcon/>}
                          type="submit"
                          variant="contained"
                          color="primary"
                          className={this.classes.submit}
                          disabled={this.disableSubmitButton()}
                      >
                          Create Graph
                      </Button>
                  </Grid>
                  <Box pt={4}>
                        <Copyright />
                    </Box>
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