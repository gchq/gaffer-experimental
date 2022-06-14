/*
 * Copyright 2021-2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { ReactElement, useState } from "react";
import { Button, Grid, TextField, Tooltip } from "@material-ui/core";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import { Graph } from "../../domain/graph";
import { GraphType } from "../../domain/graph-type";
import { GetGraphStatusRepo } from "../../rest/repositories/get-graph-status-repo";
import { GetGraphDescriptionRepo } from "../../rest/repositories/get-graph-description-repo";
import { GetGraphIdRepo } from "../../rest/repositories/get-graph-id-repo";

interface IProps {
    hide: boolean;
    proxyURLValue: string;
    onChangeProxyURL(proxyURL: string): void;
    onClickAddProxyGraph(newProxyGraph: Graph): void;
}

export default function AddProxyGraphInput(props: IProps): ReactElement {
    const [errorHelperText, setErrorHelperText] = useState("");
    const [successHelperText, setSuccessHelperText] = useState("");

    const { hide, onChangeProxyURL, proxyURLValue, onClickAddProxyGraph } = props;

    async function onClickSubmit() {
        try {
            const status: string = await new GetGraphStatusRepo().getStatus(proxyURLValue);

            if (status === "UP") {
                const graph: Graph = new Graph(
                    await getGraphId(),
                    await getDescription(),
                    "",
                    proxyURLValue,
                    status,
                    "proxyStore",
                    "never",
                    GraphType.PROXY_GRAPH
                );
                setSuccessHelperText(`Successfully added Graph at ${proxyURLValue}`);
                onClickAddProxyGraph(graph);
                onChangeProxyURL("");
            } else {
                setErrorHelperText(`Graph at the base URL: ${proxyURLValue} is down`);
            }
        } catch (e) {
            setErrorHelperText(`A Graph does not exist at the base URL: ${proxyURLValue}`);
        }
    }

    async function getDescription(): Promise<string> {
        let description: string;
        try {
            description = await new GetGraphDescriptionRepo().getDescription(proxyURLValue);
        } catch (e) {
            description = "n/a";
        }
        return description;
    }

    async function getGraphId(): Promise<string> {
        let graphId: string;
        try {
            graphId = await new GetGraphIdRepo().getGraphId(proxyURLValue);
        } catch (e) {
            graphId = "n/a";
        }
        return graphId;
    }

    function isValidHttpUrl(string: string): boolean {
        try {
            const url = new URL(string);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch (e) {
            return false;
        }
    }

    return (
        <>
            {!hide && (
                <div id={"graphs-table"}>
                    <Grid item xs={12} id={"proxy-url-grid"}>
                        <Tooltip
                            title={
                                "Enter the Rest URL of your graph. E.g. http://resourcename-namespace.host-name/rest"
                            }
                        >
                            <TextField
                                id="proxy-url"
                                label="Proxy Graph Rest URL"
                                aria-label="proxy-url-textfield"
                                inputProps={{
                                    name: "Proxy Graph Rest URL",
                                    id: "proxy-url-input",
                                    "aria-label": "proxy-url-input",
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
                        </Tooltip>
                    </Grid>
                    <Grid
                        id="proxy-button-grid"
                        container
                        style={{ margin: 10 }}
                        direction="row"
                        justify="center"
                        alignItems="center"
                        aria-label="proxy-url-button-grid"
                    >
                        <Button
                            aria-label="proxy-url-submit-button"
                            id="add-new-proxy-button"
                            onClick={async () => await onClickSubmit()}
                            startIcon={<AddCircleOutlineOutlinedIcon />}
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={proxyURLValue === "" || !isValidHttpUrl(proxyURLValue)}
                        >
                            Add Proxy Graph
                        </Button>
                    </Grid>
                </div>
            )}
        </>
    );
}
