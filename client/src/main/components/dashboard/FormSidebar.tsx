/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Controller, type Control } from 'react-hook-form';
import { Globe, Users, Laptop } from 'lucide-react';

interface FormSidebarProps {
  control: Control<any>;
  errors: any;
}

const FormSidebar: React.FC<FormSidebarProps> = ({ control, errors }) => {
  const modes = [
    { value: 'ONLINE', label: 'Online', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { value: 'OFFLINE', label: 'Offline', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { value: 'BOTH', label: 'Both', icon: Laptop, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  ];

  return (
    <div className="hidden lg:block w-full lg:w-1/4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
        <div className="space-y-6">
          {/* Delivery Mode Section */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Select Mode
            </h3>

            <Controller
              name="delivery_mode"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 gap-3">
                  {modes.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = field.value === mode.value;

                    return (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => field.onChange(mode.value)}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${isActive
                            ? `${mode.border} ${mode.bg} shadow-sm`
                            : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isActive ? 'bg-white shadow-xs' : 'bg-gray-200/50'}`}>
                            <Icon className={`w-4 h-4 ${isActive ? mode.color : 'text-gray-400'}`} />
                          </div>
                          <span className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                            {mode.label}
                          </span>
                        </div>
                        {isActive && (
                          <div className={`w-2 h-2 rounded-full ${mode.color.replace('text', 'bg')}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.delivery_mode && (
              <p className="mt-2 text-xs text-rose-600 font-medium">
                {errors.delivery_mode.message}
              </p>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight leading-relaxed">
              Options selected here will determine how students interact with your course content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormSidebar;
