import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router } from 'react-router-dom';

import { Header } from './components/layout/header';
import { Layout } from './components/layout/layout';
import ScrollToTop from './hooks/scrollTop';
import { Routes } from './routes';
import { AuthProvider } from './contexts/authContext';
import { WebSocketProvider } from './contexts/websocketContext';

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <ScrollToTop />
          <Header />
          <Layout>
            <Routes />
            <ToastContainer />
          </Layout>
        </Router>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
