import React, { useState } from "react";
import Layout from "../components/Layout/Layout";
import DisplayTitle from "../components/Dashboard/Title/DisplayTitle";

const titlePage = () =>{
    return(
        <>
        <Layout>
            <DisplayTitle/>
        </Layout>
        </>
    )
}

export default titlePage;
