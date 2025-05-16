


import { NextRequest } from 'next/server';
import prisma from '@/app/db';
import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';


const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});


interface Flashcard {
  question: string;
  answer: string;
}

interface Matching {
  terms: string[];
  definitions: string[];
}

type QuizResponse = 
  | { flashcards: Flashcard[] }
  | { matching: Matching };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filename, format } = body;

    // Validate input
    if (!filename || !format) {
      return new Response(JSON.stringify({ error: 'Missing filename or format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    
    const document = await prisma.document.findFirst({
      where: { filename },
      select: { content: true },
    });

    if (!document?.content) {
      return new Response(JSON.stringify({ error: 'Document not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

   
    let systemPrompt: string;
    let responseFormat: string;

    switch (format.toLowerCase()) {
      case 'flashcards':
        systemPrompt = `Generate concise flashcards from the given content. Each flashcard should have a clear question and answer.`;
        responseFormat = `{
          "flashcards": [
            { "question": "Question 1", "answer": "Answer 1" },
            { "question": "Question 2", "answer": "Answer 2" }
          ]
        }`;
        break;

      case 'matching':
        systemPrompt = `Create a matching exercise with terms and their corresponding definitions.`;
        responseFormat = `{
          "matching": {
            "terms": ["Term 1", "Term 2"],
            "definitions": ["Definition 1", "Definition 2"]
          }
        }`;
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    // Generate structured response
    const { text } = await generateText({
      model: groq('llama3-70b-8192'),
      system: `${systemPrompt} Return ONLY valid JSON in this exact format: ${responseFormat}. Do NOT include explanations, formatting, or extra text.`,
      prompt: `Content: ${document.content.substring(0, 3000)}`,
      temperature: 0.2,
      maxTokens: 2000
    });

    try {
    
      const cleanedText = text.trim().replace(/^.*?{/, '{'); // Ensures JSON starts correctly
      const result: QuizResponse = JSON.parse(cleanedText);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Invalid JSON:', text);
      return new Response(JSON.stringify({
        error: 'Failed to generate valid format',
        aiResponse: text
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (e: any) {
    console.error('Error:', e);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
