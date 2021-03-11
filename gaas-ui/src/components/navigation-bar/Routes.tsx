import ViewGraph from '../view-graphs/view-graphs';
import UserGuide from '../user-guide/user-guide';
import SimpleAddGraph from "../add-graph/SimpleAddGraph";
import ClusterNamespaces from "../cluster-namespaces/cluster-namespaces";

const Routes = [
    {
        path: '/AddGraph',
        sidebarName: 'Add Graph',
        component: SimpleAddGraph,
    },
    {
        path: '/ViewGraph',
        sidebarName: 'View Graphs',
        component: ViewGraph,
    },{
        path: '/Namespaces',
        sidebarName: 'Cluster Namespaces',
        component: ClusterNamespaces,
    },
    {
        path: '/UserGuide',
        sidebarName: 'User Guide',
        component: UserGuide,
    },
];

export default Routes;
