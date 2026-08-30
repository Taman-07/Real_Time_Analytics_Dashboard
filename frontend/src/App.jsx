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

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                        />
                    }
                />

                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />

                <Route
                    path="/signup"
                    element={
                        <Signup />
                    }
                />

                <Route
                    path="/analytics"
                    element={
                        <Analytics />
                    }
                />

                {/* <Route
                    path="*"
                    element={
                        <Navigate
                            to="/analytics"
                        />
                    }
                /> */}

            </Routes>

        </BrowserRouter>

    );

}


export default App;