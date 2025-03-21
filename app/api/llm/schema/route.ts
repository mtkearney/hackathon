import { NextRequest, NextResponse } from 'next/server';
import { generateSchemaFromSummary } from '../../../../lib/llm';

export async function POST(request: NextRequest) {
  try {
    const { summary } = await request.json();
    
    if (!summary) {
      return NextResponse.json(
        { error: 'Project summary is required' },
        { status: 400 }
      );
    }
    
    const schemaResponse = await generateSchemaFromSummary(summary);
    
    return NextResponse.json(schemaResponse);
  } catch (error) {
    console.error('Error generating schema:', error);
    return NextResponse.json(
      { error: 'Failed to generate schema' },
      { status: 500 }
    );
  }
}