"use client";
import { cn } from "@/lib/cn";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, id, type, className, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-neutral-800"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          {...props}
          type={isPassword && showPassword ? "text" : type}
          className={cn(
            "block w-full rounded-sm border border-zinc-300 bg-white px-3 py-2 pr-10 text-sm shadow-sm outline-none",
            "focus:ring-none",
            className
          )}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-700"
            tabIndex={-1}
          >
            {showPassword ? (
              <FaEye />
            ) : (
              <FaEyeSlash />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
