import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/loginPage'
import HomePage from './pages/homePage';
import EventPage from './pages/eventPage';
import ContestantPage from './pages/contestantPage';
import JudgePage from './pages/judgePage';
import CreateEvent from './components/Dashboard/Event/CreateEvent';
import EditEvent from './components/Dashboard/Event/EditEvent';
import Layout from './components/Layout/Layout';
import CreateContestant from './components/Dashboard/Contestant/CreateContestant';
import CreateJudge from './components/Dashboard/Judge/createJudge';
import CreateRound from './components/Dashboard/Round/createRound';
import RoundPage from './pages/roundPage';
import RoundContestants from './components/Dashboard/Judge/RoundContestants';

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
        <Route path="/judge" element={<JudgePage />} />
        <Route path="/judge/create" element={<CreateJudge />} />
        <Route path="/round" element={<RoundPage />} />
        <Route path="/round/create" element={<Layout><CreateRound /></Layout>} />
        <Route path="/judge/rounds/:roundId/contestants" element={<Layout><RoundContestants /></Layout>} />
      </Routes>
    </>
  )
}

export default App
