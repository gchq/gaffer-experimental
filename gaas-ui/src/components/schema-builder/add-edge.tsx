import React, { ReactElement, useState } from 'react';
import {
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Box,
    Dialog,
    IconButton,
    DialogTitle,
    DialogContent,
} from '@material-ui/core';
import { useImmerReducer } from 'use-immer';
import ClearIcon from '@material-ui/icons/Clear';
import { arrayBuffer } from 'stream/consumers';
import AddProperty from './add-property';

interface IProps {
    onAddEdge(edge: object): void;

    types: Array<string>;
}

interface IState {
    edgeName: {
        value: string;
        hasErrors: boolean;
        message: string;
    };

    edgeDescription: {
        value: string;
        hasErrors: boolean;
        message: string;
    };

    edgeSource: {
        value: string;
        hasErrors: boolean;
    };

    edgeDestination: {
        value: string;
        hasErrors: boolean;
    };

    edgeDirected: {
        value: string;
        hasErrors: boolean;
    };
    edgeProperty: {
        key: string;
        value: string;
    };
    properties: {};
    inputs: Array<string>;
    openProperties: boolean;
}

export default function AddEdge(props: IProps): ReactElement {
    const { onAddEdge, types } = props;

    const [inputs, setInputs] = useState([{ value: '' }]);
    const [result, setResult] = useState({});
    function addEdgeSubmit() {
        const edgeToAdd: any = {};
        edgeToAdd[state.edgeName.value] = {
            description: state.edgeDescription.value,
            source: state.edgeSource.value,
            destination: state.edgeDestination.value,
            directed: state.edgeDirected.value,
            properties: state.properties,
        };
        onAddEdge(edgeToAdd);
        dispatch({ type: 'reset' });
    }

    const initialState: IState = {
        edgeName: {
            value: '',
            hasErrors: false,
            message: '',
        },

        edgeDescription: {
            value: '',
            hasErrors: false,
            message: '',
        },

        edgeSource: {
            value: '',
            hasErrors: false,
        },

        edgeDestination: {
            value: '',
            hasErrors: false,
        },

        edgeDirected: {
            value: '',
            hasErrors: false,
        },
        inputs: [],
        edgeProperty: {
            key: '',
            value: '',
        },
        properties: {},
        openProperties: false,
    };

    function addEdgeReducer(draft: any, action: any) {
        switch (action.type) {
            case 'reset':
                return initialState;

            case 'validateEdgeName':
                draft.edgeName.hasErrors = false;
                draft.edgeName.value = action.value;
                draft.edgeName.message = '';

                if (!/^[a-zA-Z]*$/.test(draft.edgeName.value)) {
                    draft.edgeName.hasErrors = true;
                    draft.edgeName.message = 'Edge name can only contain letters';
                }
                return;

            case 'validateEdgeDescription':
                draft.edgeDescription.hasErrors = false;
                draft.edgeDescription.value = action.value;
                draft.edgeDescription.message = '';

                if (draft.edgeDescription.value && !/^[a-zA-Z0-9\s]*$/.test(draft.edgeDescription.value)) {
                    draft.edgeDescription.hasErrors = true;
                    draft.edgeDescription.message =
                        'Edge description can only contain alpha numeric letters and spaces';
                }
                return;

            case 'validateEdgeSource':
                draft.edgeSource.hasErrors = false;
                draft.edgeSource.value = action.value;
                if (draft.edgeSource.value.length === 0) {
                    draft.edgeSource.hasErrors = true;
                }
                return;

            case 'validateEdgeDestination':
                draft.edgeDestination.hasErrors = false;
                draft.edgeDestination.value = action.value;
                if (draft.edgeDestination.value.length === 0) {
                    draft.edgeDestination.hasErrors = true;
                }
                return;

            case 'validateEdgeDirected':
                draft.edgeDirected.hasErrors = false;
                draft.edgeDirected.value = action.value;
                if (draft.edgeDirected.value.length === 0) {
                    draft.edgeDirected.hasErrors = true;
                }
                return;
            case 'addPropertyKey':
                draft.edgeProperty.key = action.value;
                return;
            case 'handleClickCloseProperties':
                draft.openProperties = action.value;
                return;
            case 'handleUpdateProperties':
                draft.properties[action.value.key] = action.value.value;
                return;
        }
    }

    const [state, dispatch] = useImmerReducer(addEdgeReducer, initialState);

    function disableAddEdgeButton(): boolean {
        return (
            state.edgeName.value.length === 0 ||
            state.edgeName.hasErrors ||
            state.edgeDescription.value.length === 0 ||
            state.edgeDescription.hasErrors ||
            state.edgeSource.value.length === 0 ||
            state.edgeDestination.value.length === 0 ||
            state.edgeDirected.value.length === 0
        );
    }

    function addHandler(key: any) {
        const _inputs = [...inputs];
        _inputs.push({ value: '' });
        setInputs(_inputs);
    }

    function deleteHandler(key: any) {
        const _inputs = inputs.filter((input, index) => index !== key);
        setInputs(_inputs);
    }

    function inputHandler(e: any, key: any) {
        console.log('text: ' + e);
        console.log('key: ' + key);
        const _inputs = [...inputs];
        _inputs[key].value = e;
        setInputs(_inputs);
    }

    return (
        <Grid container spacing={2} direction="column" id={'add-edge-inputs'}>
            <Grid item>
                <TextField
                    id={'edge-name-input'}
                    label={'Edge Name'}
                    aria-label="edge-name-input"
                    inputProps={{
                        name: 'Edge Name',
                        id: 'edge-name-input',
                        'aria-label': 'edge-name-input',
                    }}
                    name={'edge-name'}
                    value={state.edgeName.value}
                    variant="outlined"
                    fullWidth
                    error={state.edgeName.hasErrors}
                    required
                    onChange={(e) => dispatch({ type: 'validateEdgeName', value: e.target.value })}
                    helperText={state.edgeName.message}
                />
            </Grid>
            <Grid item>
                <TextField
                    id={'edge-description-input'}
                    label={'Description'}
                    aria-label="edge-description-input"
                    inputProps={{
                        name: 'Edge Description',
                        id: 'edge-description-input',
                        'aria-label': 'edge-description-input',
                    }}
                    name={'edge-description'}
                    value={state.edgeDescription.value}
                    variant="outlined"
                    fullWidth
                    error={state.edgeDescription.hasErrors}
                    required
                    onChange={(e) => dispatch({ type: 'validateEdgeDescription', value: e.target.value })}
                    helperText={state.edgeDescription.message}
                />
            </Grid>
            <Grid item>
                <FormControl variant="outlined" fullWidth id={'edge-source-formcontrol'}>
                    <InputLabel id="edge-source-select-label" required>
                        Source
                    </InputLabel>
                    <Select
                        labelId="edge-source-select-label"
                        id="edge-source-select"
                        label="Source"
                        value={state.edgeSource.value}
                        onChange={(e) => dispatch({ type: 'validateEdgeSource', value: e.target.value })}
                    >
                        {types.map((type: string) => (
                            <MenuItem
                                value={type}
                                aria-label={type + '-menu-item'}
                                id={type + '-menu-item'}
                                aria-labelledby={'source-select-label'}
                            >
                                {type}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item>
                <FormControl variant="outlined" fullWidth id={'edge-destination-formcontrol'}>
                    <InputLabel id="edge-destination-select-label" required>
                        Destination
                    </InputLabel>
                    <Select
                        labelId="edge-destination-select-label"
                        id="edge-destination-select"
                        label="Destination"
                        value={state.edgeDestination.value}
                        onChange={(e) => dispatch({ type: 'validateEdgeDestination', value: e.target.value })}
                    >
                        {types.map((type: string) => (
                            <MenuItem
                                value={type}
                                aria-label={type + '-menu-item'}
                                id={type + '-menu-item'}
                                aria-labelledby={'destination-select-label'}
                            >
                                {type}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item>
                <FormControl variant="outlined" fullWidth id={'edge-directed-formcontrol'}>
                    <InputLabel id="edge-directed-select-label" required>
                        Directed
                    </InputLabel>
                    <Select
                        labelId="edge-directed-select-label"
                        id="edge-directed-select"
                        label="Directed"
                        value={state.edgeDirected.value}
                        onChange={(e) => dispatch({ type: 'validateEdgeDirected', value: e.target.value })}
                    >
                        <MenuItem value={'true'}>True</MenuItem>
                        <MenuItem value={'false'}>False</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            <Grid item>
                <Button
                    variant="outlined"
                    onClick={(e) => dispatch({ type: 'handleClickCloseProperties', value: true })}
                    id={'add-properties-button'}
                >
                    Add Property
                </Button>
                <Dialog
                    fullWidth
                    maxWidth="xs"
                    open={state.openProperties}
                    onClose={(e) => dispatch({ type: 'handleClickCloseProperties', value: false })}
                    id={'add-properties-dialog'}
                    aria-labelledby="add-properties-dialog"
                >
                    <Box display="flex" alignItems="right" justifyContent="right">
                        <IconButton
                            id="close-add-properties-button"
                            onClick={(e) => dispatch({ type: 'handleClickCloseProperties', value: false })}
                        >
                            <ClearIcon />
                        </IconButton>
                    </Box>

                    <Box display="flex" alignItems="center" justifyContent="center">
                        <DialogTitle id="add-properties-dialog-title">{'Add Property'}</DialogTitle>
                    </Box>
                    <DialogContent>
                        <AddProperty
                            onAddProperty={(properties) =>
                                dispatch({ type: 'handleUpdateProperties', value: properties })
                            }
                        />
                    </DialogContent>
                </Dialog>
            </Grid>

            <Box display="flex" alignItems="center" justifyContent="center">
                <Button
                    id={'add-edge-button'}
                    name={'Add Edge'}
                    variant="outlined"
                    disabled={disableAddEdgeButton()}
                    onClick={addEdgeSubmit}
                >
                    Add Edge
                </Button>
            </Box>
        </Grid>
    );
}
