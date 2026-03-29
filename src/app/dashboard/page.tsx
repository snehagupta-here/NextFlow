import WorkflowCanvas from '@/components/workflow/canvas/WorkFlowCanvas'
import LeftSideBar from '@/components/LeftSideBar'
import RightSideBar from '@/components/RightSideBar'
import React from 'react'

const Page = () => {
  return (
    <div className='flex h-screen w-screen'>
      <div className='w-1/5'>
        <LeftSideBar />
      </div>

      <div className='w-3/5'>
        <WorkflowCanvas />
      </div>

      <div className='w-1/5'>
        <RightSideBar />
      </div>
    </div>
  )
}

export default Page