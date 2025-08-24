'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-green-800 mb-4">
            🎄 Aponte Secret Santa 🎅
          </h1>
          <p className="text-base sm:text-lg text-gray-600 px-4">
            Welcome to the Aponte family&apos;s secret santa organizer!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <Card className="border-2 border-red-200 hover:border-red-300 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-red-700 flex items-center gap-2">
                (1) 🎁 Assign Secret Santas
              </CardTitle>
              <CardDescription>
                Set secret santa assignments for the Aponte family
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                If you already know who your secret santa is, click on their name to remove them from the pool.
                <br />
                If you forgot your secret santa, you can generate a new assignment from the available people!
              </p>
              <Link href="/assign_santas">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-base py-3">
                  Start Assignment Process
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:border-green-300 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-green-700 flex items-center gap-2">
                (2) 🔍 Check Your Secret Santa
              </CardTitle>
              <CardDescription>
                Look up who your secret santa is if you forgot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Already completed the assignment process but can&apos;t remember who you got? 
                Look it up here!
              </p>
              <Link href="/check-santa">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-base py-3">
                  Check My Assignment
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 sm:mt-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-900 mb-3">How it works:</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <p>
                  <strong>Step 1:</strong> Everyone clicks &ldquo;Start Assignment Process&rdquo; first
                </p>
                <p>
                  <strong>If you remember your secret santa:</strong> Click on &ldquo;Yes, I know&rdquo;, then click on their name to remove them from the available pool
                </p>
                <p>
                  <strong>If you forgot:</strong> After everyone who remembers has entered their names, click &ldquo;No, I forgot&rdquo;, then click on &ldquo;Generate&rdquo; to get a new assignment from whoever is left!
                </p>
                <p>
                  <strong>Step 2:</strong> Use &ldquo;Check My Assignment&rdquo; anytime to look up who you&apos;re getting a gift for
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
