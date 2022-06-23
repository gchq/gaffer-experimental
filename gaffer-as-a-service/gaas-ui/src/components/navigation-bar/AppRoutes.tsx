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

import CreateGraph from "../create-graph/create-graph";
import UserGuide from "../user-guide/user-guide";
import ViewGraph from "../view-graphs/view-graphs";
import AddCollaborator from "../add-collaborator/add-collaborator";
import ViewCollaborator from "../view-collaborators/view-collaborators";

const AppRoutes = [
    {
        path: "/creategraph",
        sidebarName: "Create Graph",
        component: CreateGraph,
    },
    {
        path: "/viewgraphs",
        sidebarName: "View Graphs",
        component: ViewGraph,
    },
    {
        path: "/userguide",
        sidebarName: "User Guide",
        component: UserGuide,
    },
    {
        path: "/addcollaborator",
        sidebarName: "",
        component: AddCollaborator,
    },
    {
        path: "/viewcollaborators",
        sidebarName: "",
        component: ViewCollaborator,
    },
];

export default AppRoutes;
