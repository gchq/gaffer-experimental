import React, {ReactElement} from "react";
import {FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select} from "@material-ui/core";
import {StoreType} from "../../domain/store-type";

interface IProps {
    value: StoreType;
    onChange(storeType: StoreType): void;
}
export default function StoreTypeSelect(props: IProps): ReactElement {
    const {
        value,
        onChange,
    } = props;
    return (
            <Grid item xs={12} id={"storetype-select-grid"} aria-label="store-type-grid" >
                <FormControl
                    variant="outlined"
                    id={"storetype-formcontrol"}
                    aria-label="store-type-input"
                >
                    <InputLabel aria-label="store-type-input-label">Store Type</InputLabel>

                    <Select
                        label="Store Type"
                        inputProps={{
                            name: "Store Type",
                            id: "outlined-age-native-simple",
                            "aria-label": "store-type-input"
                        }}
                        labelId="storetype-select-label"
                        id="storetype-select"
                        aria-label="store-type-select"
                        value={value}
                        onChange={(event) => onChange(event.target.value as StoreType)
                        }
                    >
                        <MenuItem value={StoreType.MAPSTORE} aria-label="mapstore-menu-item"
                                  id="mapstore-menu-item">
                            Map Store
                        </MenuItem>
                        <MenuItem value={StoreType.ACCUMULO} aria-label="accumulo-menu-item" id="accumulo-menu-item">Accumulo</MenuItem>
                        <MenuItem value={StoreType.FEDERATED_STORE} aria-label="federated-menu-item" id="federated-menu-item">
                            Federated Store
                        </MenuItem>
                    </Select>
                    <FormHelperText aria-label="store-type-select-helper-text" id="store-type-helper-text">
                        Set to Map Store by default
                    </FormHelperText>
                </FormControl>
            </Grid>
    )
}