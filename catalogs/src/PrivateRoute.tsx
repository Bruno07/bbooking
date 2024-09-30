import { useKeycloak } from '@react-keycloak/web';
import React, { Children, Component } from 'react';
import { BrowserRouter as Router, Routes, Navigate, Route, RouteProps } from 'react-router-dom';

interface PrivateRouteProps extends RouteProps {

}

export const PrivateRoute = ({children}) => {
    const {keycloak} = useKeycloak()

    if (!keycloak.authenticated) {
        keycloak.login()
    }

    return children
}