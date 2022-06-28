/*
 * Copyright 2022 Crown Copyright
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

import { IApiResponse, RestClient } from "../clients/rest-client";
import { Config } from "../config";
import {
    IAllGraphCollaboratorsResponse,
    ICollaboratorByIdResponse,
} from "../http-message-interfaces/response-interfaces";
import { GraphCollaborator } from "../../domain/graph-collaborator";

export class GetAllGraphCollaboratorsRepo {
    public async getAll(graphId: string): Promise<GraphCollaborator[]> {
        const response: IApiResponse<IAllGraphCollaboratorsResponse> = await new RestClient()
            .baseUrl(Config.REACT_APP_KAI_REST_API_HOST)
            .get()
            .viewCollaborator(graphId)
            .execute();
        return response.data.collaborators.map(
            (jsonObject: ICollaboratorByIdResponse) => new GraphCollaborator(jsonObject.graphId, jsonObject.username)
        );
    }
}
