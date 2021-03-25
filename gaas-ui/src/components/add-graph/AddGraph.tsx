import {
    Button, Container, CssBaseline, Dialog, DialogContent, Grid,
    IconButton, makeStyles, Slide, TextField, Tooltip, Zoom
} from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import { TransitionProps } from '@material-ui/core/transitions';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import ClearIcon from '@material-ui/icons/Clear';
import { DropzoneArea } from 'material-ui-dropzone';
import React from 'react';
import { ElementsSchema } from '../../domain/elements-schema';
import { Notifications } from '../../domain/notifications';
import { TypesSchema } from '../../domain/types-schema';
import { CreateGraphRepo } from '../../rest/repositories/create-graph-repo';
import { AlertType, NotificationAlert } from '../alerts/notification-alert';

interface IState {
    dialogIsOpen: boolean;
    elementsFiles: Array<File>;
    typesFiles: Array<File>;
    typesFieldDisabled: boolean;
    elementsFieldDisabled: boolean;
    newGraph: {
        graphName: string;
        schemaJson: string;
    };
    outcome: AlertType | undefined;
    outcomeMessage: string;
    errors: Notifications;
    elements: string;
    types: string;
}

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>
) {
    return <Slide direction='up' ref={ref} {...props} />;
});

export default class AddGraph extends React.Component<{}, IState> {
    constructor(props: object) {
        super(props);
        this.state = {
            dialogIsOpen: false,
            elementsFieldDisabled: false,
            typesFieldDisabled: false,
            elementsFiles: [],
            typesFiles: [],
            newGraph: {
                graphName: '',
                schemaJson: '',
            },
            outcome: undefined,
            outcomeMessage: '',
            errors: new Notifications(),
            elements: '',
            types: '',
        };
    }

    private async submitNewGraph() {
        const { graphName } = this.state.newGraph;
        const elements = new ElementsSchema(this.state.elements);
        const types = new TypesSchema(this.state.types);
        const errors: Notifications = elements.validate();
        errors.concat(types.validate());

        if (errors.isEmpty()) {
            try {
                await new CreateGraphRepo().create(graphName, [], elements, types);
                this.setState({ outcome: AlertType.SUCCESS, outcomeMessage: `${graphName} was successfully added` });
                this.resetForm();
            } catch (e) {
                this.setState({
                    outcome: AlertType.FAILED,
                    outcomeMessage: `Failed to Add '${graphName}' Graph. ${e.toString()}`,
                });
            }
        } else {
            this.setState({ errors });
        }
    }

