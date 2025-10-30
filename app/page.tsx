"use client"

import dynamic from "next/dynamic"

const GreekNewsfeedApp = dynamic(() => import("../src/GreekNewsfeedApp"), { ssr: false })

export default function Page() {
  return <GreekNewsfeedApp />
}
