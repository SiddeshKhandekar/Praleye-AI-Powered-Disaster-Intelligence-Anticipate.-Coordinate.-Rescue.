import '@testing-library/jest-dom';

// Mock Web Speech Recognition and Synthesis for tests
(window as any).webkitSpeechRecognition = class {
  start() {}
  stop() {}
};

window.speechSynthesis = {
  speak: () => {},
  cancel: () => {},
} as any;
