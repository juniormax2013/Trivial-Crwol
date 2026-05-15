const fs = require('fs');

async function updateRules() {
  const rules = fs.readFileSync('firestore.rules', 'utf8');
  
  const payload = {
    rules: {
      files: [
        {
          name: 'firestore.rules',
          content: rules
        }
      ]
    }
  };

  try {
    const res = await fetch('http://127.0.0.1:8080/emulator/v1/projects/trivial-app-bcrown:securityRules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const text = await res.text();
    console.log('Result:', res.status, text);
  } catch (err) {
    console.error('Error updating rules', err);
  }
}

updateRules();
