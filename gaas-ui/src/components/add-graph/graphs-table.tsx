import React, {ReactElement} from "react";
import {
    Button, Checkbox,
    FormHelperText,
    Grid,
    Table, TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField
} from "@material-ui/core";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import {Graph} from "../../domain/graph";

interface IProps {
    hide: boolean;
    onChangeProxyURL (proxyURL: string): void;
    proxyURL: string;
    onClickAddProxyURL (proxyURL: string): void;
    graphs: Graph[];
}

export default function GraphsTable(props: IProps): ReactElement {
    const {
        hide,
        onChangeProxyURL,
        proxyURL,
        onClickAddProxyURL,
        graphs
    }= props;

    return (
        <>
        {!hide &&
        <div id={"graphs-table"}>
            <Grid item xs={12} id={"proxy-url-grid"}>
                <TextField
                    id="proxy-url"
                    label="Proxy URL"
                    variant="outlined"
                    value={proxyURL}
                    fullWidth
                    name="proxy-url"
                    autoComplete="proxy-url"
                    onChange={(event) => {
                        onChangeProxyURL(event.target.value)
                    }}
                />
                <FormHelperText>
                    Enter URL for proxy store if not shown below
                </FormHelperText>
            </Grid>
            <Grid
                id="proxy-button-grid"
                container
                style={{margin: 10}}
                direction="row"
                justify="center"
                alignItems="center"
            >
                <Button
                    id="add-new-proxy-button"
                    onClick={() => onClickAddProxyURL(proxyURL)}
                    startIcon={<AddCircleOutlineOutlinedIcon/>}
                    type="submit"
                    variant="contained"
                    color="primary"
                    // disabled={this.disableProxyButton()}
                >
                    Add Proxy Graph
                </Button>
            </Grid>
            {/*<Grid*/}
            {/*    item*/}
            {/*    xs={12}*/}
            {/*    container*/}
            {/*    direction="row"*/}
            {/*    justify="flex-end"*/}
            {/*    alignItems="center"*/}
            {/*></Grid>*/}
            {/*<TableContainer>*/}
            {/*    <Table*/}
            {/*        size="medium"*/}
            {/*        className={this.classes.table}*/}
            {/*        aria-label="Graphs Table"*/}
            {/*    >*/}
            {/*        <TableHead>*/}
            {/*            <TableRow style={{background: "#F4F2F2"}}>*/}
            {/*                <TableCell component="th">Graph ID</TableCell>*/}
            {/*                <TableCell align="center">Description</TableCell>*/}
            {/*                <TableCell align="right">*/}
            {/*                    <Checkbox*/}
            {/*                        checked={*/}
            {/*                            this.state.graphs.length > 0 &&*/}
            {/*                            this.state.proxyStores.length ===*/}
            {/*                            this.state.graphs.length*/}
            {/*                        }*/}
            {/*                        onChange={(event) => {*/}
            {/*                            if (event.target.checked) {*/}
            {/*                                this.setState({*/}
            {/*                                    proxyStores: this.state.graphs,*/}
            {/*                                });*/}
            {/*                            } else {*/}
            {/*                                this.setState({proxyStores: []});*/}
            {/*                            }*/}
            {/*                        }}*/}
            {/*                    />{" "}*/}
            {/*                </TableCell>*/}
            {/*            </TableRow>*/}
            {/*        </TableHead>*/}

            {/*        <TableBody>*/}
            {/*            {graphs.map((graph: Graph) => (*/}
            {/*                <TableRow key={graph.getId()} hover>*/}
            {/*                    <TableCell scope="row">{graph.getId()}</TableCell>*/}
            {/*                    <TableCell align="center">*/}
            {/*                        {graph.getDescription()}*/}
            {/*                    </TableCell>*/}
            {/*                    <TableCell*/}
            {/*                        align="right"*/}
            {/*                        id={`${graph.getId()}-checkbox-cell`}*/}
            {/*                    >*/}
            {/*                        <Checkbox*/}
            {/*                            id={`${graph.getId()}-checkbox`}*/}
            {/*                            required*/}
            {/*                            checked={this.checkSelections(graph)}*/}
            {/*                            onChange={(event) => {*/}
            {/*                                if (*/}
            {/*                                    event.target.checked &&*/}
            {/*                                    !this.state.proxyStores.includes(graph)*/}
            {/*                                ) {*/}
            {/*                                    this.setState({*/}
            {/*                                        proxyStores: [*/}
            {/*                                            ...this.state.proxyStores,*/}
            {/*                                            graph,*/}
            {/*                                        ],*/}
            {/*                                    });*/}
            {/*                                } else {*/}
            {/*                                    const tempProxyStore = this.state.proxyStores.filter(*/}
            {/*                                        (obj) => obj.getId() !== graph.getId()*/}
            {/*                                    );*/}
            {/*                                    this.setState({*/}
            {/*                                        proxyStores: tempProxyStore,*/}
            {/*                                    });*/}
            {/*                                }*/}
            {/*                            }}*/}
            {/*                        />*/}
            {/*                    </TableCell>*/}
            {/*                </TableRow>*/}
            {/*            ))}*/}
            {/*        </TableBody>*/}
            {/*        {graphs.length === 0 && <caption>No Graphs.</caption>}*/}
            {/*    </Table>*/}
            {/*</TableContainer>*/}
        </div>

        }
        </>
    );

}