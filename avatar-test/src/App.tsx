import React from 'react';
import { VoiceChat } from './VoiceChat';

const App: React.FC = () => {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        Prueba de Avatar Animado con Audio
      </h1>

      <VoiceChat />
    </div>
  );
};

export default App;
