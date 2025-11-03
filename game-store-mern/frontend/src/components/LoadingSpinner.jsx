import PropTypes from 'prop-types';
import { Gamepad2 } from 'lucide-react';

function LoadingSpinner({ message = 'Loading…', fullscreen = false }) {
  const containerClasses = fullscreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center gap-4 py-10';

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className="relative flex flex-col items-center">
        <Gamepad2 className="h-16 w-16 text-primary-600 animate-joystick" />
        <div className="joystick-shadow mt-2" aria-hidden="true" />
      </div>
      {message && <p className="text-sm font-medium text-gray-600">{message}</p>}
      <span className="sr-only">{message}</span>
    </div>
  );
}

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  fullscreen: PropTypes.bool,
};

export default LoadingSpinner;
