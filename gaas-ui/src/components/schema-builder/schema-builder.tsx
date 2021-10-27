import React, { ReactElement } from "react"
import { Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, Box } from "@material-ui/core"
import AddType from "./add-type"
import AddEdge from "./add-edge"
import AddEntity from "./add-entity"
import ReactJson from "react-json-view"
import ClearIcon from "@material-ui/icons/Clear"
import { useImmerReducer } from "use-immer"
import { IElementsSchema } from "../../domain/elements-schema"
import { ITypesSchema } from "../../domain/types-schema"

interface IProps {
  onCreateSchema(schema: { types: ITypesSchema; elements: IElementsSchema }): void

  typesSchema: ITypesSchema
  elementsSchema: IElementsSchema
}

interface IState {
  openTypes: boolean
  openEdges: boolean
  openEntities: boolean
}

export default function SchemaBuilder(props: IProps): ReactElement {
  const { onCreateSchema, typesSchema, elementsSchema } = props
  const [types, setTypes] = React.useState(typesSchema.types)
  const [elements, setElements] = React.useState<IElementsSchema>({
    edges: castElementsToIElements(elementsSchema).edges,
    entities: castElementsToIElements(elementsSchema).entities
  })

  const initialState: IState = {
    openTypes: false,
    openEdges: false,
    openEntities: false
  }

  function castElementsToIElements(elementsObject: object): IElementsSchema {
    return elementsObject as IElementsSchema
  }

  function createSchemaSubmit() {
    onCreateSchema({
      types: { types: types },
      elements: {
        entities: elements.entities,
        edges: elements.edges
      }
    })
    dispatch({ type: "reset" })
  }

  function addSchemaBuilderReducer(draft: any, action: any) {
    switch (action.type) {
      case "handleClickCloseTypes":
        draft.openTypes = action.value
        return

      case "handleClickCloseEdges":
        draft.openEdges = action.value
        return

      case "handleClickCloseEntities":
        draft.openEntities = action.value
        return
    }
  }

  const [state, dispatch] = useImmerReducer(addSchemaBuilderReducer, initialState)

  return (
    <Grid container spacing={2} direction="column" id={"schema-builder-component"}>
      <Grid item container spacing={2} direction="row" alignItems="center" id={"add-schema-element-buttons"}>
        <Grid item>
          <Button data-testid="add-type-button" variant="outlined" onClick={(e) => dispatch({ type: "handleClickCloseTypes", value: true })} id={"add-type-button"}>
            Add Type
          </Button>
          <Dialog fullWidth maxWidth="xs" open={state.openTypes} onClose={(e) => dispatch({ type: "handleClickCloseTypes", value: false })} id={"add-type-dialog"} aria-labelledby="add-type-dialog">
            <IconButton id="close-add-type-button" onClick={(e) => dispatch({ type: "handleClickCloseTypes", value: false })}>
              <ClearIcon />
            </IconButton>
            <Box display="flex" alignItems="center" justifyContent="center">
              <DialogTitle id="add-type-dialog-title">{"Add Type"}</DialogTitle>
            </Box>

            <DialogContent>
              <AddType
                onAddType={(typesObject) => {
                  const updatedTypes = Object.assign(types, typesObject)
                  setTypes(updatedTypes)
                }}
              />
            </DialogContent>
          </Dialog>
        </Grid>
        <Grid item>
          <Button variant="outlined" onClick={(e) => dispatch({ type: "handleClickCloseEdges", value: true })} id={"add-edge-button"}>
            Add Edge
          </Button>
          <Dialog fullWidth maxWidth="xs" open={state.openEdges} onClose={(e) => dispatch({ type: "handleClickCloseEdges", value: false })} id={"add-edge-dialog"} aria-labelledby="add-edge-dialog">
            <Box display="flex" alignItems="center" justifyContent="center">
              <DialogTitle id="add-edge-dialog-title">{"Add Edge"}</DialogTitle>
            </Box>
            <DialogContent>
              <AddEdge
                onAddEdge={(edgeObject) => {
                  const updatedEdges = Object.assign(elements.edges, edgeObject)
                  setElements({ edges: updatedEdges, entities: elements.entities })
                }}
                types={Object.keys(types)}
              />
            </DialogContent>
          </Dialog>
        </Grid>
        <Grid item>
          <Button variant="outlined" onClick={(e) => dispatch({ type: "handleClickCloseEntities", value: true })} id={"add-entity-button"}>
            Add Entity
          </Button>
          <Dialog fullWidth maxWidth="xs" open={state.openEntities} onClose={(e) => dispatch({ type: "handleClickCloseEntities", value: false })} id={"add-entity-dialog"} aria-labelledby="add-entity-dialog">
            <Box display="flex" alignItems="center" justifyContent="center">
              <DialogTitle id="add-entity-dialog-title">{"Add Entity"}</DialogTitle>
            </Box>
            <DialogContent>
              <AddEntity
                onAddEntity={(entityObject) => {
                  const updatedEntities = Object.assign(elements.entities, entityObject)
                  setElements({ edges: elements.edges, entities: updatedEntities })
                }}
                types={Object.keys(types)}
              />
            </DialogContent>
          </Dialog>
        </Grid>
      </Grid>
      <Grid item>
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
      </Grid>
      <Box display="flex" alignItems="center" justifyContent="center">
        <Button variant="outlined" id={"create-schema-button"} name={"Create Schema"} onClick={createSchemaSubmit}>
          Create Schema
        </Button>
      </Box>
    </Grid>
  )
}
