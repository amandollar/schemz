const Logo = ({ size = 40, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Circle */}
      <circle cx="20" cy="20" r="20" fill="currentColor"/>
      
      {/* Document/Scheme Icon */}
      <path d="M12 10C12 9.44772 12.4477 9 13 9H23L28 14V30C28 30.5523 27.5523 31 27 31H13C12.4477 31 12 30.5523 12 30V10Z" fill="white"/>
      
      {/* Folded Corner */}
      <path d="M23 9V13C23 13.5523 23.4477 14 24 14H28L23 9Z" fill="#E5E7EB"/>
      
      {/* Lines representing text/content */}
      <rect x="15" y="17" width="10" height="1.5" rx="0.75" fill="currentColor"/>
      <rect x="15" y="21" width="8" height="1.5" rx="0.75" fill="currentColor"/>
      <rect x="15" y="25" width="9" height="1.5" rx="0.75" fill="currentColor"/>
      
      {/* Checkmark overlay */}
      <circle cx="24" cy="26" r="4" fill="#10B981"/>
      <path d="M22.5 26L23.5 27L25.5 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export default Logo;
