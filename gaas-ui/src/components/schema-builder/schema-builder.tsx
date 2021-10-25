import React, {ReactElement} from "react";
import {Button, Dialog, DialogContent, DialogTitle, Grid, IconButton} from "@material-ui/core";
import AddType from "./add-type";
import AddEdge from "./add-edge";
import AddEntity from "./add-entity";
import ReactJson from "react-json-view";
import ClearIcon from "@material-ui/icons/Clear";
import {useImmerReducer} from "use-immer";

interface IProps {
    onCreateTypesSchema(typesSchema: object): void;

    typesSchema: object;
    elements: object;
}

export default function SchemaBuilder(props: IProps): ReactElement {
    const {onCreateTypesSchema, typesSchema} = props;
    const [types, setTypes] = React.useState(typesSchema);

    const initialState = {
        openTypes: false,
        openEdges: false,
        openEntities: false
    };

    function addSchemaBuilderReducer(draft: any, action: any) {
        switch (action.type) {
        case "handleClickCloseTypes":
            draft.openTypes = action.value;
            return;

        case "handleClickCloseEdges":
            draft.openEdges = action.value;
            return;

        case "handleClickCloseEntities":
            draft.openEntities = action.value;
            return;
        }
    }

    const [state, dispatch] = useImmerReducer(addSchemaBuilderReducer, initialState);

    return (
        <Grid id={"schema-builder-component"}>
            <Grid item direction="row" justify="center" alignItems="center" id={"add-schema-element-buttons"}>
                <Grid item>
                    <Button data-testid="add-type-button" variant="outlined"
                            onClick={(e) => dispatch({type: "handleClickCloseTypes", value: true})}
                            id={"add-type-button"}>
                        Add Type
                    </Button>
                    <Dialog open={state.openTypes}
                            onClose={(e) => dispatch({type: "handleClickCloseTypes", value: false})}
                            id={"add-type-dialog"} aria-labelledby="add-type-dialog">
                        <IconButton id="close-add-type-button"
                                    onClick={(e) => dispatch({type: "handleClickCloseTypes", value: false})}>
                            <ClearIcon/>
                        </IconButton>
                        <DialogTitle id="add-type-dialog-title">{"Add Type"}</DialogTitle>
                        <DialogContent>
                            <AddType
                                onAddType={(typesObject) => {
                                    const updatedTypes = Object.assign(types, typesObject);
                                    setTypes(updatedTypes);
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </Grid>
                <Grid item>
                    <Button variant="outlined" onClick={(e) => dispatch({type: "handleClickCloseEdges", value: true})}
                            id={"add-edge-button"}>
                        Add Edge
                    </Button>
                    <Dialog open={state.openEdges}
                            onClose={(e) => dispatch({type: "handleClickCloseEdges", value: false})}
                            id={"add-edge-dialog"} aria-labelledby="add-edge-dialog">
                        <DialogTitle id="add-edge-dialog-title">{"Add Edge"}</DialogTitle>
                        <DialogContent>
                            <AddEdge onAddEdge={(edgeObject) => {

                            }}
                                types={Object.keys(typesSchema)}/>
                        </DialogContent>
                    </Dialog>
                </Grid>
                <Grid item>
                    <Button variant="outlined"
                            onClick={(e) => dispatch({type: "handleClickCloseEntities", value: true})}
                            id={"add-entity-button"}>
                        Add Entity
                    </Button>
                    <Dialog open={state.openEntities}
                            onClose={(e) => dispatch({type: "handleClickCloseEntities", value: false})}
                            id={"add-entity-dialog"} aria-labelledby="add-entity-dialog">
                        <DialogTitle id="add-entity-dialog-title">{"Add Entity"}</DialogTitle>
                        <DialogContent>
                            <AddEntity onAddEntity={(entityObject) => {
                            }} types={Object.keys(typesSchema)}/>
                        </DialogContent>
                    </Dialog>
                </Grid>
            </Grid>
            <Grid id={"json-schema-viewer"}>
                <ReactJson
                    src={types}
                    name={"types"}
                    theme="bright"
                    // onEdit={(event) => {
                    //     this.setState({ typesSchema: event.updated_src });
                    //     console.log(this.state.typesSchema);
                    // }}
                    // onDelete={(event) => {
                    //     this.setState({ typesSchema: event.updated_src });
                    // }}
                    displayDataTypes={false}
                    displayObjectSize={false}
                    collapsed={false}
                />
            </Grid>
        </Grid>
    );
}
