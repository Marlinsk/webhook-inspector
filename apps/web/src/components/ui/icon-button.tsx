import React from "react"
import { tv, type VariantProps } from "tailwind-variants"

const iconButton = tv({
  base: 'flex items-center justify-center rounded-lg hover:bg-zinc-700 transition-color duration-150',
  variants: {
    size: {
      sm: 'size-6',
      md: 'size-8'
    }
  },
  defaultVariants: {
    size: 'md'
  }
})

interface IconButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof iconButton> {
  icon: React.ReactNode;
}

export function IconButton ({ icon, size, className, ...props}: IconButtonProps) {
  return (
    <button 
      type="button"
      className={iconButton({ size, className })}
      {...props}
    >
      {icon}
    </button>
  )
}