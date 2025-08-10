export function speakText(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Web Speech API is not supported in this browser.'));
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0; // Adjust speed
    utterance.pitch = 1.0; // Adjust pitch
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(event.error));

    console.log('speakText', utterance);
    window.speechSynthesis.speak(utterance);
  });
}
