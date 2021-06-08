import React, {ReactElement, useEffect, useState} from "react";
import { Box, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select } from "@material-ui/core";
import {GetStoreTypesRepo} from "../../rest/repositories/get-store-types-repo";
import {IAllStoreTypesResponse} from "../../rest/http-message-interfaces/response-interfaces";

interface IProps {
    value: string;
    onChange(storeType: string): void;
}

export default function StoreTypeSelect(props: IProps): ReactElement {
    
    const { value, onChange } = props;
    const [allStoreTypes, setAllStoreTypes] = React.useState<Array<string>>([]);
    const [errorHelperText, setErrorHelperText] = useState("");
    const [successHelperText, setSuccessHelperText] = useState("");
    //TODO: UNIT TESTS
    async function getAllStoreTypes(): Promise<void> {
        try {
            const storeTypes: IAllStoreTypesResponse = await new GetStoreTypesRepo().get();
            if (storeTypes.storeTypes.length !== 0 || storeTypes.federatedStoreTypes.length !== 0) {
                setAllStoreTypes(storeTypes.federatedStoreTypes.concat(storeTypes.storeTypes));
            }else{
                setErrorHelperText("No storetypes available");
            }
        } catch (e) {
            setErrorHelperText(`Storetypes unavailable: ${e.message}`);
            
        }
    }
    useEffect(() => {
        getAllStoreTypes();
    })

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
                            onChange(event.target.value as string);
                            setSuccessHelperText("");
                            setErrorHelperText("");
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
                    <FormHelperText id="storetype-form-helper">{errorHelperText + successHelperText}</FormHelperText>
                </FormControl>
            </Grid>
    )
}
