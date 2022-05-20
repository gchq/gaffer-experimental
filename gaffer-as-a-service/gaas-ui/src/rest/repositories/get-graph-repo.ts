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

import { Graph } from "../../domain/graph";
import { GraphType } from "../../domain/graph-type";
import { IApiResponse, RestClient } from "../clients/rest-client";
import { Config } from "../config";
import { IGraphByIdResponse } from "../http-message-interfaces/response-interfaces";

export class GetGraphRepo {
    public async get(graphId: string): Promise<Graph> {
        const response: IApiResponse<IGraphByIdResponse> = await new RestClient()
            .baseUrl(Config.REACT_APP_KAI_REST_API_HOST)
            .get()
            .graphs(graphId)
            .execute();

        return new Graph(
            response.data.graphId,
            response.data.description,
            response.data.url,
            response.data.restUrl,
            response.data.status,
            response.data.configName,
            GraphType.GAAS_GRAPH
        );
    }
}
