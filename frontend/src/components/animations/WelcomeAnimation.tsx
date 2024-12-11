import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe2, X } from 'lucide-react';

const LoadingAnimation = ({ status }) => {
  // Variantes para las diferentes animaciones
  const variants = {
    globe: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    },
    check: {
      scale: [0.8, 1],
      opacity: 1,
      pathLength: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    error: {
      scale: [0.8, 1],
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-white/80 backdrop-blur-sm"
    >
      <div className="relative w-16 h-16">
        {/* Loader - Globe */}
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={variants.globe}
            className="text-blue-500"
          >
            <Globe2 size={64} strokeWidth={1.5} />
          </motion.div>
        )}

        {/* Success - Checkmark */}
        {status === 'success' && (
          <motion.svg
            viewBox="0 0 50 50"
            className="w-16 h-16"
          >
            <motion.circle
              cx="25"
              cy="25"
              r="20"
              stroke="#22c55e"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
            <motion.path
              d="M15 25 L23 33 L35 17"
              stroke="#22c55e"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={variants.check}
            />
          </motion.svg>
        )}

        {/* Error - X */}
        {status === 'error' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={variants.error}
            className="text-red-500"
          >
            <div className="relative">
              <X size={64} strokeWidth={1.5} />
              <motion.div
                className="absolute inset-0 bg-red-100 rounded-full -z-10"
                initial={{ scale: 0 }}
                animate={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Componente de exportación principal
export default function AuthAnimation({ isOpen, status, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <LoadingAnimation status={status} />
      )}
    </AnimatePresence>
  );
}