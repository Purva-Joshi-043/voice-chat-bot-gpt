const resultDiv = document.getElementById("result");
const result2Div = document.getElementById("result2");
const startButton = document.getElementById("startButton");
let audioBuffer;

// Create a new SpeechRecognition object
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
let isRecording = false; // Track recording state

// Event listener for when speech recognition results are available
recognition.onresult = async (event) => {
  if (!isRecording) return; // Skip if not recording

  const { transcript } = event.results[event.results.length - 1][0];
  console.log("Speech to text:", transcript);

  // Display the transcribed text on the web page
  resultDiv.textContent = transcript;

  try {
    // Send the transcript to the server for processing
    const response = await fetch("/api/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transcript }),
    });

    if (response.ok) {
      const data = await response.json();
      const { audio, responseText } = data;
      // Display the transcribed text on the web page
      result2Div.textContent = responseText;

      // Stop any currently playing audio
      Howler.stop();

      // Play the new audio buffer
      const sound = new Howl({
        src: [audio],
        autoplay: true,
      });
      sound.play();
    } else {
      throw new Error("Request failed");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Event listener for the start button click
startButton.addEventListener("click", () => {
  if (!isRecording) {
    isRecording = true; // Start recording
    recognition.start();
    startButton.textContent = "Stop Recording";
  } else {
    recognition.stop();
    isRecording = false; // Stop recording
    startButton.textContent = "Start Recording";
    resultDiv.textContent = ""; // Clear displayed transcript
  }
});
