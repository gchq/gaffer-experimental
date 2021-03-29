import {
    Button,
    Container,
    CssBaseline,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    makeStyles,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import { Console } from "node:console";
import React from "react";
import { Notifications } from "../../domain/notifications";
import { StoreType } from "../../domain/store-type";
import { CreateSimpleGraphRepo } from "../../rest/repositories/create-simple-graph-repo";
import { AlertType, NotificationAlert } from "../alerts/notification-alert";

interface IState {
    dialogIsOpen: boolean;
    graphId: string;
    description: string;
    url: string;
    storeType: StoreType;
    outcome: AlertType | undefined;
    outcomeMessage: string;
    errors: Notifications;
}

export default class SimpleAddGraph extends React.Component<{}, IState> {
    constructor(props: object) {
        super(props);
        this.state = {
            dialogIsOpen: false,
            graphId: "",
            description: "",
            storeType: StoreType.MAPSTORE,
            outcome: undefined,
            outcomeMessage: "",
            url: "",
            errors: new Notifications(),
        };
    }

    private async submitNewGraph() {
        const errors: Notifications = new Notifications();
        const graphId = this.state.graphId;
        const description = this.state.description;
        const storeType = this.state.storeType;
        if (errors.isEmpty()) {
            try {
                await new CreateSimpleGraphRepo().create(graphId, description, storeType);
                this.setState({ outcome: AlertType.SUCCESS, outcomeMessage: `${graphId} was successfully added` });
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

    private resetForm() {
        this.setState({
            graphId: "",
            description: "",
        });
    }

    private disableSubmitButton(): boolean {
        return !this.state.graphId || !this.state.description;
    }

    private checkProxy(): boolean {
        return !(this.state.storeType === StoreType.PROXY_STORE);
    }

    public render() {
        return (
            <main>
                {this.state.outcome && (
                    <NotificationAlert alertType={this.state.outcome} message={this.state.outcomeMessage} />
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
                                    <Grid
                                        item
                                        xs={12}
                                        container
                                        direction="row"
                                        justify="flex-end"
                                        alignItems="center"
                                    ></Grid>
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
                                                <MenuItem value={StoreType.PROXY_STORE}>Proxy Store</MenuItem>
                                            </Select>
                                            <FormHelperText>Set to Map Store by default</FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            disabled={this.checkProxy()}
                                            id="proxy-url"
                                            label="Proxy URL"
                                            variant="outlined"
                                            value={this.state.url}
                                            fullWidth
                                            name="URL"
                                            autoComplete="url"
                                            onChange={(event) => {
                                                this.setState({
                                                    url: event.target.value,
                                                });
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </form>
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
