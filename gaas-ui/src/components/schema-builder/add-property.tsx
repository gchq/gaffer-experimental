import { Box, Button, Grid, TextField } from '@material-ui/core';
import React, { ReactElement, useState } from 'react';
import { useImmerReducer } from 'use-immer';

interface IProps {
    onAddProperty(properties: object): void;
}
interface IState {
    property: {
        key: string;
        value: string;
        hasErrors: boolean;
    };
    // key: string;
    // value: string;
    // hasErrors: boolean;
}
export default function AddProperty(props: IProps): ReactElement {
    const { onAddProperty } = props;

    const initialState: IState = {
        property: {
            value: '',
            key: '',
            hasErrors: false,
        },
        // value: '',
        // key: '',
        // hasErrors: false,
        // },
    };

    function addPropertySubmit() {
        onAddProperty(state.property);
        dispatch({ type: 'reset' });
    }

    function addEdgeReducer(draft: any, action: any) {
        switch (action.type) {
            case 'reset':
                return initialState;
            case 'validatePropertyKey':
                draft.property.hasErrors = false;
                draft.property.key = action.value;
                return;
            case 'validatePropertyValue':
                draft.property.hasErrors = false;
                draft.property.value = action.value;
                return;
        }
    }
    const [state, dispatch] = useImmerReducer(addEdgeReducer, initialState);

    return (
        <Grid container spacing={2} direction="column" id={'add-property-inputs'}>
            <Grid item>
                <TextField
                    id={'property-key-input'}
                    label={'Property Key'}
                    aria-label="property-key-input"
                    inputProps={{
                        name: 'Property Key',
                        id: 'property-key-input',
                        'aria-label': 'property-key-input',
                    }}
                    name={'property-key'}
                    value={state.property.key}
                    variant="outlined"
                    fullWidth
                    error={state.property.hasErrors}
                    required
                    onChange={(e) => dispatch({ type: 'validatePropertyKey', value: e.target.value })}
                />
            </Grid>
            <Grid item>
                <TextField
                    id={'property-value-input'}
                    label={'Property Value'}
                    aria-label="property-value-input"
                    inputProps={{
                        name: 'Property Value',
                        id: 'edge-description-input',
                        'aria-label': 'edge-description-input',
                    }}
                    name={'edge-description'}
                    value={state.property.value}
                    variant="outlined"
                    fullWidth
                    error={state.property.hasErrors}
                    required
                    onChange={(e) => dispatch({ type: 'validatePropertyValue', value: e.target.value })}
                />
            </Grid>
            <Box display="flex" alignItems="center" justifyContent="center">
                <Button
                    id={'add-edge-button'}
                    name={'Add Edge'}
                    variant="outlined"
                    //disabled={disableAddEdgeButton()}
                    onClick={addPropertySubmit}
                >
                    Add Edge
                </Button>
            </Box>
        </Grid>
    );
}
