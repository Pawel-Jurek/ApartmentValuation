
import './App.css';
import React, { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { AuthWrapper } from './auth/AuthWrapper';
import { BrowserRouter} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

function App() {

  return (
    <>
      <BrowserRouter>
        <AuthWrapper />
      </BrowserRouter>

      <ToastContainer 
        stacked
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        
      />
      
    </>
  );
}

export default App;
