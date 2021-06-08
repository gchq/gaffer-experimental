import CreateGraph from "../create-graph/create-graph";
import ClusterNamespaces from "../cluster-namespaces/cluster-namespaces";
import UserGuide from "../user-guide/user-guide";
import ViewGraph from "../view-graphs/view-graphs";

const Routes = [
    {
        path: "/creategraph",
        sidebarName: "Create Graph",
        component: CreateGraph,
    },
    {
        path: "/graphs",
        sidebarName: "View Graphs",
        component: ViewGraph,
    },
    {
        path: "/namespaces",
        sidebarName: "Cluster Namespaces",
        component: ClusterNamespaces,
    },
    {
        path: "/userguide",
        sidebarName: "User Guide",
        component: UserGuide,
    },
];

export default Routes;
