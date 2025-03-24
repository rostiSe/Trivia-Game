import React, { ButtonHTMLAttributes } from 'react'
import { Button } from '../ui/button'

export default function LoadingButton({pending, children, onClick, type}: {type?: any | null , pending: boolean, children: React.ReactNode, onClick: () => void}) {
  return (
    <Button disabled={pending} type={type} onClick={onClick}>
      {pending ? (
        <div>
            <svg className="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24"></svg>
            {children}
        </div>
      ) : children}

    </Button>
  )
}
