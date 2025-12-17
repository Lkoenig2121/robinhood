export default function RobinhoodLogo({ className = 'w-6 h-6', showText = false }: { className?: string; showText?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Robinhood Feather Logo - stylized feather */}
        <path
          d="M12 3C12 3 9 4.5 7.5 7C6 9.5 6 12.5 7.5 15C9 17.5 12 19 12 19C12 19 15 17.5 16.5 15C18 12.5 18 9.5 16.5 7C15 4.5 12 3 12 3Z"
          fill="#00C805"
          className="fill-robinhood-green"
        />
        <path
          d="M12 6L10.5 7.5L12 9L13.5 7.5L12 6Z"
          fill="#000000"
          opacity="0.2"
        />
        <path
          d="M12 9L11 10L12 11L13 10L12 9Z"
          fill="#000000"
          opacity="0.15"
        />
        <path
          d="M12 3L11 4L12 5L13 4L12 3Z"
          fill="#00C805"
          opacity="0.8"
        />
        <path
          d="M12 19L11 18L12 17L13 18L12 19Z"
          fill="#00C805"
          opacity="0.8"
        />
      </svg>
      {showText && (
        <span className="text-xl font-bold text-black">Robinhood</span>
      )}
    </div>
  )
}

