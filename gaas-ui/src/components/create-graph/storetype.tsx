import React, {ReactElement} from "react";
import { Box, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select } from "@material-ui/core";
import { StoreType } from "../../domain/store-type";

interface IProps {
    value: StoreType;
    onChange(storeType: StoreType): void;
}

export default function StoreTypeSelect(props: IProps): ReactElement {
    
    const { value, onChange } = props;

    return (
            <Grid item xs={12} id={"storetype-select-grid"} aria-label="store-type-grid" >
                <FormControl
                    variant="outlined"
                    id={"storetype-formcontrol"}
                    aria-label="store-type-input"
                    fullWidth
                >
                    <InputLabel aria-label="store-type-input-label" style={{fontSize: "20px"}} htmlFor={"storetype-select"} id={"storetype-select-label"}>Store Type</InputLabel>
                    <Box my={1}/>
                    <Select
                        inputProps={{
                            name: "Store Type",
                            id: "outlined-age-native-simple",
                            "aria-label": "store-type-input"
                        }}
                        labelId="storetype-select-label"
                        id="storetype-select"
                        aria-label="store-type-select"
                        fullWidth
                        value={value}
                        onChange={(event) => onChange(event.target.value as StoreType)
                        }
                    >
                        <MenuItem value={StoreType.MAPSTORE} aria-label="mapstore-menu-item"
                                  id="mapstore-menu-item" aria-labelledby={"storetype-select-label"}
                        >
                            Map Store
                        </MenuItem>
                        <MenuItem value={StoreType.ACCUMULO} aria-label="accumulo-menu-item" id="accumulo-menu-item" aria-labelledby={"storetype-select-label"}>Accumulo</MenuItem>
                        <MenuItem value={StoreType.FEDERATED_STORE} aria-label="federated-menu-item" id="federated-menu-item" aria-labelledby={"storetype-select-label"}>
                            Federated Store
                        </MenuItem>
                    </Select>
                </FormControl>
            </Grid>
    )
}
