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

export interface IGraphByIdResponse {
    graphId: string;
    description: string;
    url: string;
    restUrl: string;
    status: "UP" | "DOWN";
    configName: string;
    graphAutoDestroyDate: string;
    elements: string;
    types: string;
}

export interface IAllGraphsResponse {
    graphs: IGraphByIdResponse[];
}

export interface IAllNameSpacesResponse extends Array<string> {}

export interface IGraphStatusResponse {
    status: string;
}

export interface IGetAllGraphIdsResponse extends Array<string> {}

export interface IStoreTypesResponse {
    storeTypes: Array<{
        name: string;
        parameters: string[];
    }>;
}

export interface ICollaboratorByIdResponse {
    graphId: string;
    username: string;
}

export interface IAllGraphCollaboratorsResponse {
    collaborators: ICollaboratorByIdResponse[];
}
