import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="bg-white">
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20">
        <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Dragon's Breath
                </h1>
                <p className="mt-6 text-xl leading-8 text-gray-600">
                  Comprehensive project planning and tracking for software development teams.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link href="/signup">
                    <Button variant="primary" size="lg">
                      Get started
                    </Button>
                  </Link>
                  <Link href="/login" className="text-sm font-semibold leading-6 text-gray-900">
                    Log in <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-20 sm:mt-24 md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 lg:w-screen">
            <div className="shadow-xl md:rounded-3xl">
              <div className="bg-indigo-500 [clip-path:inset(0)] md:[clip-path:inset(0_round_theme(borderRadius.3xl))]">
                <div className="p-10 sm:p-16 md:p-20 bg-gradient-to-r from-indigo-500 to-purple-600 h-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Project Management Simplified</h2>
                    <p className="opacity-80">From concept to completion: Define requirements, select technology stacks, design database schemas, and create layouts all in one place.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 