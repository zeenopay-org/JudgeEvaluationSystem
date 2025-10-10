import React, { useState } from "react";
import Layout from "../components/Layout/Layout";
import DisplayScore from "../components/Dashboard/Score/DisplayScore";

const scorePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <>
      <Layout>
        <DisplayScore />
      </Layout>
    </>
  );
};

export default scorePage;
