import { NextRequest, NextResponse } from 'next/server';
import { generateAppStructureFromSchema } from '../../../../lib/llm';

export async function POST(request: NextRequest) {
  try {
    const { summary, schema } = await request.json();
    
    if (!summary) {
      return NextResponse.json(
        { error: 'Project summary is required' },
        { status: 400 }
      );
    }
    
    if (!schema) {
      return NextResponse.json(
        { error: 'Schema is required' },
        { status: 400 }
      );
    }
    
    const appStructureResponse = await generateAppStructureFromSchema(summary, schema);
    
    return NextResponse.json(appStructureResponse);
  } catch (error) {
    console.error('Error generating app structure:', error);
    return NextResponse.json(
      { error: 'Failed to generate app structure' },
      { status: 500 }
    );
  }
}