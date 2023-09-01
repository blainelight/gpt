// Initialize speech-to-text
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.interimResults = true;
let textBuffer = "";

// Initialize text-to-speech
const utterance = new SpeechSynthesisUtterance();

let lastTime = Date.now(); // For tracking last speech end time
let timeoutID = null;


async function getChatGPTResponse(inputText) {
  const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer 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`
    },
    body: JSON.stringify({
      prompt: inputText,
      max_tokens: 100
    })
  });
  const data = await response.json();
  return data.choices[0].text.trim();
}
let timeout;
recognition.onresult = function (event) {
  clearTimeout(timeout);
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      textBuffer = event.results[i][0].transcript;
      timeout = setTimeout(() => {
        recognition.stop();  // This will trigger recognition.onend
      }, 3000);
    }
  }
};


recognition.onend = async function () {
  const gptResponse = await getChatGPTResponse(textBuffer);
  utterance.text = gptResponse;
  window.speechSynthesis.speak(utterance);
  recognition.start();
};

// Function to toggle Jarvis
function toggleJarvis() {
  const button = document.getElementById('jarvisButton');
  if (recognition) {
    if (recognition.state === 'inactive') {
      recognition.start();
      button.style.backgroundColor = 'green';
    } else {
      recognition.stop();
      button.style.backgroundColor = 'red';
    }
  }
}

// Inject the Jarvis button into the GPT UI
const jarvisButton = document.createElement('button');
jarvisButton.id = 'jarvisButton';
jarvisButton.innerHTML = '🎙';  // Using Unicode for the mic icon
jarvisButton.style.backgroundColor = 'red';
jarvisButton.style.borderRadius = '50%';
jarvisButton.style.position = 'fixed';
jarvisButton.style.bottom = '20px';
jarvisButton.style.right = '20px';
jarvisButton.style.zIndex = '1000';
jarvisButton.addEventListener('click', toggleJarvis);

document.body.appendChild(jarvisButton);


// Start the whole thing
recognition.start();
