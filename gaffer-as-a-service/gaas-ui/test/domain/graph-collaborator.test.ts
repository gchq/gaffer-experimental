/*
 * Copyright 2022 Crown Copyright
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

import { GraphCollaborator } from "../../src/domain/graph-collaborator";

describe("Graph Collaborator methods", () => {
    it("should return graphId and username when called", () => {
        const graphCollaborator = new GraphCollaborator("myGraph", "myUser");

        expect(graphCollaborator.getId()).toBe("myGraph");
        expect(graphCollaborator.getUsername()).toBe("myUser");
    });
});
