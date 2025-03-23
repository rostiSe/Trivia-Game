"use client"

import LoadingButton from '@/components/design/loading-button';
import React, { useState } from 'react'

export default function PlayGround() {
    const [pending, setPending] = useState(false)
    const testButtonClick = () => {
      setPending(true)
      setTimeout(() => {
        console.log("Button Clicked");
        setPending(false)
      }, 1000)
    }
  return (
    <div>
                <LoadingButton pending={pending} onClick={testButtonClick}>
          Testing Loading
        </LoadingButton>

    </div>
  )
}
