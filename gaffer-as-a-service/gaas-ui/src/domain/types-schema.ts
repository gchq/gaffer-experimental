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

import { Notifications } from "./notifications";

export interface IType {
    class: string;
    description?: string;
    validateFunctions?: Array<IValidateFunction>;
    aggregateFunction?: {
        class: string;
    };
    serialiser?: {
        class: string;
    };
}

interface IValidateFunction {
    class: string;
}

export class TypesSchema {
    private types: any;

    constructor(types: string) {
        this.types = types;
    }
    public getTypes(): object {
        return this.types;
    }
    public validate(): Notifications {
        const notes: Notifications = new Notifications();
        if (this.types.length === 0) {
            notes.addError("Types Schema is empty");
            return notes;
        }
        if (!this.typesIsValidJson(notes)) {
            return notes;
        }
        this.validateTypes(notes);
        return notes;
    }
    private typesIsValidJson(notes: Notifications): boolean {
        try {
            this.types = JSON.parse(this.types);
            return true;
        } catch (e) {
            notes.addError("Types Schema is not valid JSON");
            return false;
        }
    }
    private validateTypes(notes: Notifications): void {
        if (this.types === undefined) {
            notes.addError("Types Schema is undefined");
            return;
        }
        Object.entries(this.types).forEach(([typeName, value]) => {
            const type: IType = value as IType;
            if (type.description !== undefined && typeof type.description !== "string") {
                notes.addError(
                    `description in ${typeName} type is a ${typeof type.description}, it needs to be a string`
                );
            }
            if (type.class !== undefined && typeof type.class !== "string") {
                notes.addError(`class in ${typeName} type is a ${typeof type.class}, it needs to be a string`);
            }
            if (type.validateFunctions !== undefined) {
                if (!Array.isArray(type.validateFunctions)) {
                    notes.addError(
                        `validateFunctions in ${typeName} type is a ${typeof type.validateFunctions}, it needs to be an Array of objects`
                    );
                    return;
                }
                for (let i = 0; i < type.validateFunctions.length; i += 1) {
                    if (typeof type.validateFunctions[i] !== "object") {
                        notes.addError(
                            `${type.validateFunctions[i]} in validateFunctions in ${typeName} type is a ${typeof type
                                .validateFunctions[i]}. validateFunctions is an array of objects`
                        );
                        return;
                    }
                    if (type.validateFunctions[i].class === undefined) {
                        notes.addError(`validateFunctions in ${typeName} type doesnt have class`);
                        return;
                    }

                    if (typeof type.validateFunctions[i].class !== "string") {
                        notes.addError(
                            `class in validateFunctions in ${typeName} is ${typeof type.validateFunctions[i]
                                .class}. Should be string`
                        );
                        return;
                    }
                }
            }
            if (type.aggregateFunction !== undefined) {
                if (typeof type.aggregateFunction !== "object") {
                    notes.addError(
                        `aggregateFunction in ${typeName} type is a ${typeof type.aggregateFunction}, it needs to be an object`
                    );
                    return;
                }
                if (type.aggregateFunction.class === undefined) {
                    notes.addError(`aggregateFunction in ${typeName} type doesnt have class`);
                    return;
                }
                if (typeof type.aggregateFunction.class !== "string") {
                    notes.addError(
                        `class in aggregateFunction in ${typeName} type is ${typeof type.aggregateFunction
                            .class} should be string`
                    );
                    return;
                }
            }
            if (type.serialiser !== undefined) {
                if (typeof type.serialiser !== "object") {
                    notes.addError(
                        `serialiser in ${typeName} type is a ${typeof type.serialiser}, it needs to be an object`
                    );
                    return;
                }
                if (type.serialiser.class === undefined) {
                    notes.addError(`serialiser in ${typeName} type doesnt have class`);
                    return;
                }
                if (typeof type.serialiser.class !== "string") {
                    notes.addError(
                        `class in serialiser in ${typeName} type is a ${typeof type.serialiser}, should be a string`
                    );
                }
            }
        });
    }
}
