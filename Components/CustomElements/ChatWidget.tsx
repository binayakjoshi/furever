'use client';

import { useState } from 'react';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '360px',
            height: '450px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 1000,
            background: 'white',
          }}
        >
          <iframe
            title="Pet Assistant"
            allow="microphone;"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            src="https://console.dialogflow.com/api-client/demo/embedded/furever-lylo"
          />
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#4A90E2',
          color: 'white',
          fontSize: '28px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          zIndex: 1001,
        }}
      >
        💬
      </button>
    </>
  );
}
