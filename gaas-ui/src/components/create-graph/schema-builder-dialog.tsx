import * as React from "react"
import { Button, Dialog, DialogContent, DialogTitle, Box } from "@material-ui/core"
import SchemaBuilder from "../schema-builder/schema-builder"
import { ITypesSchema } from "../../domain/types-schema"
import { IElementsSchema } from "../../domain/elements-schema"

interface IProps {
  onCreateSchema(schema: { types: ITypesSchema; elements: IElementsSchema }): void

  typesSchema: ITypesSchema
  elementsSchema: IElementsSchema
}

export default function SchemaBuilderDialog(props: IProps) {
  const { onCreateSchema, typesSchema, elementsSchema } = props
  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen} id={"schema-builder-button"}>
        Schema Builder
      </Button>
      <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose} id={"schema-builder-dialog"} aria-labelledby="schema-builder-dialog">
        <Box display="flex" alignItems="center" justifyContent="center">
          <DialogTitle id="schema-builder-dialog-title">{"Schema Builder"}</DialogTitle>
        </Box>
        <DialogContent>
          <SchemaBuilder
            elementsSchema={elementsSchema}
            onCreateSchema={(schema) => {
              onCreateSchema(schema)
            }}
            typesSchema={typesSchema}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
