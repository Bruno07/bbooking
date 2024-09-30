import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import Checkout from "./Checkout";
import { Sale } from "./Sale";
import { useKeycloak } from '@react-keycloak/web';
import { PrivateRoute } from "./PrivateRoute";

export default function RouterApp() {

    const {initialized} = useKeycloak()

    if (!initialized) {
        return <div className='flex min-h-screen justify-center items-center'>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-teal-700"></div>
        </div>
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/checkout/:id" element={
                    <PrivateRoute>
                        <Checkout/>
                    </PrivateRoute>
                } />
                <Route path="/vendas" element={
                    <PrivateRoute>
                        <Sale/>
                    </PrivateRoute>
                } />
            </Routes>
        </Router>
    )
}