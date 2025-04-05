import * as React from "react";

export function Alert({ children, className }) {
  return <div className={`rounded-md border p-4 ${className}`}>{children}</div>;
}

export function AlertTitle({ children }) {
  return <h5 className="font-semibold mb-1">{children}</h5>;
}

export function AlertDescription({ children }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
