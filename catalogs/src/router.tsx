import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import Checkout from "./Checkout";
import { Sale } from "./Sale";

export default function RouterApp() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/checkout/:id" element={<Checkout />} />
                <Route path="/vendas" element={<Sale />} />
            </Routes>
        </Router>
    )
}