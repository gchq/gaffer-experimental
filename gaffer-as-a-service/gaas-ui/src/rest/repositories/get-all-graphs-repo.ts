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
import { IAllGraphsResponse, IGraphByIdResponse } from "../http-message-interfaces/response-interfaces";

export class GetAllGraphsRepo {
    public async getAll(): Promise<Graph[]> {
        const response: IApiResponse<IAllGraphsResponse> = await new RestClient()
            .baseUrl(Config.REACT_APP_KAI_REST_API_HOST)
            .get()
            .graphs()
            .execute();
        return response.data.graphs.map(
            (jsonObject: IGraphByIdResponse) =>
                new Graph(
                    jsonObject.graphId,
                    jsonObject.description,
                    jsonObject.url,
                    jsonObject.restUrl,
                    jsonObject.status,
                    jsonObject.configName,
                    jsonObject.graphAutoDestroyDate,
                    GraphType.GAAS_GRAPH,
                    jsonObject.elements,
                    jsonObject.types
                )
        );
    }
}
