import { React, useState } from "react";
import DisplayContestant from "../components/Dashboard/Contestant/DisplayContestant";
import Layout from "../components/Layout/Layout";

const contestantPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div>
      <Layout>
        <DisplayContestant />
      </Layout>
    </div>
  );
};

export default contestantPage;
