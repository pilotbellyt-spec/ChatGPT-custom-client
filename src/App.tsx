import { Route, Routes } from 'react-router-dom';
import { ChatPage } from './pages/ChatPage';

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ color: '#e2e8f0', padding: '2rem' }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p>Coming soon. Core Chat experience is ready in BetterGPT.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/library" element={<Placeholder title="Prompt Library" />} />
      <Route path="/settings" element={<Placeholder title="Settings" />} />
      <Route path="*" element={<ChatPage />} />
    </Routes>
  );
}
