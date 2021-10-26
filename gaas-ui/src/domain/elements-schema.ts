import { Notifications } from "./notifications";

export class ElementsSchema {
    private elements: any;

    constructor(elements: string) {
        this.elements = elements;
    }
    public getElements(): IElementsSchema {
        return this.elements;
    }

    public validate(): Notifications {
        const notes: Notifications = new Notifications();
        if (this.elements.length === 0) {
            notes.addError("Elements Schema is empty");
            return notes;
        }
        if (!this.elementsIsValidJson(notes)) {
            return notes;
        }
        this.validateElements(notes);
        this.validateInvalidProperties(notes);
        return notes;
    }

    private elementsIsValidJson(notes: Notifications): boolean {
        try {
            this.elements = JSON.parse(this.elements);
            return true;
        } catch (e) {
            notes.addError("Elements Schema is not valid JSON");
            return false;
        }
    }

    private validateElements(notes: Notifications): void {
        if(this.elements.edges !== undefined){
            this.validateEdges(notes);
        }
        if(this.elements.entities !== undefined){
            this.validateEntities(notes);
        }
        if(this.elements.entities === undefined && this.elements.edges === undefined){
            notes.addError("Elements Schema must contain entities or edges");
        }

    }

    private validateEntities(notes: Notifications): void {
        if (this.elements.entities === undefined) {
            notes.addError("Elements Schema does not contain property entities");
            return;
        }
        if (typeof this.elements.entities !== "object") {
            notes.addError(`Entities is type ${typeof this.elements.entities} and not an object of Entity objects`);
            return;
        }
        Object.entries(this.elements.entities).forEach(([entityName,value]) => {
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

    private validateEdges(notes: Notifications): void {
        if (this.elements.edges === undefined) {
            notes.addError("Elements Schema does not contain property edges");
            return;
        }
        if (typeof this.elements.edges !== "object") {
            notes.addError(`Edges is type ${typeof this.elements.edges} and not an object of Edges objects`);
            return;
        }

        Object.entries(this.elements.edges).forEach(([edgeName, value]) => {
            if (edgeName !== "groupBy") {
                const edge: IEdge = value as IEdge;
                const missingProps: Array<string> = [];
                if (edge.description === undefined) {
                    missingProps.push('"description"');
                }
                if (edge.source === undefined) {
                    missingProps.push('"source"');
                }
                if (edge.destination === undefined) {
                    missingProps.push('"destination"');
                }
                if (edge.directed === undefined) {
                    missingProps.push('"directed"');
                }
                if (missingProps.length > 0) {
                    notes.addError(`${edgeName} edge is missing [${missingProps.join(", ")}]`);
                }
            }
        });
    }

    private validateInvalidProperties(notes: Notifications): void {
        const invalidProperties = Object.keys(this.elements).filter(
            (key) => key !== "entities" && key !== "edges" && key !== "visibilityProperty"
        );

        if (invalidProperties.length > 0) {
            notes.addError(
                '["' + invalidProperties.join('", "').toString() + '"] are invalid Elements schema root properties'
            );
        }
    }
}

export interface IElementsSchema {
    entities: object;
    edges: object;
}

export interface IEntity {
    description: string;
    vertex: string;
    properties: object;
    groupBy: Array<string>;
}

export interface IEdge {
    description: string;
    source: string;
    destination: string;
    directed: string;
    properties: string;
}
