'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            🎄 Aponte Secret Santa 🎅
          </h1>
          <p className="text-lg text-gray-600">
            Welcome to the Aponte family's secret santa organizer!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-2 border-red-200 hover:border-red-300 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl text-red-700 flex items-center gap-2">
                (1) 🎁 Assign Secret Santas
              </CardTitle>
              <CardDescription>
                Set secret santa assignments for the Aponte family
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                If you already know who your secret santa is, enter their name to remove them from the pool.
                <br />
                If you forgot your secret santa, you can generate a new assignment from the available people!
              </p>
              <Link href="/assign_santas">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Start Assignment Process
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:border-green-300 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl text-green-700 flex items-center gap-2">
                (2)🔍 Check Your Secret Santa
              </CardTitle>
              <CardDescription>
                Look up who your secret santa is if you forgot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Already completed the assignment process but can't remember who you got? 
                Look it up here!
              </p>
              <Link href="/check-santa">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Check My Assignment
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-800">
                <strong>How it works:</strong> 
                <br />
                First, everyone needs to click on "Start Assignment Process", regardless of whether or not you remember your secret santa.
                <br />
                <br />
                Those who remember their secret santa:
                <br />
                Enter that person's name to remove them from the available pool. 
                <br />
                Those who forgot:
                <br />
                *AFTER* everyone who remembers has entered their names, those who forgot can generate new assignments from whoever is left!
                <br />
                <br />
                <br />
                Then, once everyone has completed the assignment process, you can click on "Check My Assignment" to look up who you're getting a gift for if you forget again!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
