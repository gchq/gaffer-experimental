import CreateGraph from "../create-graph/create-graph";
import UserGuide from "../user-guide/user-guide";
import ViewGraph from "../view-graphs/view-graphs";

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
];

export default AppRoutes;
