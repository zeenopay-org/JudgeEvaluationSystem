import { React, useState } from "react";
import Layout from "../components/Layout/Layout";
import CreateJudge from "../components/Dashboard/Judge/createJudge";

const judgePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <>
      <Layout>
        <CreateJudge />
      </Layout>
    </>
  );
};
export default judgePage;
