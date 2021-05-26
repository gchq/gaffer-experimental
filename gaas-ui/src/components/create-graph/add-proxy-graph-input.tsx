import React, {ReactElement, useState} from "react";
import {Button, Grid, InputLabel, TextField} from "@material-ui/core";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import {Graph} from "../../domain/graph";
import {GraphType} from "../../domain/graph-type";
import {StoreType} from "../../domain/store-type";
import {GetGraphStatusRepo} from "../../rest/repositories/get-graph-status-repo";
import {GetGraphDetailsRepo} from "../../rest/repositories/get-graph-details-repo";
import FormHelperText from "@material-ui/core/FormHelperText";

interface IProps {
    hide: boolean;
    proxyURLValue: string;
    onChangeProxyURL(proxyURL: string): void;
    onClickAddProxyGraph(newProxyGraph: Graph): void;
}

export default function AddProxyGraphInput(props: IProps): ReactElement {
    const [errorHelperText, setErrorHelperText] = useState("");
    const [successHelperText, setSuccessHelperText] = useState("");

    const {
        hide,
        onChangeProxyURL,
        proxyURLValue,
        onClickAddProxyGraph
    } = props;

    async function onClickSubmit(){
        try {
            const status: string = await new GetGraphStatusRepo().getStatus(proxyURLValue);
            if (status === "UP") {
                const graph: Graph = new Graph(proxyURLValue + "-graph", await getDescription(), proxyURLValue, status, StoreType.PROXY_STORE, GraphType.PROXY_GRAPH);
                setSuccessHelperText(`Successfully added Graph at ${proxyURLValue}`)
                onClickAddProxyGraph(graph);
                onChangeProxyURL("");
            } else {
                setErrorHelperText(`Graph at the base URL: ${proxyURLValue} is down`);
            }
        } catch(e) {
            setErrorHelperText(`A Graph does not exist at the base URL: ${proxyURLValue}`);
        }
    }

    async function getDescription(): Promise<string> {
        let description: string;
        try {
            description = await new GetGraphDetailsRepo().getDescription(proxyURLValue);
        } catch(e) {
            description = "n/a";
        }
        return description;
    }

    function isValidHttpUrl(string: string):boolean {
        let url;
        try {
            url = new URL(string);
        } catch (e) {
            return false;
        }
        return url.protocol === "http:" || url.protocol === "https:";
    }

    return (
        <>
            {!hide && <div id={"graphs-table"}>
                <Grid item xs={12} id={"proxy-url-grid"}>
                    <InputLabel aria-label="proxy-url-input-label">Proxy URL</InputLabel>

                    <TextField
                        id="proxy-url"
                        aria-label="proxy-url-textfield"
                        inputProps={{
                            name: "Proxy Graph Base URL",
                            id: "proxy-url-input",
                            "aria-label": "proxy-url-input"
                        }}
                        variant="outlined"
                        value={proxyURLValue}
                        fullWidth
                        name="proxy-url"
                        error={errorHelperText.length > 0}
                        autoComplete="proxy-url"
                        onChange={(event) => {
                            setSuccessHelperText("");
                            setErrorHelperText("");
                            onChangeProxyURL(event.target.value);
                        }}
                        helperText={errorHelperText + successHelperText}
                    />
                </Grid>
                <Grid
                    id="proxy-button-grid"
                    container
                    style={{margin: 10}}
                    direction="row"
                    justify="center"
                    alignItems="center"
                    aria-label="proxy-url-button-grid"
                >
                    <Button
                        aria-label="proxy-url-submit-button"
                        id="add-new-proxy-button"
                        onClick={async () => await onClickSubmit()}
                        startIcon={<AddCircleOutlineOutlinedIcon/>}
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={proxyURLValue === "" || !isValidHttpUrl(proxyURLValue)}
                    >
                        Add Proxy Graph
                    </Button>
                </Grid>
            </div>}
        </>
    );
}
