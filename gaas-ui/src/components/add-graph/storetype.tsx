import React, {ReactElement} from "react";
import { FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select } from "@material-ui/core";
import { StoreType } from "../../domain/store-type";

interface IProps {
    value: StoreType;
    onChange(storeType: StoreType): void;
}

export default function StoreTypeSelect(props: IProps): ReactElement {
    
    const { value, onChange } = props;

    return (
            <Grid item xs={12} id={"storetype-select-grid"}>
                <FormControl
                    variant="outlined"
                    id={"storetype-formcontrol"}
                >
                    <InputLabel>Store Type</InputLabel>

                    <Select
                        label="Store Type"
                        inputProps={{
                            name: "Store Type",
                            id: "outlined-age-native-simple",
                        }}
                        labelId="storetype-select-label"
                        id="storetype-select"
                        value={value}
                        onChange={(event) => onChange(event.target.value as StoreType)
                        }
                    >
                        <MenuItem value={StoreType.MAPSTORE}>Map Store</MenuItem>
                        <MenuItem value={StoreType.ACCUMULO}>Accumulo</MenuItem>
                        <MenuItem value={StoreType.FEDERATED_STORE}>Federated Store</MenuItem>
                    </Select>
                    <FormHelperText>
                        Set to Map Store by default
                    </FormHelperText>
                </FormControl>
            </Grid>
    )
}
