import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/loginPage'
import HomePage from './pages/homePage';
import EventPage from './pages/eventPage';
import CreateEvent from './components/Dashboard/Event/createEvent';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage/>}></Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/event" element={<EventPage />} />
        <Route path="/event/create" element={<CreateEvent />} />
      </Routes>
    </>
  )
}

export default App
