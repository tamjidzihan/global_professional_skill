import React from 'react';
import {
    Cookie,
    Sliders,
    Eye,
    Lock,
    Mail,
    Globe,
} from 'lucide-react';
import { LegalLayout, type TocItem } from '../components/LegalLayout';

const tocItems: TocItem[] = [
    { id: 'what-are-cookies', title: '1. What Are Cookies & Tracking Technologies' },
    { id: 'categories', title: '2. Categories of Cookies We Use' },
    { id: 'inventory-table', title: '3. Detailed Cookie Inventory' },
    { id: 'third-party-cookies', title: '4. Third-Party Integrations & Embeds' },
    { id: 'manage-cookies', title: '5. How to Control & Manage Cookies' },
    { id: 'browser-instructions', title: '6. Managing Cookies in Your Browser' },
    { id: 'impact-disabling', title: '7. Impact of Disabling Non-Essential Cookies' },
    { id: 'updates', title: '8. Updates to This Cookie Policy' },
    { id: 'contact', title: '9. Contact Us' },
];

export const CookiePage: React.FC = () => {
    return (
        <LegalLayout
            title="Cookie Policy"
            subtitle="Learn about the cookies, web storage, and telemetry technologies Global Professional Skill uses to deliver a seamless and secure learning experience."
            lastUpdated="September 2026"
            effectiveDate="January 1, 2026"
            version="2.2"
            readTime="5 min read"
            icon={Cookie}
            tocItems={tocItems}
        >
            {/* Callout Notice */}
            <div className="not-prose bg-linear-to-r from-amber-50/80 via-orange-50/50 to-amber-50/80 border border-amber-200/80 rounded-2xl p-5 mb-8">
                <div className="flex items-start gap-3">
                    <Cookie className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-1">
                            Your Privacy & Cookie Transparency
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            We use cookies and local browser storage to keep you securely signed in, remember your course video playback progress, and enhance platform responsiveness. We do not sell your browsing habits to third-party ad brokers.
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 1 */}
            <section id="what-are-cookies" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    1. What Are Cookies & Tracking Technologies
                </h2>
                <p>
                    Cookies are small text files placed on your device (computer, smartphone, or tablet) when you visit websites. They are widely used to make websites work efficiently, provide personalized experiences, remember login states, and deliver analytics information to site operators.
                </p>
                <p>
                    In addition to HTTP cookies, <strong>Global Professional Skill</strong> utilizes local browser storage (<code>localStorage</code> and <code>sessionStorage</code>) to store authentication tokens, UI layout settings, and cached course progress.
                </p>
            </section>

            {/* Section 2 */}
            <section id="categories" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    2. Categories of Cookies We Use
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose my-4 text-xs">
                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
                        <div className="flex items-center gap-2 mb-2 font-bold text-sm text-gray-900">
                            <Lock className="w-4 h-4 text-[#0066CC]" />
                            <span>1. Strictly Necessary (Essential)</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Required for platform core operations. These enable secure JWT authentication, session validation, course access verification, and CSRF protection. They cannot be turned off.
                        </p>
                    </div>

                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
                        <div className="flex items-center gap-2 mb-2 font-bold text-sm text-gray-900">
                            <Sliders className="w-4 h-4 text-emerald-600" />
                            <span>2. Functional & Preference</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Remember your preferences such as video playback speed (1x, 1.25x, 1.5x), player volume, active dashboard tabs, and language selections.
                        </p>
                    </div>

                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
                        <div className="flex items-center gap-2 mb-2 font-bold text-sm text-gray-900">
                            <Eye className="w-4 h-4 text-purple-600" />
                            <span>3. Analytics & Performance</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Collect aggregated anonymous data regarding page loading speeds, video buffering rates, and navigation paths to diagnose errors and enhance curriculum quality.
                        </p>
                    </div>

                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
                        <div className="flex items-center gap-2 mb-2 font-bold text-sm text-gray-900">
                            <Globe className="w-4 h-4 text-amber-600" />
                            <span>4. Social & Media Integrations</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Utilized when embedding instructional videos from YouTube/Vimeo or enabling one-click sharing of certificates on LinkedIn and social networks.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 3 */}
            <section id="inventory-table" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    3. Detailed Cookie Inventory
                </h2>
                <p>The table below provides a detailed inventory of key cookies and storage items used on our platform:</p>

                <div className="overflow-x-auto not-prose my-4">
                    <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                        <thead className="bg-gray-100 text-gray-800 font-semibold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="p-3 border-b">Key / Cookie Name</th>
                                <th className="p-3 border-b">Category</th>
                                <th className="p-3 border-b">Purpose</th>
                                <th className="p-3 border-b">Lifespan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-600">
                            <tr>
                                <td className="p-3 font-mono text-gray-900 font-medium">access_token / refresh_token</td>
                                <td className="p-3 text-blue-700 font-semibold">Essential</td>
                                <td className="p-3">Secures user login session and API authorization</td>
                                <td className="p-3">Session / 7 Days</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono text-gray-900 font-medium">csrftoken</td>
                                <td className="p-3 text-blue-700 font-semibold">Essential</td>
                                <td className="p-3">Protects against Cross-Site Request Forgery attacks</td>
                                <td className="p-3">1 Year</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono text-gray-900 font-medium">gpi_video_playback_state</td>
                                <td className="p-3 text-emerald-700 font-semibold">Functional</td>
                                <td className="p-3">Remembers video timestamp and resume position</td>
                                <td className="p-3">Persistent (Local)</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono text-gray-900 font-medium">gpi_active_tab</td>
                                <td className="p-3 text-emerald-700 font-semibold">Functional</td>
                                <td className="p-3">Remembers current dashboard sub-view</td>
                                <td className="p-3">Session</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono text-gray-900 font-medium">_ga, _gid</td>
                                <td className="p-3 text-purple-700 font-semibold">Analytics</td>
                                <td className="p-3">Anonymous visitor traffic and page performance metrics</td>
                                <td className="p-3">2 Years / 24 Hours</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Section 4 */}
            <section id="third-party-cookies" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    4. Third-Party Integrations & Embeds
                </h2>
                <p>
                    Certain pages feature content embedded from third-party services to enrich your learning experience:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                    <li><strong>Video Players (YouTube / Vimeo):</strong> When viewing embedded preview lessons, video providers may set cookies to measure viewer retention and bandwidth.</li>
                    <li><strong>Payment Gateways (bKash, Nagad, SSLCommerz):</strong> When accessing checkout, payment gateways use session cookies to secure transaction handshakes.</li>
                    <li><strong>Social Share Widgets:</strong> If you share your course completion certificate on LinkedIn or Facebook, those platforms may place tracking cookies.</li>
                </ul>
            </section>

            {/* Section 5 */}
            <section id="manage-cookies" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    5. How to Control & Manage Cookies
                </h2>
                <p>
                    You have full authority to accept, decline, or delete cookies at any time. Essential cookies necessary for login cannot be opted out of while actively using your student account, but you can block analytics and tracking cookies via your web browser settings.
                </p>
            </section>

            {/* Section 6 */}
            <section id="browser-instructions" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    6. Managing Cookies in Your Browser
                </h2>
                <p>
                    Most web browsers automatically accept cookies by default, but you can adjust your browser preferences to reject or prompt you before accepting cookies:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose my-3 text-xs">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <strong className="block text-gray-900 mb-1">Google Chrome</strong>
                        <p className="text-gray-600">Settings &gt; Privacy and Security &gt; Third-party cookies</p>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <strong className="block text-gray-900 mb-1">Mozilla Firefox</strong>
                        <p className="text-gray-600">Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data</p>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <strong className="block text-gray-900 mb-1">Apple Safari</strong>
                        <p className="text-gray-600">Preferences &gt; Privacy &gt; Manage Website Data</p>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <strong className="block text-gray-900 mb-1">Microsoft Edge</strong>
                        <p className="text-gray-600">Settings &gt; Cookies and site permissions &gt; Manage and delete cookies</p>
                    </div>
                </div>
            </section>

            {/* Section 7 */}
            <section id="impact-disabling" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    7. Impact of Disabling Non-Essential Cookies
                </h2>
                <p>
                    If you disable or delete browser cookies and web storage, please note that some platform features may operate with reduced functionality. For example, the system will not automatically remember where you stopped in a lecture video, and you will need to re-enter your credentials on every new visit.
                </p>
            </section>

            {/* Section 8 */}
            <section id="updates" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    8. Updates to This Cookie Policy
                </h2>
                <p>
                    We may update this policy periodically to reflect changes in our technologies or legal standards. Any revisions will take effect immediately upon publication on this page with an updated revision date.
                </p>
            </section>

            {/* Section 9 */}
            <section id="contact" className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    9. Contact Us
                </h2>
                <p>
                    If you have questions or feedback regarding our use of cookies and tracking technologies, please contact our Data Protection desk:
                </p>
                <div className="not-prose bg-linear-to-r from-amber-50/70 to-slate-50 border border-amber-200 rounded-2xl p-5 text-xs text-gray-700 space-y-2">
                    <p className="font-bold text-sm text-gray-900">Global Professional Institute — Privacy Team</p>
                    <p className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 text-amber-700" />
                        <span>Email: <a href="mailto:privacy@gpibd.com" className="text-amber-800 font-semibold hover:underline">privacy@gpibd.com</a></span>
                    </p>
                    <p className="flex items-center gap-2 text-gray-600">
                        <Globe className="w-4 h-4 text-amber-700" />
                        <span>Website: <a href="https://gpibd.com" className="text-amber-800 font-semibold hover:underline">https://gpibd.com</a></span>
                    </p>
                </div>
            </section>
        </LegalLayout>
    );
};

export default CookiePage;
