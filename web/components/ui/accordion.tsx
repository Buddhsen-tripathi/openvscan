'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const AccordionContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

interface AccordionProps {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const Accordion = ({
  children,
  className,
  value: controlledValue,
  defaultValue,
  onValueChange,
  ...props
}: AccordionProps) => {
  const [value, setValue] = React.useState(controlledValue || defaultValue || '');

  const handleValueChange = (newValue: string) => {
    const updatedValue = newValue === value ? '' : newValue;
    setValue(updatedValue);
    onValueChange?.(updatedValue);
  };

  return (
    <AccordionContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn('space-y-2', className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('border-b', className)}
    data-value={value}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { value, onValueChange } = React.useContext(AccordionContext);
  // @ts-ignore
  const itemValue = (ref?.current?.closest('[data-value]') as HTMLElement)?.dataset?.value || (props as any).parentValue;
  
  // Helper to find the parent item value since we can't easily access ref.current here during render
  // In a real Radix implementation this is handled by context, but for this simple version:
  // We'll rely on the user passing the value to the Item, and we need to pass it down or use context.
  // Let's simplify: We need a context for the Item too.
  
  return (
    <AccordionItemContext.Consumer>
      {(itemContext) => {
        const isOpen = value === itemContext.value;
        return (
          <div className="flex">
            <button
              ref={ref}
              onClick={() => onValueChange?.(itemContext.value)}
              className={cn(
                'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
                className
              )}
              data-state={isOpen ? 'open' : 'closed'}
              {...props}
            >
              {children}
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </button>
          </div>
        );
      }}
    </AccordionItemContext.Consumer>
  );
});
AccordionTrigger.displayName = 'AccordionTrigger';

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { value } = React.useContext(AccordionContext);
  
  return (
    <AccordionItemContext.Consumer>
      {(itemContext) => {
        const isOpen = value === itemContext.value;
        return (
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div
                  ref={ref}
                  className={cn('pb-4 pt-0', className)}
                  {...props}
                >
                  {children}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        );
      }}
    </AccordionItemContext.Consumer>
  );
});
AccordionContent.displayName = 'AccordionContent';

// Helper context for Item
const AccordionItemContext = React.createContext<{ value: string }>({ value: '' });

const AccordionItemWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, children, ...props }, ref) => (
  <AccordionItemContext.Provider value={{ value }}>
    <div
      ref={ref}
      className={cn('border-b', className)}
      {...props}
    >
      {children}
    </div>
  </AccordionItemContext.Provider>
));
AccordionItemWrapper.displayName = 'AccordionItem';

export { Accordion, AccordionItemWrapper as AccordionItem, AccordionTrigger, AccordionContent };
