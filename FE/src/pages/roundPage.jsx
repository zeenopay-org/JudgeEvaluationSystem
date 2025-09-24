import React, { useState } from 'react'
import Layout from '../components/Layout/Layout'
import DisplayRound from '../components/Dashboard/Round/displayRound'

const RoundPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    return (
        <>
        <Layout>
           <DisplayRound/>
        </Layout>
        </>
    )
}
export default RoundPage