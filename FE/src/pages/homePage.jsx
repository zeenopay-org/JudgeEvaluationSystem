import { React, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout/Layout";
import CreateEvent from "../components/Dashboard/Event/CreateEvent";

function homePage() {
  const {token} = useContext(AuthContext);
  const navigate = useNavigate();
useEffect(()=>{
  console.log("Token:", token);
  if(!token){
    navigate("/login");
  }
}, [token, navigate]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div>
      <Layout>
        <CreateEvent />
      </Layout>
    </div>
  );
}
export default homePage;
