// ── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ percentage }: { percentage: number }) {
    const pct = Math.round(Number(percentage || 0));
    const barColor =
        pct === 100 ? 'bg-emerald-500' :
            pct > 0 ? 'bg-blue-500' :
                'bg-gray-300';

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Progress</span>
                <span className={`text-xs font-bold ${pct === 100 ? 'text-emerald-600' : pct > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                    {pct}%
                </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                    className={`${barColor} h-full rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}


export default ProgressBar;