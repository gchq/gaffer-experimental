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

import { RestClient } from "../clients/rest-client";
import { ICreateGraphRequestBody } from "../http-message-interfaces/request-interfaces";
import { Config } from "../config";

export class CreateStoreTypesGraphRepo {
    public async create(
        graphId: string,
        description: string,
        configName: string,
        graphLifetimeInDays: string,
        config: ICreateGraphConfig
    ): Promise<void> {
        if (config.schema === undefined) {
            throw new Error("Schema is undefined");
        }
        const httpRequestBody: ICreateGraphRequestBody = {
            graphId: graphId,
            description: description,
            configName: configName,
            graphLifetimeInDays: graphLifetimeInDays,
            schema: config.schema,
        };
        await new RestClient()
            .baseUrl(Config.REACT_APP_KAI_REST_API_HOST)
            .post()
            .requestBody(httpRequestBody)
            .graphs()
            .execute();
    }
}
export interface ICreateGraphConfig {
    schema?: {
        entities: object;
        edges: object;
        types: object;
    };
    proxyContextRoot?: string;
    proxyHost?: string;
    proxySubGraphs?: Array<{ graphId: string; host: string; root: string }>;
}
