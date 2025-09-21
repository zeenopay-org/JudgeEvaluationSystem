import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/loginPage'
import HomePage from './pages/homePage';
import EventPage from './pages/eventPage';
import ContestantPage from './pages/contestantPage';
import CreateEvent from './components/Dashboard/Event/CreateEvent';
import EditEvent from './components/Dashboard/Event/EditEvent';
import Layout from './components/Layout/Layout';
import CreateContestant from './components/Dashboard/Contestant/CreateContestant';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage/>}></Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/event" element={<EventPage />} />
        <Route path="/event/create" element={<CreateEvent />} />
        <Route path="/event/edit/:id" element={<Layout><EditEvent /></Layout>} />
        <Route path="/contestant" element={<ContestantPage/>} />
        <Route path="/contestant/create/:eventId" element={<Layout><CreateContestant /></Layout>} />
      </Routes>
    </>
  )
}

export default App
