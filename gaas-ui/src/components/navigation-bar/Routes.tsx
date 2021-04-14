import AddGraph from "../add-graph/AddGraph";
import ClusterNamespaces from "../cluster-namespaces/cluster-namespaces";
import UserGuide from "../user-guide/user-guide";
import ViewGraph from "../view-graphs/view-graphs";

const Routes = [
    {
        path: "/AddGraph",
        sidebarName: "Add Graph",
        component: AddGraph,
    },
    {
        path: "/ViewGraph",
        sidebarName: "View Graphs",
        component: ViewGraph,
    },
    {
        path: "/Namespaces",
        sidebarName: "Cluster Namespaces",
        component: ClusterNamespaces,
    },
    {
        path: "/UserGuide",
        sidebarName: "User Guide",
        component: UserGuide,
    },
];

export default Routes;
