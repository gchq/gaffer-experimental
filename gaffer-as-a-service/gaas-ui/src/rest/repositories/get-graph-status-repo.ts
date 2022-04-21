/*
 * Copyright 2021-2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */

import { IApiResponse, RestClient } from "../clients/rest-client";
import { IGraphStatusResponse } from "../http-message-interfaces/response-interfaces";

export class GetGraphStatusRepo {
    public async getStatus(proxiedGraphBaseUrl: string): Promise<string> {
        const response: IApiResponse<IGraphStatusResponse> = await new RestClient()
            .baseUrl(proxiedGraphBaseUrl)
            .get()
            .status()
            .execute();

        return response.data.status;
    }
}
