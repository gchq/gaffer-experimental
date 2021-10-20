import React, {ReactElement} from "react";
import {Button, Dialog, DialogContent, DialogTitle, Grid} from "@material-ui/core";
import AddType from "./add-type";
import AddEdge from "./add-edge";
import AddEntity from "./add-entity";
interface IProps {

}
export default function SchemaBuilder(props: IProps): ReactElement{
    const [openTypes, setOpenTypes] = React.useState(false);
    const [openEdges, setOpenEdges] = React.useState(false);
    const [openEntities, setOpenEntities] = React.useState(false);
    const handleClickOpenTypes = () => {
        setOpenTypes(true);
    };

    const handleCloseTypes = () => {
        setOpenTypes(false);
    };
    const handleClickOpenEdges = () => {
        setOpenEdges(true);
    };

    const handleCloseEdges = () => {
        setOpenEdges(false);
    };
    const handleClickOpenEntities = () => {
        setOpenEntities(true);
    };

    const handleCloseEntities = () => {
        setOpenEntities(false);
    };
    return(
        <Grid>
            <Grid
                item
                direction="row"
                justify="center"
                alignItems="center"
                id={"add-schema-element-buttons"}
            >
                <Grid item>
                    <Button variant="outlined" onClick={handleClickOpenTypes} id={"add-type-button"}>
                        Add Type
                    </Button>
                    <Dialog
                        open={openTypes}
                        onClose={handleCloseTypes}
                        id={"add-type-dialog"}
                        aria-labelledby="add-type-dialog"
                    >
                        <DialogTitle id="add-type-dialog-title">
                            {"Add Type"}
                        </DialogTitle>
                        <DialogContent>
                            <AddType/>
                        </DialogContent>
                    </Dialog>
                </Grid>
                <Grid item>
                    <Button variant="outlined" onClick={handleClickOpenEdges} id={"add-edge-button"}>
                        Add Edge
                    </Button>
                    <Dialog
                        open={openEdges}
                        onClose={handleCloseEdges}
                        id={"add-edge-dialog"}
                        aria-labelledby="add-edge-dialog"
                    >
                        <DialogTitle id="add-edge-dialog-title">
                            {"Add Edge"}
                        </DialogTitle>
                        <DialogContent>
                            <AddEdge/>
                        </DialogContent>
                    </Dialog>
                </Grid>
                <Grid item>
                    <Button variant="outlined" onClick={handleClickOpenEntities} id={"add-entity-button"}>
                        Add Entity
                    </Button>
                    <Dialog
                        open={openEntities}
                        onClose={handleCloseEntities}
                        id={"add-entity-dialog"}
                        aria-labelledby="add-entity-dialog"
                    >
                        <DialogTitle id="add-entity-dialog-title">
                            {"Add Entity"}
                        </DialogTitle>
                        <DialogContent>
                            <AddEntity/>
                        </DialogContent>
                    </Dialog>
                </Grid>


            </Grid>
        </Grid>
    )
}