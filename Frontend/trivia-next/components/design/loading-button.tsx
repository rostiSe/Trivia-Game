import React from 'react'
import { Button } from '../ui/button'

export default function LoadingButton({pending, children, onClick}: {pending: boolean, children: React.ReactNode, onClick: () => void}) {
  return (
    <Button onClick={onClick} disabled={pending} className='relative'>
        {pending ? (
            <div className=" flex items-center justify-center">
                <div className="w-4 h-4 border-t-2 border-b-2 border-red-900 rounded-full animate-spin pr-2"></div>
                {children}

            </div>
        ) : (
            
            children
        )}
    </Button>
  )
}
