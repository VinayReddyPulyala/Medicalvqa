import React from 'react';
import EntryPoint from "./components/EntryPoint";
import Chat from './components/Chat';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import PageNotFound from './components/PageNotFound';
import 'react-toastify/dist/ReactToastify.css';
import "D:/Project_3_1/medical_vqa/src/index.css"


function App() {
  return (
    <Router>
      <Routes>
        <Route index element={<EntryPoint />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
