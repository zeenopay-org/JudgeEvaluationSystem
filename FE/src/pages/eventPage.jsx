import {React, useState} from 'react'
import DisplayEvent from '../components/Dashboard/Event/DisplayEvent'
import Layout from '../components/Layout/Layout'
import EditEvent from '../components/Dashboard/Event/EditEvent'

const eventPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true)
  return (
    <>
   <Layout>
        <DisplayEvent/>
   </Layout>
    </>
  )
}
export default eventPage
