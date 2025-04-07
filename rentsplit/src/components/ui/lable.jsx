import React from "react";

const Label = React.forwardRef(({ className = "", htmlFor, ...props }, ref) => {
  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={`text-sm font-medium text-gray-700 ${className}`}
      {...props}
    />
  );
});

Label.displayName = "Label";

export { Label };
