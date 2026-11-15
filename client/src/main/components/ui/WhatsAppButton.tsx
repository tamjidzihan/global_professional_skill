import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { useState } from 'react';

const WhatsAppButton = () => {
    const [hovered, setHovered] = useState(false);
    const phoneNumber = '8801978100105';
    const message = 'Hello! I have a question about Global Professional Skill.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <div className="fixed bottom-6 left-6 z-9999 flex items-center gap-3">
            {/* Button */}
            <motion.a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Chat with us on WhatsApp"
                onHoverStart={() => setHovered(true)}
                onHoverEnd={() => setHovered(false)}
                initial={{ scale: 0.85, opacity: 0, y: 8 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 28, delay: 0.15 }}
                whileHover={{ scale: 1.06, transition: { type: 'spring', stiffness: 500, damping: 28 } }}
                whileTap={{ scale: 0.96 }}
                className="relative isolate w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer"
            >
                <span
                    aria-hidden="true"
                    className="whatsapp-pulse absolute inset-0 z-0 rounded-full border-2 border-[#25D366]"
                />

                <FaWhatsapp size={26} className="relative z-10" />
            </motion.a>

            {/* Tooltip label — appears to the right */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, x: 8, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="relative bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap pointer-events-none"
                    >
                        {/* Arrow pointing left toward button */}
                        <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                        Chat with us on WhatsApp
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WhatsAppButton;