import { Notifications } from "./notifications";
import { EntitiesSchema } from "./elementsSchema/entities-schema";
import { EdgesSchema } from "./elementsSchema/edges-schema";

export class ElementsSchema {
    private elements: any;
    static entities: object;
    static edges: object;

    constructor(elements: string) {
        this.elements = elements;
    }
    public getEntities(): object {
        return ElementsSchema.entities;
    }
    public getEdges(): object {
        return ElementsSchema.edges;
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
        if (this.elements.edges !== undefined) {
            const edgesSchema = new EdgesSchema(JSON.stringify(this.elements.edges));
            const edgesSchemaNotifications = edgesSchema.validate();
            notes.concat(edgesSchemaNotifications);
            if (edgesSchemaNotifications.isEmpty()) {
                ElementsSchema.edges = edgesSchema.getEdges();
            }
        }
        if (this.elements.entities !== undefined) {
            const entitiesSchema = new EntitiesSchema(JSON.stringify(this.elements.entities));
            const entitiesSchemaNotifications = entitiesSchema.validate();
            notes.concat(entitiesSchemaNotifications);
            if (entitiesSchemaNotifications.isEmpty()) {
                ElementsSchema.entities = entitiesSchema.getEntities();
            }
        }
        if (this.elements.entities === undefined && this.elements.edges === undefined) {
            notes.addError("Elements Schema must contain entities or edges");
        }
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
    properties: object;
}
