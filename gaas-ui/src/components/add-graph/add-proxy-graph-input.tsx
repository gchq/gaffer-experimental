import React, {ReactElement, useState} from "react";
import {Button, Grid, TextField} from "@material-ui/core";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import {Graph} from "../../domain/graph";
import {GraphType} from "../../domain/graph-type";
import {StoreType} from "../../domain/store-type";
import {AlertType, INotificationAlertProps} from "../alerts/notification-alert";
import {GetGraphStatusRepo} from "../../rest/repositories/get-graph-status-repo";
import {GetGraphDetailsRepo} from "../../rest/repositories/get-graph-details-repo";

interface IProps {
    hide: boolean;
    proxyURLValue: string;
    onChangeProxyURL(proxyURL: string): void;
    onClickAddProxyGraph(newProxyGraph: Graph,alert:INotificationAlertProps  ): void;
}

export default function AddProxyGraphInput(props: IProps): ReactElement {
    const [errorHelperText, setErrorHelperText] = useState("");

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
                const description: string = await new GetGraphDetailsRepo().getDescription(proxyURLValue);
                const graph: Graph = new Graph(proxyURLValue + "-graph", description, proxyURLValue, status, StoreType.PROXY_STORE, GraphType.PROXY_GRAPH);
                onClickAddProxyGraph(graph,{alertType: AlertType.SUCCESS, message: "Graph is valid"});
                onChangeProxyURL("");
            } else {
                setErrorHelperText(`Graph at the base URL: ${proxyURLValue} is down`);
            }
        } catch(e) {
            setErrorHelperText(`A Graph does not exist at the base URL: ${proxyURLValue}`);
        }
    }

    function isValidHttpUrl(string: string):boolean {
        let url;
        try {
            url = new URL(string);
        } catch (_) {
            return false;  
        }
        return url.protocol === "http:" || url.protocol === "https:";
    }

    return (
        <>
        {!hide &&
        <div id={"graphs-table"}>
            <Grid item xs={12} id={"proxy-url-grid"}>
                <TextField
                    id="proxy-url"
                    label="Proxy Graph Base URL"
                    variant="outlined"
                    value={proxyURLValue}
                    fullWidth
                    name="proxy-url"
                    error={errorHelperText.length > 0}
                    autoComplete="proxy-url"
                    onChange={(event) => {
                        setErrorHelperText("");
                        onChangeProxyURL(event.target.value);
                    }}
                    helperText={errorHelperText}
                />
            </Grid>
            <Grid
                id="proxy-button-grid"
                container
                style={{margin: 10}}
                direction="row"
                justify="center"
                alignItems="center"
            >
                <Button
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
