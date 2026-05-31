import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";

import BatchCreate from "../pages/BatchCreate";
import BatchList from "../pages/BatchList";
import BatchDetails from "../pages/BatchDetails";

import GroupList from "../pages/GroupList";
import GroupDetails from "../pages/GroupDetails";

import Users from "../pages/Users/Users";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <DashboardLayout>
                <Routes>
                    <Route
                        path="/batches/create"
                        element={<BatchCreate />}
                    />

                    <Route
                        path="/batches"
                        element={<BatchList />}
                    />

                    <Route
                        path="/batches/:id"
                        element={<BatchDetails />}
                    />

                    <Route
                        path="/groups"
                        element={<GroupList />}
                    />

                    <Route
                        path="/groups/:id"
                        element={<GroupDetails />}
                    />

                    <Route path="/users" element={<Users />} />
                </Routes>
            </DashboardLayout>
        </BrowserRouter>
    );
}