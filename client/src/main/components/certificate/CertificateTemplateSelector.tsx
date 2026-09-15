import React from 'react';
import type { CertificateTemplateId } from './types';
import { Check, Sparkles, Award, Compass, ShieldCheck } from 'lucide-react';

interface TemplateOption {
    id: CertificateTemplateId;
    title: string;
    subtitle: string;
    description: string;
    accentColor: string;
    borderColor: string;
    icon: React.ComponentType<{ className?: string }>;
}

const TEMPLATES: TemplateOption[] = [
    {
        id: 'template_1',
        title: 'Academic Prestige',
        subtitle: 'Classic Academic Design (Primary)',
        description: 'Navy and royal gold double borders, 24-point scalloped star seal, barcode, corner ornaments, and parchment glow.',
        accentColor: 'from-[#102f52] to-[#c79b43]',
        borderColor: 'border-[#102f52]',
        icon: Award,
    },
    {
        id: 'template_2',
        title: 'Professional Classic',
        subtitle: 'Ornate Institutional Style',
        description: 'Multi-line filigree frame with corner flourishes, formal serif typography, and golden medallion laurel crest.',
        accentColor: 'from-[#1a2e4c] to-[#b8860b]',
        borderColor: 'border-[#b8860b]',
        icon: Compass,
    },
    {
        id: 'template_3',
        title: 'Modern Minimal',
        subtitle: 'Contemporary Clean Aesthetic',
        description: 'Clean whitespace, slate and emerald accents, modern typography, circular status badge, and prominent QR block.',
        accentColor: 'from-emerald-600 to-indigo-600',
        borderColor: 'border-emerald-500',
        icon: Sparkles,
    },
    {
        id: 'template_4',
        title: 'Premium Corporate',
        subtitle: 'Executive Distinction',
        description: 'Polished metallic gold and deep navy geometric ribbons, executive distinction header, and corporate seal of authenticity.',
        accentColor: 'from-[#0c1e38] to-[#e5b853]',
        borderColor: 'border-[#0c1e38]',
        icon: ShieldCheck,
    },
];

interface Props {
    selectedTemplate: CertificateTemplateId;
    onSelect: (id: CertificateTemplateId) => void;
}

export const CertificateTemplateSelector: React.FC<Props> = ({
    selectedTemplate,
    onSelect,
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.id;
                const Icon = tmpl.icon;
                return (
                    <div
                        key={tmpl.id}
                        onClick={() => onSelect(tmpl.id)}
                        className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                                ? `${tmpl.borderColor} bg-slate-50/80 shadow-md ring-2 ring-violet-500/20`
                                : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50'
                        }`}
                    >
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className={`w-8 h-8 rounded-lg bg-linear-to-br ${tmpl.accentColor} text-white flex items-center justify-center shadow-xs`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                {isSelected ? (
                                    <span className="flex items-center gap-1 text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100">
                                        <Check className="w-3 h-3" /> Active
                                    </span>
                                ) : (
                                    <span className="text-[11px] text-gray-400 font-medium">Select</span>
                                )}
                            </div>

                            <h3 className="text-sm font-bold text-gray-900 leading-tight">
                                {tmpl.title}
                            </h3>
                            <p className="text-[11px] font-semibold text-violet-600 mt-0.5">
                                {tmpl.subtitle}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                                {tmpl.description}
                            </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                            <span className="font-mono text-gray-400 text-[10px] uppercase">
                                {tmpl.id.replace('_', ' ')}
                            </span>
                            <span className="font-medium text-gray-700 hover:text-violet-600">
                                {isSelected ? 'Current Preview' : 'Click to Preview →'}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
