import Dashboard from '../pages/Dashboard';
import Login from '../pages/login';
import PageNotFound from '../pages/others/pagenotfound';
import Registration from '../pages/Registration';
// import ResourcePage from '../pages/resource';


const authProtectedRoutes = [
    // { path: '/a/dashboard', component: <Dashboard /> },

];

const publicRoutes = [
    { path: '/login', component: <Login /> },
    { path: '/dashboard/*', component: <Dashboard /> },
    { path: '/registration', component: <Registration /> },

    // Page Not Found route
    { path: '/page-not-found', component: <PageNotFound /> }
];

export { authProtectedRoutes, publicRoutes };
