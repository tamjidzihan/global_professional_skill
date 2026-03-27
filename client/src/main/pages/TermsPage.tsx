import { Shield, Book, UserCheck, CreditCard, Scale, AlertCircle } from 'lucide-react';

const TermsPage = () => {
    const lastUpdated = "March 20, 2024";

    const sections = [
        {
            title: "1. Acceptance of Terms",
            icon: Shield,
            content: "By accessing or using the Global Professional Institute (GPI) platform, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services."
        },
        {
            title: "2. User Accounts",
            icon: UserCheck,
            content: "To access most features of our platform, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information during registration."
        },
        {
            title: "3. Course Enrollment and Access",
            icon: Book,
            content: "When you enroll in a course, you get a license to view it via the GPI services and no other use. You may not reproduce, redistribute, transmit, assign, sell, broadcast, rent, share, lend, modify, adapt, edit, create derivative works of, sublicense, or otherwise transfer or use any course unless we give you explicit permission to do so."
        },
        {
            title: "4. Payments and Refunds",
            icon: CreditCard,
            content: "Payments for courses are processed through secure third-party payment gateways. Prices are subject to change without notice. Our refund policy varies by course type and duration. Please review specific course refund terms before enrollment."
        },
        {
            title: "5. Intellectual Property",
            icon: Scale,
            content: "All content on the GPI platform, including but not limited to text, graphics, logos, images, videos, and software, is the property of Global Professional Institute or its content suppliers and is protected by international copyright laws."
        },
        {
            title: "6. Limitation of Liability",
            icon: AlertCircle,
            content: "GPI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses."
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-linear-to-r from-blue-600 to-indigo-700 px-8 py-12 text-white">
                        <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
                        <p className="text-blue-100">Please read these terms carefully before using our services.</p>
                        <div className="mt-6 inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-1 text-sm border border-white/20">
                            Last Updated: {lastUpdated}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12">
                        <div className="prose prose-blue max-w-none">
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Welcome to Global Professional Institute (GPI). These Terms and Conditions govern your use of our website and services. By using GPI, you agree to these terms in full.
                            </p>

                            <div className="space-y-12">
                                {sections.map((section, index) => {
                                    const Icon = section.icon;
                                    return (
                                        <div key={index} className="relative pl-12">
                                            <div className="absolute left-0 top-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                                <Icon className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
                                            <p className="text-gray-600 leading-relaxed">
                                                {section.content}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Contact Section */}
                            <div className="mt-16 p-6 bg-blue-50 rounded-xl border border-blue-100">
                                <h3 className="text-lg font-bold text-blue-900 mb-2">Questions about our Terms?</h3>
                                <p className="text-blue-800 text-sm">
                                    If you have any questions about these Terms and Conditions, please contact us at 
                                    <a href="mailto:info@gpibd.com" className="font-bold ml-1 underline decoration-2 underline-offset-4">info@gpibd.com</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
