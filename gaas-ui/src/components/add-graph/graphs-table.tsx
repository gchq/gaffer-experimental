import React, {ReactElement} from "react";
import {Checkbox, Grid, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {Graph} from "../../domain/graph";

interface IProps {
    hide: boolean;
    graphs: Graph[];
    selectedGraphs: string[];
    onClickCheckbox (selectedGraphs: string[]): void;
}
export default function GraphsTable(props: IProps): ReactElement {
    const {
        hide,
        graphs,
        selectedGraphs,
        onClickCheckbox
    } = props;
    return (

        <>
            {!hide &&(
                <TableContainer id={"graphs-table"}>
                    <Table
                        size="medium"
                        aria-label="Graphs Table"
                    >
                        <TableHead>
                            <TableRow style={{ background: "#F4F2F2" }}>
                                <TableCell component="th">Graph ID</TableCell>
                                <TableCell align="center">Description</TableCell>
                                <TableCell align="center">Type</TableCell>
                                <TableCell align="right">
                                    <Checkbox
                                        checked={
                                            graphs.length > 0 &&
                                            selectedGraphs.length ===
                                            graphs.length
                                        }
                                        // onChange={(event) => {
                                        //     if (event.target.checked) {
                                        //         this.setState({
                                        //             proxyStores: this.state.graphs,
                                        //         });
                                        //     } else {
                                        //         this.setState({ proxyStores: [] });
                                        //     }
                                        // }}
                                    />{" "}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {graphs.map((graph) => (
                                <TableRow key={graph.getId()} hover>
                                    <TableCell scope="row">{graph.getId()}</TableCell>
                                    <TableCell align="center">
                                        {graph.getDescription()}
                                    </TableCell>
                                    <TableCell>
                                        {graph.getType()}
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        id={`${graph.getId()}-checkbox-cell`}
                                    >
                                        <Checkbox
                                            id={`${graph.getId()}-checkbox`}
                                            required
                                            checked={selectedGraphs.includes(graph.getId())}
                                            onChange={(event) => {
                                                if(event.target.checked){
                                                    selectedGraphs.push(graph.getId());
                                                    onClickCheckbox(selectedGraphs);
                                                }
                                                else {
                                                    onClickCheckbox(selectedGraphs.filter(
                                                        (graphId) => graphId !== graph.getId()
                                                    ))}}

                                                }

                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        {graphs.length === 0 && <caption>No Graphs.</caption>}
                    </Table>
                </TableContainer>
            )}
        </>
    );
}