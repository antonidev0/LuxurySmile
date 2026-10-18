import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; 
import { AuthProvider } from './context/AuthContext.jsx';
import { AppointmentProvider } from './context/AppointmentContext.jsx';
import { AdminProvider } from './context/AdminContext.jsx';
import App from './App.jsx';
import './index.css';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AppointmentProvider>
        <AdminProvider> 
        <BrowserRouter> 
          <App /> 
        </BrowserRouter>
      </AdminProvider>
      </AppointmentProvider>
    </AuthProvider>
  </React.StrictMode>
);