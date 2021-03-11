import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
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
} from '@material-ui/core';
import RefreshOutlinedIcon from '@material-ui/icons/RefreshOutlined';
import { AlertType, NotificationAlert } from '../alerts/notification-alert';

interface IState {
    selectedRow: any;
    errorMessage: string;
}

export default class ClusterNamespaces extends React.Component<{}, IState> {
    constructor(props: Object) {
        super(props);
        this.state = {
            selectedRow: '',
            errorMessage: '',
        };
    }


    private classes: any = makeStyles({
        root: {
            width: '100%',
            marginTop: 40,
        },
        table: {
            minWidth: 650,
        },
    });

    public render() {
        const {  errorMessage } = this.state;


        return (
            <main>
                {errorMessage && <NotificationAlert alertType={AlertType.FAILED} message={errorMessage} />}
                <Toolbar />
                <Grid container justify="center">
                    <Container component="main" maxWidth="sm">
                        <TableContainer>
                            <Table size="medium" className={this.classes.table} aria-label="Graphs Table">
                                <TableHead>
                                    <TableRow style={{ background: '#F4F2F2' }}>
                                        <TableCell>Name Space</TableCell>
                                        <TableCell align="right">Description</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Grid container style={{ margin: 10 }} direction="row" justify="center" alignItems="center">
                            <Button
                                id="view-graphs-refresh-button"
                                startIcon={<RefreshOutlinedIcon />}
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