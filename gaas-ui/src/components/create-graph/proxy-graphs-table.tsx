import React, { ReactElement } from 'react';
import {
    Checkbox,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@material-ui/core';
import { Graph } from '../../domain/graph';

interface IProps {
    hide: boolean;
    graphs: Graph[];
    selectedGraphs: string[];
    onClickCheckbox(selectedGraphs: string[]): void;
}

export default function ProxyGraphsTable(props: IProps): ReactElement {
    const { hide, graphs, selectedGraphs, onClickCheckbox }: IProps = props;

    return (
        <>
            {!hide && (
                <TableContainer id={'proxy-graphs-table'}>
                    <InputLabel aria-label="proxy-graphs-table-label">Proxy Graphs Table</InputLabel>
                    <Table size="medium" aria-label="Proxy Graphs Table">
                        <TableHead>
                            <TableRow style={{ background: '#F4F2F2' }}>
                                <TableCell component="th">Graph ID</TableCell>
                                <TableCell align="center">Description</TableCell>
                                <TableCell align="center">Type</TableCell>
                                <TableCell align="right">
                                    <Checkbox
                                        inputProps={{
                                            name: 'checkbox all',
                                            id: 'all-checkbox',
                                            'aria-label': 'all-checkbox',
                                        }}
                                        checked={graphs.length > 0 && selectedGraphs.length === graphs.length}
                                        onChange={(event) =>
                                            onClickCheckbox(
                                                event.target.checked ? graphs.map((graph) => graph.getId()) : []
                                            )
                                        }
                                    />{' '}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {graphs
                                .filter((graph) => graph.getStatus() === 'UP')
                                .map((graph) => (
                                    <TableRow key={graph.getId()} hover>
                                        <TableCell scope="row">{graph.getId()}</TableCell>
                                        <TableCell align="center">{graph.getDescription()}</TableCell>
                                        <TableCell>{graph.getType()}</TableCell>
                                        <TableCell align="right" id={`${graph.getId()}-checkbox-cell`}>
                                            <Checkbox
                                                inputProps={{
                                                    name: 'checkbox' + graph.getId(),
                                                    id: 'checkbox' + graph.getId(),
                                                    'aria-label': 'checkbox' + graph.getId(),
                                                }}
                                                id={`${graph.getId()}-checkbox`}
                                                required
                                                checked={selectedGraphs.includes(graph.getId())}
                                                onChange={(event) => {
                                                    if (event.target.checked) {
                                                        selectedGraphs.push(graph.getId());
                                                        onClickCheckbox(selectedGraphs);
                                                    } else {
                                                        onClickCheckbox(
                                                            selectedGraphs.filter(
                                                                (graphId) => graphId !== graph.getId()
                                                            )
                                                        );
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
            )}
        </>
    );
}
