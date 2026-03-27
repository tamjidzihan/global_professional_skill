import { MapPin, Phone, Mail, Clock, Send, Globe } from 'lucide-react';
import { FaWhatsapp, FaFacebook, FaLinkedin, FaYoutube, FaInstagram } from 'react-icons/fa';

const ContactPage = () => {
    const contactInfo = [
        {
            title: "Head Office",
            content: "House-5, Kolotan School Road, Notunbazar, Vatara, Dhaka-1212, Bangladesh",
            icon: MapPin,
            color: "text-blue-600",
            bg: "bg-blue-50",
            link: "https://maps.app.goo.gl/b7jfULcxSAWiVtiA6"
        },
        {
            title: "Call Us",
            content: "+88 01978-100105",
            icon: Phone,
            color: "text-green-600",
            bg: "bg-green-50",
            link: "tel:+8801978100105"
        },
        {
            title: "WhatsApp",
            content: "+88 01978-100105",
            icon: FaWhatsapp,
            color: "text-green-500",
            bg: "bg-green-50",
            link: "https://wa.me/8801978100105"
        },
        {
            title: "Email Us",
            content: "info@gpibd.com",
            icon: Mail,
            color: "text-purple-600",
            bg: "bg-purple-50",
            link: "mailto:info@gpibd.com"
        }
    ];

    const socialLinks = [
        { icon: FaFacebook, link: "https://www.facebook.com/gpibd360", color: "hover:text-blue-600" },
        { icon: FaLinkedin, link: "https://www.linkedin.com/in/global-professional-institute-2b80583b1", color: "hover:text-blue-700" },
        { icon: FaYoutube, link: "https://www.youtube.com/@GlobalProfessionalInstitute", color: "hover:text-red-600" },
        { icon: FaInstagram, link: "https://www.instagram.com/gpibd360", color: "hover:text-pink-600" }
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="bg-[#FCF8F1] bg-opacity-30 text-black py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
                    <p className="text-blue-800 max-w-2xl mx-auto text-lg">
                        Have questions or need support? We're here to help you on your learning journey.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 mb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Information Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        {contactInfo.map((info, index) => {
                            const Icon = info.icon;
                            return (
                                <a
                                    href={info.link}
                                    key={index}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-12 h-12 ${info.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <Icon className={`w-6 h-6 ${info.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{info.title}</p>
                                            <p className="text-gray-900 font-medium">{info.content}</p>
                                        </div>
                                    </div>
                                </a>
                            );
                        })}

                        {/* Working Hours Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-4 mb-4 text-yellow-600">
                                <Clock className="w-6 h-6" />
                                <h3 className="font-bold">Working Hours</h3>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Sun - Thu:</span>
                                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Friday:</span>
                                    <span className="font-medium text-red-500">Closed</span>
                                </div>
                            </div>
                        </div>

                        {/* Social Links Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Follow Us</h3>
                            <div className="flex space-x-4">
                                {socialLinks.map((social, index) => (
                                    <a
                                        href={social.link}
                                        key={index}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 ${social.color} transition-all border border-gray-100`}
                                    >
                                        <social.icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-8 md:p-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                placeholder="+880..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                            <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none">
                                                <option>General Inquiry</option>
                                                <option>Course Support</option>
                                                <option>Technical Issue</option>
                                                <option>Payment Query</option>
                                                <option>Partnership</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                        <textarea
                                            rows={5}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                            placeholder="How can we help you today?"
                                        ></textarea>
                                    </div>
                                    <button className="w-full md:w-auto px-8 py-4 bg-linear-to-r from-[#76C043] to-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2">
                                        <span>Send Message</span>
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>

                            {/* Trust Badge Bar */}
                            <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex flex-wrap justify-center gap-8">
                                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                                    <span>Secure Connection</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                                    <Globe className="w-4 h-4 text-green-500" />
                                    <span>24/7 Global Support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section - Placeholder or Embed */}
            <div className="container mx-auto px-4 mb-20">
                <div className="h-112.5 bg-gray-200 rounded-3xl overflow-hidden relative shadow-inner">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.62725063065!2d90.42144797589574!3d23.79627708770732!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c700346087b3%3A0xc6c42a22026850c9!2sGlobal%20Professional%20Institute!5e0!3m2!1sen!2sbd!4v1711000000000!5m2!1sen!2sbd"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="GPI Office Location"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

const ShieldCheck = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
);

export default ContactPage;
