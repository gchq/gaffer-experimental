import React, {ReactElement} from "react";
import { Box, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select } from "@material-ui/core";
interface IProps {
    value: string;
    allStoreTypes: Array<string>;
    onChangeStoreType(storeType: string): void;
}
export default function StoreTypeSelect(props: IProps): ReactElement {
    const { value, allStoreTypes, onChangeStoreType } = props;
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
                            id: "store-type-input",
                            "aria-label": "store-type-input"
                        }}
                        labelId="storetype-select-label"
                        id="storetype-select"
                        aria-label="store-type-select"
                        fullWidth
                        value={value}
                        onChange={(event) => {
                            onChangeStoreType(event.target.value as string);
                        }
                        }
                    >
                        {allStoreTypes.map((store: string) => (
                                <MenuItem value={store} aria-label={store+"-menu-item"}
                                          id={store+"-menu-item"} aria-labelledby={"storetype-select-label"}
                                >
                                    {store}
                                </MenuItem>
                            )
                        )}
                    </Select>
                    <FormHelperText id="storetype-form-helper">{allStoreTypes.length === 0 ? "No storetypes available": ""}</FormHelperText>
                </FormControl>
            </Grid>
    )
}