import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
    Button,
    Container,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Toolbar,
} from "@material-ui/core";
import RefreshOutlinedIcon from "@material-ui/icons/RefreshOutlined";
import { AlertType, NotificationAlert } from "../alerts/notification-alert";
import { GetAllNamespacesRepo } from "../../rest/repositories/get-all-namespaces-repo";

interface IState {
    namespaces: Array<string>;
    selectedRow: any;
    errorMessage: string;
}

export default class ClusterNamespaces extends React.Component<{}, IState> {
    constructor(props: Object) {
        super(props);
        this.state = {
            namespaces: [],
            selectedRow: "",
            errorMessage: "",
        };
    }

    public async componentDidMount() {
        this.getNamespaces();
    }

    private async getNamespaces() {
        try {
            const namespaces: Array<string> = await new GetAllNamespacesRepo().getAll();
            this.setState({ namespaces: namespaces, errorMessage: "" });
        } catch (e) {
            this.setState({ errorMessage: `Failed to get all namespaces. ${e.toString()}` });
        }
    }

    private classes: any = makeStyles({
        root: {
            width: "100%",
            marginTop: 40,
        },
        table: {
            minWidth: 650,
        },
    });

    public render() {
        const { namespaces, errorMessage } = this.state;

        return (
            <main aria-label="Cluster-Namespace-Page">
                {errorMessage && <NotificationAlert alertType={AlertType.FAILED} message={errorMessage} />}
                <Toolbar />
                <Grid container justify="center">
                    <Container maxWidth="sm">
                        <TableContainer>
                            <Table size="medium" className={this.classes.table} aria-label="Namespaces Table">
                                <TableHead>
                                    <TableRow style={{ background: "#F4F2F2" }}>
                                        <TableCell>Namespaces</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {namespaces.map((namespace: string, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell component="th" scope="row">
                                                {namespace}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                {namespaces.length === 0 && <caption>No Namespaces</caption>}
                            </Table>
                        </TableContainer>
                        <Grid container style={{ margin: 10 }} direction="row" justify="center" alignItems="center">
                            <Button
                                id="namespaces-refresh-button"
                                startIcon={<RefreshOutlinedIcon />}
                                onClick={async () => await this.getNamespaces()}
                                variant="contained"
                                color="primary"
                                className={this.classes.submit}
                            >
                                Refresh Table
                            </Button>
                        </Grid>
                    </Container>
                </Grid>
            </main>
        );
    }
}
