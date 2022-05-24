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

import { Notifications } from "../notifications";
import { IEntity } from "../elements-schema";

export class EntitiesSchema {
    private entities: any;
    constructor(entities: string) {
        this.entities = entities;
    }
    public getEntities(): object {
        return this.entities;
    }
    public validate(): Notifications {
        const notes: Notifications = new Notifications();
        if (this.entities.length !== 0) {
            if (!this.entitiesIsValidJson(notes)) {
                return notes;
            }
            this.validateEntities(notes);
        }

        return notes;
    }
    private entitiesIsValidJson(notes: Notifications): boolean {
        try {
            this.entities = JSON.parse(this.entities);
            return true;
        } catch (e) {
            notes.addError("Entities is not valid JSON");
            return false;
        }
    }
    private validateEntities(notes: Notifications): void {
        if (this.entities === undefined) {
            notes.addError("Elements Schema does not contain property entities");
            return;
        }
        if (typeof this.entities !== "object") {
            notes.addError(`Entities is type ${typeof this.entities} and not an object of Entity objects`);
            return;
        }
        Object.entries(this.entities).forEach(([entityName, value]) => {
            const entity: IEntity = value as IEntity;

            const missingProps: Array<string> = [];
            if (entity.description === undefined) {
                missingProps.push('"description"');
            }
            if (entity.vertex === undefined) {
                missingProps.push('"vertex"');
            }
            if (entity.properties === undefined) {
                missingProps.push('"properties"');
            }
            if (entity.groupBy === undefined) {
                missingProps.push('"groupBy"');
            }
            if (missingProps.length > 0) {
                notes.addError(`${entityName} entity is missing [${missingProps.join(", ")}]`);
            }
        });
    }
}
