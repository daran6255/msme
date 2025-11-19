// Index.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';  // Import Provider from react-redux

import store from '../helpers/store';  // Import the Redux store
import { publicRoutes } from './allroutes';

type RouteType = {
    path: string;
    component: React.ReactNode;
    roles?: string[];
};

const Index: React.FC = () => {
    return (
        <Provider store={store}>  {/* Wrap the app with Provider */}
            <Router>
                <Routes>
                    {/* Public Routes */}
                    {publicRoutes.map((route: RouteType, idx: number) => (
                        <Route
                            path={route.path}
                            element={route.component}
                            key={idx}
                        />
                    ))}
                </Routes>
            </Router>
        </Provider>
    );
};

export default Index;
