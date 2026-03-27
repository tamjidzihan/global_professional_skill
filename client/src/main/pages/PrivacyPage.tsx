import { Lock, Eye, Database, Share2, Bell, ShieldCheck } from 'lucide-react';

const PrivacyPage = () => {
    const lastUpdated = "March 20, 2024";

    const policies = [
        {
            title: "Information We Collect",
            icon: Database,
            content: "We collect information you provide directly to us when you create an account, enroll in a course, or communicate with us. This includes your name, email address, phone number, and payment information."
        },
        {
            title: "How We Use Your Data",
            icon: Eye,
            content: "Your information is used to provide, maintain, and improve our services, process transactions, send technical notices, and communicate with you about courses, offers, and events."
        },
        {
            title: "Data Security",
            icon: Lock,
            content: "We implement robust security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. We use industry-standard encryption for sensitive data."
        },
        {
            title: "Information Sharing",
            icon: Share2,
            content: "We do not sell your personal information. We may share data with service providers who perform services on our behalf, or when required by law to protect our rights or comply with a judicial proceeding."
        },
        {
            title: "Your Privacy Rights",
            icon: ShieldCheck,
            content: "You have the right to access, correct, or delete your personal data. You can manage your communication preferences through your account settings or by contacting us directly."
        },
        {
            title: "Policy Updates",
            icon: Bell,
            content: "We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the 'Last Updated' date."
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-linear-to-r from-green-600 to-teal-700 px-8 py-12 text-white">
                        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-green-100">Your privacy is our priority. Learn how we handle your data.</p>
                        <div className="mt-6 inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-1 text-sm border border-white/20">
                            Last Updated: {lastUpdated}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12">
                        <div className="prose prose-green max-w-none">
                            <p className="text-gray-600 mb-12 leading-relaxed">
                                At Global Professional Institute (GPI), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our platform.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {policies.map((policy, index) => {
                                    const Icon = policy.icon;
                                    return (
                                        <div key={index} className="flex flex-col">
                                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                                                <Icon className="w-6 h-6 text-green-600" />
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900 mb-3">{policy.title}</h2>
                                            <p className="text-gray-600 leading-relaxed text-sm">
                                                {policy.content}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Data Protection Commitment */}
                            <div className="mt-16 p-8 bg-gray-50 rounded-2xl border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Our Commitment to Data Protection</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    GPI complies with international data protection standards. We ensure that all personal data is processed lawfully, fairly, and in a transparent manner. We only collect data for specified, explicit, and legitimate purposes.
                                </p>
                            </div>

                            {/* Contact Section */}
                            <div className="mt-12 text-center">
                                <p className="text-gray-500 text-sm">
                                    Have concerns about your privacy? Contact our Data Protection Officer at
                                    <br />
                                    <a href="mailto:privacy@gpibd.com" className="text-green-600 font-bold hover:underline">privacy@gpibd.com</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
