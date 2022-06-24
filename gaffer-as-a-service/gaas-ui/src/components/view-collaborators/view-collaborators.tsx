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
import React, { useState, useEffect } from "react";
import { Box, Container, Toolbar, Typography } from "@material-ui/core";
import { GetAllGraphCollaboratorsRepo } from "../../rest/repositories/get-all-graph-collaborators-repo";
import { AlertType, NotificationAlert } from "../alerts/notification-alert";
import { Copyright } from "../copyright/copyright";
import { ViewCollaboratorsTable } from "./view-collaborators-table";
import { GraphCollaborator } from "../../domain/graph-collaborator";
import { useLocation } from "react-router-dom";
import { GaaSAPIErrorResponse } from "../../rest/http-message-interfaces/error-response-interface";
import DOMPurify from "dompurify";
import { encode } from "html-entities";

interface IProps {
    graphId: string;
    errorMessage: string;

    graphCollaborators: GraphCollaborator[];
}

export default function ViewCollaborator(props: IProps) {
    const location: any = useLocation();
    const [graphId, setGraphId] = useState(location.state.graphId);
    const [graphCollaborators, setGraphCollaborators] = useState([new GraphCollaborator("", "")]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const getGraphCollaborators = async (graphId: string) => {
            try {
                const collaborators: GraphCollaborator[] = await new GetAllGraphCollaboratorsRepo().getAll(
                    encode(DOMPurify.sanitize(graphId))
                );
                setErrorMessage("");
                setGraphCollaborators(collaborators);
            } catch (e) {
                setErrorMessage(
                    `Failed to get all graph collaborators. ${(e as GaaSAPIErrorResponse).title}: ${
                        (e as GaaSAPIErrorResponse).detail
                    }`
                );
            }
        };
        setGraphCollaborators([]);
        getGraphCollaborators(graphId);
    }, []);

    // private async deleteGraph(graphName: string) {
    //     try {
    //         await new DeleteGraphRepo().delete(graphName);
    //         await this.getGraphs();
    //     } catch (e) {
    //         this.setState({
    //             errorMessage: `Failed to delete graph "${graphName}". ${(e as GaaSAPIErrorResponse).title}: ${
    //                 (e as GaaSAPIErrorResponse).detail
    //             }`,
    //         });
    //     }
    // }

    return (
        <main aria-label={"view-graph-collaborators-page"}>
            {errorMessage && <NotificationAlert alertType={AlertType.FAILED} message={errorMessage} />}
            <Toolbar />
            <Container maxWidth="md">
                <Box my={2}>
                    <Typography
                        variant="h4"
                        align={"center"}
                        id={"view-graph-collaborators-title"}
                        aria-label={"view-graph-collaborators-title"}
                    >
                        View Graph Collaborators
                    </Typography>
                </Box>
                <ViewCollaboratorsTable graphCollaborators={graphCollaborators} />
                <Box pt={4}>
                    <Copyright />
                </Box>
            </Container>
        </main>
    );
}
