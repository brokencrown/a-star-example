import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const DynamicCanvas = dynamic(() => import('../components/canvas'), { ssr: false})

  return (
    <main
      className={`flex min-h-screen flex-col items-center p-24 ${inter.className}`}
    >
      <div>
        <h1 className='text-xl text-center text-teal-600'>A* Algorithm Example</h1>
        <div className='my-10 text-lg'>
          Click generate to auto generate a maze OR follow the instructions below to create your own maze
        </div>
        <div className='my-5 text-center'>
          <div>
            <div className='inline-block'>
              Single click creates a start point
            </div>
            <div className='w-5 h-5 inline-block ml-2 rounded-3xl' style={{background: 'green'}} />
          </div>
          <div>
            <div className='inline-block'>
              Double click creates an end point
            </div>
            <div className='inline-block'>
              <img src='/images/checkered.jpg' alt='checkered' className='w-5 h-5 rounded-3xl ml-2' />
            </div>
          </div>
          <div>
            <div className='inline-block'>
              Triple click creates a wall
            </div>
            <div className='inline-block w-5 h-5 ml-2 rounded-3xl' style={{background: 'red'}} />
          </div>
          <div>
            <div>
              Clicking on a wall removes all properties from the square
            </div>
          </div>
        </div>
      </div>
      <div className='max-h-fit mx-auto'>
        <DynamicCanvas />
      </div>
    </main>
  )
}
