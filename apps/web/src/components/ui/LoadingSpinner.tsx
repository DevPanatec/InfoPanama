interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  text?: string
}

const sizeClasses = {
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-4',
  lg: 'h-16 w-16 border-4',
}

export function LoadingSpinner({
  size = 'md',
  fullScreen = false,
  text,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Outer ring */}
        <div
          className={`${sizeClasses[size]} border-blue-200 border-t-blue-600 rounded-full animate-spin`}
        />
        {/* Inner pulse */}
        <div
          className={`absolute inset-0 ${sizeClasses[size]} border-blue-400 rounded-full animate-ping opacity-20`}
        />
      </div>
      {text && (
        <p className="text-sm font-medium text-slate-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {spinner}
      </div>
    )
  }

  return spinner
}
