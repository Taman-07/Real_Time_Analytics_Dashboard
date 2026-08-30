import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Analytics from "./pages/Analytics";


function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* Default */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />


                {/* Authentication */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                <Route
                    path="/signup"
                    element={<Signup />}
                />


                {/* Analytics */}

                <Route
                    path="/analytics"
                    element={<Analytics />}
                />


                {/* Unknown URL */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>

    );

}


export default App;