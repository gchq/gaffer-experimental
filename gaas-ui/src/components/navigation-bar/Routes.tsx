import ViewGraph from '../view-graphs/view-graphs';
import UserGuide from '../user-guide/user-guide';
import SimpleAddGraph from "../add-graph/SimpleAddGraph";

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
    },
    {
        path: '/UserGuide',
        sidebarName: 'User Guide',
        component: UserGuide,
    },
];

export default Routes;
