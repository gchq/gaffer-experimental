import React, {ReactElement} from "react";
import {Button, FormHelperText, Grid, TextField} from "@material-ui/core";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import {Graph} from "../../domain/graph";
import {GraphType} from "../../domain/graph-type";
import {StoreType} from "../../domain/store-type";
import {AlertType, INotificationAlertProps} from "../alerts/notification-alert";
import {GetGraphStatusRepo} from "../../rest/repositories/get-graph-status-repo";

interface IProps {
    hide: boolean;
    onChangeProxyURL (proxyURL: string): void;
    proxyURLValue: string;
    onClickAddProxyGraph (newProxyGraph: Graph, alert:INotificationAlertProps): void;
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

    async function checkSubmit(){
        try{
            const status: string = await new GetGraphStatusRepo().getStatus(proxyURLValue)
            if(status === "UP"){
                onClickAddProxyGraph(makeProxyGraph(proxyURLValue),{alertType: AlertType.SUCCESS, message: "Graph is valid"});
                onChangeProxyURL("");
            }
        }catch(e){
            onClickAddProxyGraph(makeProxyGraph(""),{alertType: AlertType.FAILED, message: `Graph is invalid ${e.toString()}`});

        }
    }

      function isValidHttpUrl(string: string) {
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
                    label="Proxy URL"
                    variant="outlined"
                    value={proxyURLValue}
                    fullWidth
                    name="proxy-url"
                    error={!isValidHttpUrl(proxyURLValue)}
                    autoComplete="proxy-url"
                    onChange={(event) => {
                        onChangeProxyURL(event.target.value)
                    }}
                />
                <FormHelperText>
                    Enter valid URL for proxy store if not shown below in table
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
                    disabled={proxyURLValue === "" || !isValidHttpUrl(proxyURLValue)}
                >
                    Add Proxy Graph
                </Button>
            </Grid>
        </div>}
        </>
    );

}