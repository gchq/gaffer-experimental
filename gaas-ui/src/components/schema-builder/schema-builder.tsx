import React, {ReactElement} from "react";
import {Button, Dialog, DialogContent, DialogTitle, Grid, IconButton} from "@material-ui/core";
import AddType from "./add-type";
import AddEdge from "./add-edge";
import AddEntity from "./add-entity";
import ReactJson from "react-json-view";
import ClearIcon from "@material-ui/icons/Clear";
import {useImmerReducer} from "use-immer";
import { IElements } from "../../domain/elements-schema";

interface IProps {
    onCreateTypesSchema(typesSchema: object): void;

    typesSchema: object;
    elementsSchema: object;
}

export default function SchemaBuilder(props: IProps): ReactElement {
    const {onCreateTypesSchema, typesSchema, elementsSchema} = props;
    const [types, setTypes] = React.useState(typesSchema);
    const [elements, setElements] = React.useState<IElements>({
        edges:castElementsToIElements(elementsSchema).edges,
        entities:castElementsToIElements(elementsSchema).entities,
    });



    const initialState = {
        openTypes: false,
        openEdges: false,
        openEntities: false
    };

    function castElementsToIElements(elementsObject: object): IElements{
        return elementsObject as IElements

    }

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
                                const updatedEdges = Object.assign(elements.edges, edgeObject);
                                setElements({edges:updatedEdges, entities:elements.entities})
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
                                const updatedEntities = Object.assign(elements.entities, entityObject);
                                setElements({edges:elements.edges, entities:updatedEntities})
                            }} types={Object.keys(typesSchema)}/>
                        </DialogContent>
                    </Dialog>
                </Grid>
            </Grid>
            <Grid id={"json-types-schema-viewer"}>
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
            <Grid id={"json-elements-schema-viewer"}>
                <ReactJson
                    src={elements}
                    name={null}
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
            <Grid>
                <Button id={"create-schema-button"} name={"Create Schema"} color="primary"
                >
                    Create Schema
                </Button>
            </Grid>
        </Grid>
    );
}
