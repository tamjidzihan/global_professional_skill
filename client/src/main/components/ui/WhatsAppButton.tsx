import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
    const phoneNumber = '8801978100105';
    const message = 'Hello! I have a question about Global Professional Skill.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 left-6 z-[9999] bg-[#25D366] text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform cursor-pointer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
                scale: 1, 
                opacity: 1,
                transition: { 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 1.5 
                }
            }}
            whileHover={{ 
                scale: 1.15,
                rotate: 5,
                transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.9 }}
            title="Chat with us on WhatsApp"
        >
            <motion.div
                animate={{
                    scale: [1, 1.15, 1],
                    boxShadow: [
                        "0 0 0 0px rgba(37, 211, 102, 0.4)",
                        "0 0 0 15px rgba(37, 211, 102, 0)",
                        "0 0 0 0px rgba(37, 211, 102, 0)"
                    ]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="rounded-full"
            >
                <FaWhatsapp size={32} />
            </motion.div>
            
            {/* Tooltip for better UX */}
            <span className="sr-only">Contact us on WhatsApp</span>
        </motion.a>
    );
};

export default WhatsAppButton;
