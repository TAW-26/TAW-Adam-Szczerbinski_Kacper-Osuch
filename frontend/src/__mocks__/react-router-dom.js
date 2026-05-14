// Manual mock for react-router-dom (v7 uses ESM exports that CRA/Jest 5 can't resolve).
// Place this file at src/__mocks__/react-router-dom.js — Jest will use it automatically
// for any import of 'react-router-dom' in tests.

const React = require('react');

const useNavigate = jest.fn(() => jest.fn());
const useLocation = jest.fn(() => ({ state: {}, pathname: '/', search: '', hash: '' }));
const useParams = jest.fn(() => ({}));

const Link = ({ children, to, ...rest }) =>
  React.createElement('a', { href: to, ...rest }, children);

const MemoryRouter = ({ children }) => React.createElement(React.Fragment, null, children);
const BrowserRouter = ({ children }) => React.createElement(React.Fragment, null, children);
const Routes = ({ children }) => React.createElement(React.Fragment, null, children);
const Route = () => null;
const Navigate = () => null;

module.exports = {
  useNavigate,
  useLocation,
  useParams,
  Link,
  MemoryRouter,
  BrowserRouter,
  Routes,
  Route,
  Navigate,
};
