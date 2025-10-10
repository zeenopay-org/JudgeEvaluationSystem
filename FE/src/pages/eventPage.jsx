import { React, useState, useContext } from "react";
import DisplayEvent from "../components/Dashboard/Event/DisplayEvent";
import DisplayJudge from "../components/Dashboard/Judge/DisplayJudge";
import Layout from "../components/Layout/Layout";
import EditEvent from "../components/Dashboard/Event/EditEvent";
import { AuthContext } from "../context/AuthContext";

const eventPage = () => {
  const { admin, judge } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <>
      <Layout>
        {admin && <DisplayEvent />}
        {judge && <DisplayJudge />}
      </Layout>
    </>
  );
};
export default eventPage;
