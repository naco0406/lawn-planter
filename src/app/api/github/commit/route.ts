// src/app/api/github/commit/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { commitFile } from '@/lib/github'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { content, filename } = await req.json()
    
    if (!content || !filename) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    try {
      await commitFile(session.accessToken, content, filename)
    } catch (commitError) {
      console.error('Commit error details:', commitError)
      // @ts-expect-error
      return new NextResponse(commitError.message, { status: 500 })
    }
    
    return new NextResponse('Success', { status: 200 })
  } catch (error) {
    console.error('Commit error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}