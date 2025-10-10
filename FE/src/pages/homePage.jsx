import { React, useState } from "react";
import Layout from "../components/Layout/Layout";
import CreateEvent from "../components/Dashboard/Event/CreateEvent";

function homePage() {
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
