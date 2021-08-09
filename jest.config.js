module.exports = {
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  // Local da config
  setupFilesAfterEnv: ["<rootDir>/src/tests/setupTests.ts"],
  transform: {
    // Transformar os arquivos para uma maneira que o jest consiga entender
    "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest",
  },
  // Fala qual ambiente vamos executar
  testEnvironment: "jsdom",
};
