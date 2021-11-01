import React, { ReactElement } from "react"
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Box } from "@material-ui/core"
import { useImmerReducer } from "use-immer"

interface IProps {
  onAddEntity(entity: object): void

  types: Array<string>
}
interface IState {
  entityName: {
    value: string
    hasErrors: boolean
    message: string
  }
  entityDescription: {
    value: string
    hasErrors: boolean
    message: string
  }
  entityVertex: {
    value: string
    hasErrors: boolean
  }
}

export default function AddEntity(props: IProps): ReactElement {
  const { onAddEntity, types } = props

  function addEntitySubmit() {
    const entityToAdd: any = {}
    entityToAdd[state.entityName.value] = {
      description: state.entityDescription.value,
      vertex: state.entityVertex.value
    }
    onAddEntity(entityToAdd)
    dispatch({ type: "reset" })
  }

  const initialState: IState = {
    entityName: {
      value: "",
      hasErrors: false,
      message: ""
    },

    entityDescription: {
      value: "",
      hasErrors: false,
      message: ""
    },

    entityVertex: {
      value: "",
      hasErrors: false
    }
  }

  function addEntityReducer(draft: any, action: any) {
    switch (action.type) {
      case "reset":
        return initialState

      case "validateEntityName":
        draft.entityName.hasErrors = false
        draft.entityName.value = action.value
        draft.entityName.message = ""
        if (draft.entityName.value && !/^[a-zA-Z]*$/.test(draft.entityName.value)) {
          draft.entityName.hasErrors = true
          draft.entityName.message = "Entity name can only contain letters"
        }
        return

      case "validateEntityDescription":
        draft.entityDescription.hasErrors = false
        draft.entityDescription.value = action.value
        draft.entityDescription.message = ""
        if (draft.entityDescription.value && !/^[a-zA-Z0-9\s]*$/.test(draft.entityDescription.value)) {
          draft.entityDescription.hasErrors = true
          draft.entityDescription.message = "Entity description can only contain alpha numeric letters and spaces"
        }
        return

      case "validateEntityVertex":
        draft.entityVertex.hasErrors = false
        draft.entityVertex.value = action.value
        if (draft.entityVertex.value.length === 0) {
          draft.entityVertex.hasErrors = true
        }
        return
    }
  }

  const [state, dispatch] = useImmerReducer(addEntityReducer, initialState)

  function disableAddEntityButton(): boolean {
    return state.entityName.value.length === 0 || state.entityName.hasErrors || state.entityDescription.value.length === 0 || state.entityDescription.hasErrors || state.entityVertex.value.length === 0 || state.entityVertex.hasErrors
  }

  return (
    <Grid container spacing={2} direction="column" id={"add-entity-inputs"}>
      <Grid item>
        <TextField
          value={state.entityName.value}
          id={"entity-name-input"}
          label={"Entity Name"}
          aria-label="entity-name-input"
          inputProps={{
            name: "Entity Name",
            id: "entity-name-input",
            "aria-label": "entity-name-input"
          }}
          variant="outlined"
          fullWidth
          name={"entity-name"}
          error={state.entityName.hasErrors}
          required
          autoFocus
          onChange={(e) => dispatch({ type: "validateEntityName", value: e.target.value })}
          helperText={state.entityName.message}
        />
      </Grid>
      <Grid item>
        <TextField
          id={"entity-description-input"}
          value={state.entityDescription.value}
          label={"Description"}
          aria-label="entity-description-input"
          inputProps={{
            name: "Entity Description",
            id: "entity-description-input",
            "aria-label": "entity-description-input"
          }}
          variant="outlined"
          fullWidth
          name={"entity-description"}
          error={state.entityDescription.hasErrors}
          required
          autoFocus
          onChange={(e) => dispatch({ type: "validateEntityDescription", value: e.target.value })}
          helperText={state.entityDescription.message}
        />
      </Grid>
      <Grid item>
        <FormControl variant="outlined" fullWidth id={"entity-vertex-formcontrol"} required>
          <InputLabel id="entity-vertex-select-label">Vertex</InputLabel>
          <Select
            labelId="entity-vertex-select-label"
            id="entity-vertex-select"
            label="Vertex"
            value={state.entityVertex.value}
            inputProps={{
              name: "Vertex",
              id: "entity-vertex-input",
              "aria-label": "entity-vertex-input"
            }}
            onChange={(e) => dispatch({ type: "validateEntityVertex", value: e.target.value })}
          >
            {types.map((type: string) => (
              <MenuItem value={type} aria-label={type + "-menu-item"} id={type + "-menu-item"} aria-labelledby={"vertex-select-label"}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Box display="flex" alignItems="center" justifyContent="center">
        <Button variant="outlined" id={"add-entity-button"} name={"Add Entity"} disabled={disableAddEntityButton()} onClick={addEntitySubmit}>
          Add Entity
        </Button>
      </Box>
    </Grid>
  )
}
