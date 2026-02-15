import { cn } from "../../../lib/utils";

interface ProfileSkeletonProps {
    isCollapsed?: boolean;
}

const ProfileSkeleton = ({ isCollapsed }: ProfileSkeletonProps) => (


    <div className={cn(
        "flex items-center gap-4 rounded-2xl p-3",
        "bg-white/60 backdrop-blur-xl border border-white/40",
        isCollapsed && "flex-col gap-2 p-2"
    )}>
        {/* Avatar skeleton */}
        <div className={cn(
            "rounded-2xl bg-gray-200/50 animate-pulse shadow-xl ring-2 ring-white/50",
            isCollapsed ? "w-12 h-12" : "w-16 h-16"
        )} />

        {!isCollapsed && (
            <div className="flex-1 min-w-0 space-y-2">
                {/* Name skeleton */}
                <div className="h-5 bg-gray-200/50 rounded-lg animate-pulse w-32" />
                {/* Email skeleton */}
                <div className="h-3 bg-gray-200/50 rounded-lg animate-pulse w-40" />
                {/* Role badge skeleton */}
                <div className="h-6 bg-gray-200/50 rounded-full animate-pulse w-16" />
            </div>
        )}
    </div>
);

export default ProfileSkeleton;