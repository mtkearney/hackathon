import { NextRequest, NextResponse } from 'next/server';
import { generateTechStackRecommendations } from '../../../../lib/llm';

export async function POST(request: NextRequest) {
  try {
    const { summary } = await request.json();
    
    if (!summary) {
      return NextResponse.json(
        { error: 'Project summary is required' },
        { status: 400 }
      );
    }
    
    const techStackResponse = await generateTechStackRecommendations(summary);
    
    return NextResponse.json(techStackResponse);
  } catch (error) {
    console.error('Error generating tech stack recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate tech stack recommendations' },
      { status: 500 }
    );
  }
}