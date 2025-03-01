"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, PartyPopper } from "lucide-react";
import { Button } from "./button";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  redirectText?: string;
  onRedirect?: () => void;
}

const backdrop = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

const modal = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    y: 50
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 25,
      delay: 0.1
    }
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    y: 50,
    transition: {
      duration: 0.2
    }
  }
};

const checkmark = {
  hidden: { scale: 0, opacity: 0, rotate: -45 },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15,
      delay: 0.3
    }
  }
};

// Animación para los confetis
const confetti = {
  hidden: { opacity: 0, y: -20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.5 + (i * 0.1),
      duration: 0.5,
      type: "spring",
      stiffness: 200
    }
  }),
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.2 }
  }
};

// Colores para los confetis
const confettiColors = [
  "bg-red-500", "bg-blue-500", "bg-green-500",
  "bg-yellow-500", "bg-purple-500", "bg-pink-500"
];

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = "¡Registro Exitoso!",
  message = "Tu cuenta ha sido creada correctamente.",
  redirectText = "Ir a iniciar sesión",
  onRedirect
}) => {
  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  // Generar posiciones aleatorias para los confetis
  const confettiElements = Array.from({ length: 30 }).map((_, i) => {
    const size = Math.floor(Math.random() * 8) + 5; // Tamaño entre 5-12px
    const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    const left = `${Math.floor(Math.random() * 100)}%`;
    const delay = 0.5 + (Math.random() * 0.5);
    const duration = 1 + Math.random() * 2;

    return (
      <motion.div
        key={i}
        className={`absolute rounded-full ${color}`}
        style={{
          width: size,
          height: size,
          left,
          top: -20,
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: [0, 1, 0],
          y: ['0%', '100%'],
          x: ['-10%', '10%', '-5%', '5%', '0%'],
          rotate: [0, 90, 180, 270, 360],
          transition: {
            delay,
            duration,
            repeat: 0,
            ease: "easeOut"
          }
        }}
        custom={i}
      />
    );
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="bg-white dark:bg-sky-900 rounded-xl shadow-lg relative max-w-md w-full p-6 overflow-hidden"
            variants={modal}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Confeti */}
            <div className="absolute inset-0 overflow-hidden">
              {confettiElements}
            </div>

            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-sky-800 transition-colors z-10"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            </button>

            <div className="flex flex-col items-center text-center relative z-10">
              <motion.div
                variants={checkmark}
                initial="hidden"
                animate="visible"
                className="mb-6 bg-green-100 dark:bg-green-900/30 p-3 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="h-14 w-14 text-green-600 dark:text-green-400" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.4, duration: 0.6 }
                }}
              >
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-2">
                  {title}
                  <motion.span
                    initial={{ rotate: -45, scale: 0 }}
                    animate={{
                      rotate: 0,
                      scale: 1,
                      transition: { delay: 0.7, duration: 0.5, type: "spring" }
                    }}
                  >
                    <PartyPopper className="h-6 w-6 text-yellow-500" />
                  </motion.span>
                </h2>
              </motion.div>

              <motion.p
                className="text-gray-600 dark:text-gray-300 mb-8"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { delay: 0.6, duration: 0.6 }
                }}
              >
                {message}
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-3 w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.8, duration: 0.6 }
                }}
              >
                {onRedirect && (
                  <Button
                    className="w-full sm:w-auto flex-1 bg-sky-600 hover:bg-sky-700 text-white"
                    onClick={onRedirect}
                  >
                    {redirectText}
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full sm:w-auto flex-1"
                  onClick={onClose}
                >
                  Cerrar
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessModal;
