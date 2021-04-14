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
  Hidden,
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
}
const Transition = React.forwardRef((props: TransitionProps & { children?: React.ReactElement<any, any> }, ref: React.Ref<unknown>) => <Slide direction="up" ref={ref} {...props} />);
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
    };
  }

  private async submitNewGraph() {
    const errors: Notifications = new Notifications();
    const graphId = this.state.graphId;
    const description = this.state.description;
    const storeType = this.state.storeType;
    const proxyStores = this.state.proxyStores;
    const root = this.state.root;
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
  }

  private async addProxyGraph(url:string) {
    this.setState({
      graphs: [...this.state.graphs, new Graph(url+"-graph", "Proxy Graph", this.state.proxyURL, "")],
      proxyURL:"",
    });
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
    return !this.state.elements || !this.state.types || !this.state.graphId || !this.state.description || (this.state.storeType === StoreType.FEDERATED_STORE && !(this.state.proxyStores.length > 0));
  }

  private disableProxyButton(): boolean {
    return this.state.proxyURL === "";
  }

  private checkSelections(graph: Graph): boolean{
    if(this.state.proxyStores.length===0){
      return false;
    }
    if(this.state.proxyStores.includes(graph)){
      return true;
    }
    if(this.state.proxyStores.length===this.state.graphs.length){
      return true;
    }
    return false;
  };


  public render() {
    const { graphs } = this.state;
    const isHidden = (): boolean => this.state.storeType !== StoreType.FEDERATED_STORE;
    const openDialogBox = () => {
      this.setState({ dialogIsOpen: true });
    };
    const closeDialogBox = () => {
      this.setState({ dialogIsOpen: false });
    };


    return (
      <main>
        {this.state.outcome && <NotificationAlert alertType={this.state.outcome} message={this.state.outcomeMessage} />}
        {!this.state.errors.isEmpty() && <NotificationAlert alertType={AlertType.FAILED} message={`Error(s): ${this.state.errors.errorMessage()}`} />}
        <Toolbar />
        <Grid container justify="center">
          <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={this.classes.paper}>
              <Grid item xs={12} container direction="row" justify="center" alignItems="center" style={{ margin: 10 }}>
                <Typography variant="h4" align={"center"}>
                  Create Graph
                </Typography>
              </Grid>
              <form className={this.classes.form} noValidate>
                <Grid container spacing={2}>
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
                  <Grid item xs={12} container direction="row" justify="flex-end" alignItems="center"></Grid>
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
                  <Grid item xs={12} container direction="row" justify="flex-end" alignItems="center"></Grid>
                  <Grid item xs={12} container direction="row" justify="flex-end" alignItems="center">
                    <Tooltip TransitionComponent={Zoom} title="Add Schema From File">
                      <IconButton id="attach-file-button" onClick={openDialogBox}>
                        <AttachFileIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip TransitionComponent={Zoom} title="Clear Schema">
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
                    </Dialog>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      id="schema-elements"
                      style={{ width: 400 }}
                      value={this.state.elements}
                      label="Schema Elements JSON"
                      disabled={this.state.elementsFieldDisabled}
                      required
                      multiline
                      rows={5}
                      name="schema-elements"
                      variant="outlined"
                      onChange={(event) => {
                        this.setState({
                          elements: event.target.value,
                        });
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
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
                  </Grid>
                  <Grid item xs={12} container direction="row" justify="flex-end" alignItems="center"></Grid>
                  <Grid item xs={12} id={"storetype-select-grid"}>
                    <FormControl variant="outlined" id={"storetype-formcontrol"}>
                      <InputLabel>Store Type</InputLabel>

                      <Select
                        label="Store Type"
                        inputProps={{
                          name: "Store Type",
                          id: "outlined-age-native-simple",
                        }}
                        labelId="storetype-select-label"
                        id="storetype-select"
                        value={this.state.storeType}
                        onChange={(event) => {
                          this.setState({
                            storeType: event.target.value as StoreType,
                          });
                        }}
                      >
                        <MenuItem value={StoreType.MAPSTORE}>Map Store</MenuItem>
                        <MenuItem value={StoreType.ACCUMULO}>Accumulo</MenuItem>
                        <MenuItem value={StoreType.FEDERATED_STORE}>Federated Store</MenuItem>
                      </Select>
                      <FormHelperText>Set to Map Store by default</FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>
              </form>
              <Grid item xs={12} container direction="row" justify="flex-end" alignItems="center"></Grid>
              <Hidden xsUp={isHidden()}>
                <Grid item xs={12}>
                  <TextField
                    id="proxy-url"
                    label="Proxy URL"
                    variant="outlined"
                    value={this.state.proxyURL}
                    fullWidth
                    name="proxy-url"
                    autoComplete="proxy-url"
                    onChange={(event) => {
                      this.setState({
                        proxyURL: event.target.value,
                      });
                    }}
                  />
                  <FormHelperText>Enter URL for proxy store if not shown below</FormHelperText>
                </Grid>
                <Grid container style={{ margin: 10 }} direction="row" justify="center" alignItems="center">
                  <Button
                    id="add-new-proxy-button"
                    onClick={() => {
                      this.addProxyGraph(this.state.proxyURL);
                    }}
                    startIcon={<AddCircleOutlineOutlinedIcon />}
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={this.classes.submit}
                    disabled={this.disableProxyButton()}
                  >
                    Add Proxy Graph
                  </Button>
                </Grid>
                <Grid item xs={12} container direction="row" justify="flex-end" alignItems="center"></Grid>
                <TableContainer>
                  <Table size="medium" className={this.classes.table} aria-label="Graphs Table">
                    <TableHead>
                      <TableRow style={{ background: "#F4F2F2" }}>
                        <TableCell component="th">Graph ID</TableCell>
                        <TableCell align="center">Description</TableCell>
                        <TableCell align="right"><Checkbox
                        checked={
                          (this.state.graphs.length>0 && (this.state.proxyStores.length === this.state.graphs.length))
                       }
                       onChange={(event) => {
                         if(event.target.checked){
                           this.setState({proxyStores: this.state.graphs})
                         }else{
                          this.setState({proxyStores: []})
                         }
                        }}
                            /> </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {graphs.map((graph: Graph, index) => (
                        <TableRow key={graph.getId()} hover>
                          <TableCell scope="row">
                            {graph.getId()}
                          </TableCell>
                          <TableCell align="center">{graph.getDescription()}</TableCell>
                          <TableCell align="right">
                            <Checkbox
                              id={`${graph.getId()}-checkbox`}
                              required
                              checked={this.checkSelections(graph)}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  this.setState({
                                    proxyStores: [...this.state.proxyStores, graph],
                                  });
                                } else {
                                  const tempProxyStore = this.state.proxyStores.filter((obj) => obj !== graph);
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
              </Hidden>
            </div>
          </Container>
          <Grid container style={{ margin: 10 }} direction="row" justify="center" alignItems="center">
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
