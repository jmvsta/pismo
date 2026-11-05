import type { ComponentPropsWithoutRef, ElementType } from 'react'
import { useFitText } from '../../hooks/useFitText.ts'

type FitTextProps<T extends ElementType> = {
  as: T
  fitKey: unknown
} & Omit<ComponentPropsWithoutRef<T>, 'as'>

function FitText<T extends ElementType>({ as, fitKey, children, ...rest }: FitTextProps<T>) {
  const { containerRef, contentRef } = useFitText(fitKey)
  const Tag = as as ElementType

  return (
    <Tag ref={containerRef} {...rest}>
      <span ref={contentRef} className="about-fit-content">
        {children}
      </span>
    </Tag>
  )
}

export default FitText
