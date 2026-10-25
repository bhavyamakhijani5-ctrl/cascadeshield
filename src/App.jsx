import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';

// Lazy load all pages
const Landing = React.lazy(() => import('./pages/Landing'));
const Simulator = React.lazy(() => import('./pages/Simulator'));
const Optimizer = React.lazy(() => import('./pages/Optimizer'));
const Validation = React.lazy(() => import('./pages/Validation'));
const Reports = React.lazy(() => import('./pages/Reports'));
const About = React.lazy(() => import('./pages/About'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// ErrorBoundary Class Component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CascadeShield ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-navy-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full glass-panel-dark border-cascade-red/40 p-8 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-cascade-red/10 border border-cascade-red/40 flex items-center justify-center text-cascade-red mx-auto mb-4 shadow-[0_0_20px_rgba(255,59,92,0.3)]">
              <span className="text-3xl font-display font-bold">!</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">
              System Anomaly Detected
            </h2>
            <p className="text-xs text-gray-300 font-mono mb-5 break-words bg-black/40 p-3 rounded-lg border border-white/5 text-left">
              {this.state.error?.message || 'An unexpected client-side exception occurred.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 bg-cascade-cyan/20 border border-cascade-cyan/50 text-cascade-cyan rounded-lg text-xs font-mono uppercase tracking-wider hover:bg-cascade-cyan/30 transition-all"
              >
                Reload Node
              </button>
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-xs font-mono uppercase tracking-wider hover:bg-white/10 transition-all"
              >
                Reset to Base
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// LoadingScreen Component with animated spinner and CASCADESHIELD text
export function LoadingScreen() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="relative flex items-center justify-center w-20 h-20 mb-6">
        {/* Outer glowing spinner */}
        <div className="absolute inset-0 rounded-full border-2 border-cascade-cyan/20 border-t-cascade-cyan animate-spin" />
        {/* Inner reverse spinner */}
        <div className="absolute inset-2 rounded-full border-2 border-cascade-blue/20 border-b-cascade-blue animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
        {/* Center glowing dot */}
        <div className="w-8 h-8 rounded-full bg-cascade-cyan/10 border border-cascade-cyan/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.4)]">
          <div className="w-2.5 h-2.5 rounded-full bg-cascade-cyan animate-ping" />
        </div>
      </div>
      <span className="font-display font-bold text-sm tracking-[0.35em] text-cascade-cyan uppercase drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">
        CASCADESHIELD
      </span>
      <span className="text-[10px] font-mono text-gray-400 mt-2 tracking-widest uppercase">
        Initializing Disaster Matrix...
      </span>
    </div>
  );
}

// Motion Wrapper for Page Transitions
const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}

// Inner routes component accessing location for AnimatePresence
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrapper>
              <Landing />
            </PageWrapper>
          }
        />
        <Route
          path="/simulator"
          element={
            <PageWrapper>
              <Simulator />
            </PageWrapper>
          }
        />
        <Route
          path="/optimizer"
          element={
            <PageWrapper>
              <Optimizer />
            </PageWrapper>
          }
        />
        <Route
          path="/validation"
          element={
            <PageWrapper>
              <Validation />
            </PageWrapper>
          }
        />
        <Route
          path="/reports"
          element={
            <PageWrapper>
              <Reports />
            </PageWrapper>
          }
        />
        <Route
          path="/about"
          element={
            <PageWrapper>
              <About />
            </PageWrapper>
          }
        />
        <Route
          path="*"
          element={
            <PageWrapper>
              <NotFound />
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Suspense fallback={<LoadingScreen />}>
          <AnimatedRoutes />
        </Suspense>
      </Layout>
    </ErrorBoundary>
  );
}
