import { Notifications } from "../notifications";
import { IEdge } from "../elements-schema";

export class EdgesSchema {
    private edges: any;
    constructor(edges: string) {
        this.edges = edges;
    }
    public validate(): Notifications {
        const notes: Notifications = new Notifications();
        if (this.edges.length !== 0) {
            if (!this.edgesIsValidJson(notes)) {
                return notes;
            }
            this.validateEdges(notes);
        }
        return notes;
    }
    private edgesIsValidJson(notes: Notifications): boolean {
        try {
            this.edges = JSON.parse(this.edges);
            return true;
        } catch (e) {
            notes.addError("Edges is not valid JSON");
            return false;
        }
    }
    private validateEdges(notes: Notifications): void {
        if (this.edges === undefined) {
            notes.addError("Elements Schema does not contain property edges");
            return;
        }
        if (typeof this.edges !== "object") {
            notes.addError(`Edges is type ${typeof this.edges} and not an object of Edges objects`);
            return;
        }

        Object.entries(this.edges).forEach(([edgeName, value]) => {
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
}