    private resetForm() {
        this.setState({
            elementsFiles: [],
            typesFiles: [],
            newGraph: {
                graphName: '',
                schemaJson: '',
            },
            elements: '',
            types: '',
        });
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

    private disableSubmitButton(): boolean {
        return !this.state.elements || !this.state.types || !this.state.newGraph.graphName;
    }

    public render() {
        const openDialogBox = () => {
            this.setState({ dialogIsOpen: true });
        };
        const closeDialogBox = () => {
            this.setState({ dialogIsOpen: false });
        };

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

                <Grid container justify='center'>
                    <Container component='main' maxWidth='xs'>
                        <CssBaseline />
                        <div className={this.classes.paper}>
                            <form className={this.classes.form} noValidate>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            id='graph-name'
                                            label='Graph Name'
                                            variant='outlined'
                                            value={this.state.newGraph.graphName}
                                            required
                                            fullWidth
                                            name='graphName'
                                            autoComplete='graph-name'
                                            onChange={(event) => {
                                                this.setState({
                                                    newGraph: {
                                                        ...this.state.newGraph,
                                                        graphName: event.target.value,
                                                    },
                                                });
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} container direction='row' justify='flex-end' alignItems='center'>
                                        <Tooltip TransitionComponent={Zoom} title='Add Schema From File'>
                                            <IconButton id='attach-file-button' onClick={openDialogBox}>
                                                <AttachFileIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip TransitionComponent={Zoom} title='Clear Schema'>
                                            <IconButton
                                                onClick={() =>
                                                    this.setState({
                                                        newGraph: {
                                                            ...this.state.newGraph,
                                                            schemaJson: '',
                                                        },
                                                    })
                                                }
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Dialog
                                            id='dropzone'
                                            open={this.state.dialogIsOpen}
                                            TransitionComponent={Transition}
                                            keepMounted
                                            onClose={closeDialogBox}
                                            style={{ minWidth: '500px' }}
                                            aria-labelledby='alert-dialog-slide-title'
                                            aria-describedby='alert-dialog-slide-description'
                                        >
                                            <Grid container direction='row' justify='flex-end' alignItems='flex-start'>
                                                <IconButton id='close-dropzone-button' onClick={closeDialogBox}>
                                                    <ClearIcon />
                                                </IconButton>
                                            </Grid>

                                            <DialogContent>
                                                <Grid id='elements-drop-zone'>
                                                    <DropzoneArea
                                                        showPreviews={true}
                                                        onChange={async (files) => this.uploadElementsFiles(files)}
                                                        showPreviewsInDropzone={false}
                                                        dropzoneText='Drag and drop elements.JSON'
                                                        useChipsForPreview
                                                        previewGridProps={{
                                                            container: { spacing: 1, direction: 'row' },
                                                        }}
                                                        previewChipProps={{
                                                            classes: { root: this.classes.previewChip },
                                                        }}
                                                        previewText='Selected files'
                                                        clearOnUnmount={true}
                                                        acceptedFiles={['application/json']}
                                                        filesLimit={1}
                                                    />
                                                </Grid>
                                                <Grid id='types-drop-zone'>
                                                    <DropzoneArea
                                                        showPreviews={true}
                                                        onChange={async (files) => this.uploadTypesFiles(files)}
                                                        showPreviewsInDropzone={false}
                                                        dropzoneText='Drag and drop types.JSON'
                                                        useChipsForPreview
                                                        previewGridProps={{
                                                            container: { spacing: 1, direction: 'row' },
                                                        }}
                                                        previewChipProps={{
                                                            classes: { root: this.classes.previewChip },
                                                        }}
                                                        previewText='Selected files'
                                                        clearOnUnmount={true}
                                                        acceptedFiles={['application/json']}
                                                        filesLimit={1}
                                                    />
                                                </Grid>
                                            </DialogContent>
                                        </Dialog>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            id='schema-elements'
                                            style={{ width: 400 }}
                                            value={this.state.elements}
                                            label='Schema Elements JSON'
                                            disabled={this.state.elementsFieldDisabled}
                                            required
                                            multiline
                                            rows={5}
                                            name='schema-elements'
                                            variant='outlined'
                                            onChange={(event) => {
                                                this.setState({
                                                    elements: event.target.value,
                                                });
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            id='schema-types'
                                            style={{ width: 400 }}
                                            value={this.state.types}
                                            disabled={this.state.typesFieldDisabled}
                                            name='schema-types'
                                            label='Schema Types JSON'
                                            required
                                            multiline
                                            rows={5}
                                            variant='outlined'
                                            onChange={(event) => {
                                                this.setState({
                                                    types: event.target.value,
                                                });
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </form>
                        </div>
                    </Container>
                    <Grid container style={{ margin: 10 }} direction='row' justify='center' alignItems='center'>
                        <Button
                            id='add-new-graph-button'
                            onClick={() => {
                                this.submitNewGraph();
                            }}
                            startIcon={<AddCircleOutlineOutlinedIcon />}
                            type='submit'
                            variant='contained'
                            color='primary'
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
            width: '100%',
            marginTop: 40,
        },
        paper: {
            marginTop: theme.spacing(2),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        avatar: {
            margin: theme.spacing(1),
            backgroundColor: theme.palette.secondary.main,
        },
        form: {
            width: '100%', // Fix IE 11 issue.
            marginTop: theme.spacing(3),
        },
        submit: {
            margin: theme.spacing(3, 0, 2),
        },
        button: {
            margin: '10px',
        },
        previewChip: {
            minWidth: 160,
            maxWidth: 210,
        },
    }));
}
