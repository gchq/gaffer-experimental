import React, {ReactElement} from "react";
import {Button, Grid} from "@material-ui/core";
interface IProps {

}
export default function SchemaBuilder(props: IProps): ReactElement{
    return(
        <Grid>
            <Grid
                item
                direction="row"
                justify="space-between"
                alignItems="center"
                id={"add-schema-element-buttons"}
            >
                <Button
                    id={"add-type-button"}
                    name={"Add Type"}
                >
                    Add Type
                </Button>
                <Button
                    id={"add-edge-button"}
                    name={"Add Edge"}
                >
                    Add Edge
                </Button>
                <Button
                    id={"add-entity-button"}
                    name={"Add Entity"}
                >
                    Add Entity
                </Button>


            </Grid>
        </Grid>
    )
}