import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MainLayout from './pages/MainLayout';
import AboutPage from './pages/AboutPage';
import DocumentsPage from './pages/DocumentsPage';
import FileDetailsPage from './pages/FileDetailsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainLayout />}>
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="documents/:fileId" element={<FileDetailsPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;