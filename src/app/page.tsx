import { Inter } from 'next/font/google'
import Profile, { ProfileProps } from '@/app/components/Profile'

const inter = Inter({ subsets: ['latin'] })

function getProfile(): ProfileProps {
  return {
    title: 'tim',
    description: 'i turn ideas into reality',
    location: 'tokyo, japan',
    imageUrl: 'https://avatars.githubusercontent.com/u/6851767?v=4',
    linkUrl: [
      {
        imageUrl: '/gitlab.svg',
        linkUrl: 'https://gitlab.com/users/hosweetim/projects',
      },
      {
        imageUrl: '/github.svg',
        linkUrl: 'https://github.com/sweetim',
      },
      {
        imageUrl: '/docker.svg',
        linkUrl: 'https://hub.docker.com/r/timx/',
      },
      {
        imageUrl: '/linkedin.svg',
        linkUrl: 'https://www.linkedin.com/in/swee-tim-ho-8a378048',
      },
      {
        imageUrl: '/stackoverflow.svg',
        linkUrl: 'http://stackoverflow.com/users/2297825/tim',
        isRounded: false
      },
    ],
  }
}

export default function Home() {
  return (
    <div className='flex justify-center items-center h-screen bg-neutral-200'>
      <Profile {...getProfile()} />
    </div>
  )
}
