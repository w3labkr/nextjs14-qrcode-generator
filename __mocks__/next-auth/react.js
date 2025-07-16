const useSession = jest.fn(() => ({
  data: null,
  status: "loading",
  update: jest.fn(),
}));

const signIn = jest.fn(() => Promise.resolve({ error: null }));
const signOut = jest.fn(() => Promise.resolve());
const getCsrfToken = jest.fn(() => Promise.resolve("mock-csrf-token"));
const getProviders = jest.fn(() => Promise.resolve({}));
const getSession = jest.fn(() => Promise.resolve(null));

const SessionProvider = ({ children }) => children;

module.exports = {
  useSession,
  signIn,
  signOut,
  getCsrfToken,
  getProviders,
  getSession,
  SessionProvider,
};