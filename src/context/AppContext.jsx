import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/apiService";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const currency = import.meta.env.VITE_CURRENCY || '₹';
    
    // Debug currency value
    console.log('AppContext - Environment currency:', import.meta.env.VITE_CURRENCY);
    console.log('AppContext - Final currency:', currency);

    const navigate = useNavigate()
    const [showLogin, setShowLogin] = useState(false)
    const [userData, setUserData] = useState(null)

    const value = {
        showLogin, setShowLogin,
        backendUrl, currency, navigate,
        userData, setUserData
    } 

    useEffect(() => {
        const fetchUser = async () => {
            //debugger;
            const token = localStorage.getItem('authToken');
            if (!token) {
                setUserData(null);
                return;
            }
            try {
                const res = await authService.getMe();
                if (res.success) {
                    setUserData(res.user);
                } else {
                    setUserData(null);
                }
            } catch {
                setUserData(null);
            }
        };
        fetchUser();
    }, []);


    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
