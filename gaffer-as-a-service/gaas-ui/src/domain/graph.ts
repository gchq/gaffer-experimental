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

import { GraphType } from "./graph-type";

export class Graph {
    private readonly graphId: string;
    private readonly description: string;
    private readonly url: string;
    private readonly restUrl: string;
    private readonly status: "UP" | "DOWN";
    private readonly configName: string;
    private readonly graphAutoDestroyDate: string;
    private readonly type: GraphType;
    private readonly elements: string;
    private readonly types: string;

    constructor(
        graphId: string,
        description: string,
        url: string,
        restUrl: string,
        status: "UP" | "DOWN",
        configName: string,
        graphAutoDestroyDate: string,
        type: GraphType,
        elements: string,
        types: string
    ) {
        this.graphId = graphId;
        this.description = description;
        this.url = url;
        this.restUrl = restUrl;
        this.status = status;
        this.configName = configName;
        this.graphAutoDestroyDate = graphAutoDestroyDate;
        this.type = type;
        this.elements = elements;
        this.types = types;
    }

    public getId(): string {
        return this.graphId;
    }

    public getDescription(): string {
        return this.description;
    }

    public getUrl(): string {
        return this.url;
    }

    public getStatus(): string {
        return this.status;
    }

    public getConfigName(): string {
        return this.configName;
    }

    public getGraphAutoDestroyDate(): string {
        return this.graphAutoDestroyDate;
    }

    public getType(): GraphType {
        return this.type;
    }

    public getRestUrl(): string {
        return this.restUrl;
    }
    public getGraphHost(): string {
        return this.restUrl.substring(this.restUrl.indexOf("/") + 2).split("/rest")[0];
    }
    public getElements(): string {
        return this.elements;
    }
    public getTypes(): string {
        return this.types;
    }
}
