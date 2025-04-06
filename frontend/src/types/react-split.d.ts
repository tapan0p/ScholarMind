declare module 'react-split' {
  import { ComponentType, HTMLAttributes } from 'react'
  
  interface SplitProps extends HTMLAttributes<HTMLDivElement> {
    sizes?: number[]
    minSize?: number | number[]
    gutterSize?: number
    className?: string
    onDragEnd?: (sizes: number[]) => void
  }

  const Split: ComponentType<SplitProps>
  export default Split
} 