import React, {ReactElement} from "react";
import {Button, FormHelperText, Grid, TextField} from "@material-ui/core";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import {Graph} from "../../domain/graph";
import {GraphType} from "../../domain/graph-type";
import {StoreType} from "../../domain/store-type";
import {IApiResponse, RestClient} from "../../rest/clients/rest-client";
import {AlertType} from "../alerts/notification-alert";

interface IProps {
    hide: boolean;
    onChangeProxyURL (proxyURL: string): void;
    proxyURLValue: string;
    onClickAddProxyGraph (newProxyGraph: Graph, alert:IAlert): void;
}

interface IGraphResponse{
    status: string;
}
export interface IAlert {
    outcome: AlertType , outcomeMessage: string
}

export default function AddProxyGraphInput(props: IProps): ReactElement {
    const {
        hide,
        onChangeProxyURL,
        proxyURLValue,
        onClickAddProxyGraph,
    }= props;

    function makeProxyGraph(url: string): Graph {
        return new Graph(url + "-graph", "Proxy Graph", url, "n/a", StoreType.PROXY_STORE, GraphType.PROXY_GRAPH);
    }

    async function checkIfValidURL(): Promise<boolean>{
        const response : IApiResponse<IGraphResponse> = await new RestClient()
            .get()
            .status()
            .execute(proxyURLValue);
        
          return response.data.status === "UP";
    }

    async function checkSubmit(){
        try{
            if(await checkIfValidURL()){
                onClickAddProxyGraph(makeProxyGraph(proxyURLValue),{outcome: AlertType.SUCCESS, outcomeMessage: "Graph is valid"});
                onChangeProxyURL("");
            }
        }catch(e){
            onClickAddProxyGraph(makeProxyGraph(""),{outcome: AlertType.FAILED, outcomeMessage: `Graph is invalid ${e.toString()}`});

        }
    }

    return (
        <>
        {!hide &&
        <div id={"graphs-table"}>
            <Grid item xs={12} id={"proxy-url-grid"}>
                <TextField
                    id="proxy-url"
                    label="Proxy URL"
                    variant="outlined"
                    value={proxyURLValue}
                    fullWidth
                    name="proxy-url"
                    autoComplete="proxy-url"
                    onChange={(event) => {
                        onChangeProxyURL(event.target.value)
                    }}
                />
                <FormHelperText>
                    Enter URL for proxy store if not shown below
                </FormHelperText>
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
                    onClick={async () => await checkSubmit()}
                    startIcon={<AddCircleOutlineOutlinedIcon/>}
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={proxyURLValue === ""}
                >
                    Add Proxy Graph
                </Button>
            </Grid>
        </div>}
        </>
    );

}