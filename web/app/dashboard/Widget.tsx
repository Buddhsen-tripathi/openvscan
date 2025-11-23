import React from 'react';

interface WidgetProps {
  title: string;
  children: React.ReactNode;
}

export default function Widget({ title, children }: WidgetProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h4 className="text-lg font-semibold text-gray-700 mb-4">{title}</h4>
      <div>{children}</div>
    </div>
  );
}
