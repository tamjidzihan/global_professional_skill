/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
    Settings,
    Save,
    QrCode,
    Phone,
    Upload,
    Image as ImageIcon,
    CheckCircle2,
    AlertCircle,
    Info
} from 'lucide-react';
import { getSiteSettings, updateSiteSettings } from '../../../../lib/api';
import type { SiteSettings } from '../../../../types';
import Breadcrumb from '../../../components/Breadcrumb';
import { toast } from 'react-hot-toast';
import { isAxiosError } from 'axios';

const SiteSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [merchantNumber, setMerchantNumber] = useState('');
    const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
    const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await getSiteSettings();
            if (response.data.success) {
                const data = response.data.data;
                setSettings(data);
                setMerchantNumber(data.bkash_merchant_number);
                setQrCodePreview(data.bkash_qr_code);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setQrCodeFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setQrCodePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append('bkash_merchant_number', merchantNumber);
            if (qrCodeFile) {
                formData.append('bkash_qr_code', qrCodeFile);
            }

            const response = await updateSiteSettings(formData);
            if (response.data.success) {
                toast.success('Settings updated successfully');
                setSettings(response.data.data);
                setQrCodeFile(null); // Reset file input
            }
        } catch (error) {
            let message = 'Failed to update settings';
            if (isAxiosError(error)) {
                message = error.response?.data?.error?.message || message;
            }
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="pb-10">
            <Breadcrumb
                name="Platform Settings"
                subtitle="Configure global payment details and site info"
                icon={Settings}
            />

            <div className="mt-8 max-w-4xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* bKash Configuration Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-pink-50 px-6 py-4 border-b border-pink-100 flex items-center justify-between">
                            <div className="flex items-center">
                                <QrCode className="w-5 h-5 text-[#D12053] mr-3" />
                                <h2 className="text-lg font-bold text-gray-800">bKash Payment Details</h2>
                            </div>
                            {settings?.updated_at && (
                                <span className="text-xs text-pink-600 font-medium bg-white px-2 py-1 rounded-lg border border-pink-100">
                                    Last Updated: {new Date(settings.updated_at).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Merchant Number Input */}
                            <div className="max-w-md">
                                <label className="block text-sm font-bold text-gray-700 mb-2  items-center gap-2">
                                    <Phone className="w-4 h-4 text-pink-500" />
                                    Merchant bKash Number
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={merchantNumber}
                                        onChange={(e) => setMerchantNumber(e.target.value)}
                                        placeholder="e.g. 01XXXXXXXXX"
                                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white focus:border-transparent transition-all outline-none text-lg font-mono tracking-wider"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    This number will be displayed to all students on the checkout page.
                                </p>
                            </div>

                            {/* QR Code Upload */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-4  items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-pink-500" />
                                    bKash QR Code Image
                                </label>

                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    {/* Preview Area */}
                                    <div className="w-48 h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                                        {qrCodePreview ? (
                                            <>
                                                <img
                                                    src={qrCodePreview}
                                                    alt="bKash QR Code"
                                                    className="w-full h-full object-contain p-2"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <label className="cursor-pointer bg-white text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                                                        Change Image
                                                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                                    </label>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-4">
                                                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                                <p className="text-[10px] text-gray-400 font-medium">No QR Code Uploaded</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload Instructions */}
                                    <div className="flex-1 space-y-4">
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                                            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                            <div className="text-sm text-blue-800 space-y-1">
                                                <p className="font-bold">Image Recommendations:</p>
                                                <ul className="list-disc list-inside text-xs space-y-1 opacity-80">
                                                    <li>Square aspect ratio (1:1) is best</li>
                                                    <li>Clear, high-contrast QR code</li>
                                                    <li>Max size: 2MB (JPG, PNG, WEBP)</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <label className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-sm">
                                            <Upload className="w-4 h-4 mr-2 text-violet-600" />
                                            {qrCodePreview ? 'Upload New QR Code' : 'Select QR Code Image'}
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={handleFileChange}
                                                accept="image/*"
                                            />
                                        </label>
                                        {qrCodeFile && (
                                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Selected: {qrCodeFile.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Action */}
                        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-amber-600">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-xs font-medium">Changes take effect immediately for all students.</span>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Settings
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SiteSettingsPage;
