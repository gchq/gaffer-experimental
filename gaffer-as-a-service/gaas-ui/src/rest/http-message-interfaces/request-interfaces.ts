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

export interface ICreateGraphInterface {
    graphId: string;
    description: string;
}
export interface ICreateGraphRequestBody extends ICreateGraphInterface {
    schema: {
        entities: object;
        edges: object;
        types: object;
    };
    configName: string;
    graphLifetimeInDays: string;
}
export interface ICreateFederatedGraphRequestBody extends ICreateGraphInterface {
    proxySubGraphs: Array<{ graphId: string; host: string; root: string }>;
    configName: string;
    graphLifetimeInDays: string;
}
export interface ICreateProxyGraphRequestBody extends ICreateGraphInterface {
    proxyContextRoot: string;
    proxyHost: string;
    storeType: string;
}
