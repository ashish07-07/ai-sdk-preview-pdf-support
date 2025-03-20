
// import { NextRequest } from 'next/server';
// import prisma from '@/app/db';
// import { createGroq } from '@ai-sdk/groq';
// import { streamText, createDataStreamResponse } from 'ai';

// const groq = createGroq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { filename, format } = body;
//     console.log(filename,format)
//     console.log(`are bhai i am inside this dude`)

//     // Validate input
//     if (!filename || !format) {
//       return new Response(JSON.stringify({ error: 'Missing filename or format' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // Fetch document content
//     const document = await prisma.document.findFirst({
//       where: { filename },
//       select: { content: true },
//     });

//     if (!document?.content) {
//       return new Response(JSON.stringify({ error: 'Document not found' }), {
//         status: 404,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // Create format-specific instructions
//     let instruction: string;
//     switch (format.toLowerCase()) {
//       case 'flashcards':
//         instruction = `Create flashcards with clear questions and answers using this format:
//         Q: [question]
//         A: [answer]
//         Content: ${document.content.substring(0, 3000)}`; // Truncate to avoid token limits
//         break;
      
//       case 'matching':
//         instruction = `Create a matching exercise with 2 columns using this format:
//         Terms: [term1], [term2], [term3]
//         Definitions: [definition1], [definition2], [definition3]
//         Content: ${document.content.substring(0, 3000)}`;
//         break;

//       default:
//         return new Response(JSON.stringify({ error: 'Invalid format' }), {
//           status: 400,
//           headers: { 'Content-Type': 'application/json' },
//         });
//     }

//     const systemMessage:any= {
//       role: 'system',
//       content: `You are a quiz generator. ${instruction} Keep items concise and focused.`,
//     };

//     // Stream the AI response
//     return createDataStreamResponse({
//       execute: (dataStream) => {
//         dataStream.writeData({ status: 'Generating questions...' });

//         const result = streamText({
//           model: groq('llama3-70b-8192'),
//           messages: [systemMessage],
//           temperature: 0.3,
//           onChunk() {
//             dataStream.writeMessageAnnotation({ progress: 'Processing' });
//           },
//           onFinish() {
//             dataStream.writeMessageAnnotation({
//               id: `quiz_${Date.now()}`,
//               format,
//               timestamp: new Date().toISOString(),
//             });
//             dataStream.writeData({ status: 'Generation complete' });
//           },
//         });

//         result.mergeIntoDataStream(dataStream);
//       },
//       onError: (error) => {
//         console.error("Streaming error:", error);
//         return error instanceof Error ? error.message : 'Unknown error';
//       },
//     });

//   } catch (e: any) {
//     console.error('Error:', e);
//     return new Response(JSON.stringify({ error: 'Failed to process request' }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }

// import { NextRequest } from 'next/server';
// import prisma from '@/app/db';
// import { createGroq } from '@ai-sdk/groq';
// import { streamText, CoreMessage } from 'ai';

// const groq = createGroq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { filename, format } = body;

//     // Validate input
//     if (!filename || !format) {
//       return new Response(JSON.stringify({ error: 'Missing filename or format' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // Fetch document content
//     const document = await prisma.document.findFirst({
//       where: { filename },
//       select: { content: true },
//     });

//     if (!document?.content) {
//       return new Response(JSON.stringify({ error: 'Document not found' }), {
//         status: 404,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // Create format-specific instructions
//     let instruction: string;
//     switch (format.toLowerCase()) {
//       case 'flashcards':
//         instruction = `STRICTLY use this format for each flashcard:
//         Q: [Your question here]
//         A: [Your answer here]
        
//         Content: ${document.content.substring(0, 3000)}`;
//         break;
      
//       case 'matching':
//         instruction = `STRICTLY use this format:
//         Terms: [comma-separated terms]
//         Definitions: [comma-separated definitions]
        
//         Content: ${document.content.substring(0, 3000)}`;
//         break;

//       default:
//         return new Response(JSON.stringify({ error: 'Invalid format' }), {
//           status: 400,
//           headers: { 'Content-Type': 'application/json' },
//         });
//     }

//     // Create properly typed messages array
//     const messages: CoreMessage[] = [
//       { 
//         role: 'system',
//         content: `You are a quiz generator. Generate ${format} from the following content:`
//       },
//       {
//         role: 'user',
//         content: instruction
//       }
//     ];

//     // Stream the raw text response
//     const result = await streamText({
//       model: groq('llama3-70b-8192'),
//       messages,
//       temperature: 0.3,
//       maxTokens: 2000
//     });

//     // Convert to proper stream response
//     return result.toDataStreamResponse();

//   } catch (e: any) {
//     console.error('Error:', e);
//     return new Response(JSON.stringify({ error: 'Failed to process request' }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }


// import { NextRequest } from 'next/server';
// import prisma from '@/app/db';
// import { createGroq } from '@ai-sdk/groq';
// import { streamText, CoreMessage } from 'ai';

// const groq = createGroq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { filename, format } = body;

//     // Validate input
//     if (!filename || !format) {
//       return new Response(JSON.stringify({ error: 'Missing filename or format' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // Fetch document content
//     const document = await prisma.document.findFirst({
//       where: { filename },
//       select: { content: true },
//     });

//     if (!document?.content) {
//       return new Response(JSON.stringify({ error: 'Document not found' }), {
//         status: 404,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // Create structured JSON format instruction
//     let instruction: string;
//     switch (format.toLowerCase()) {
//       case 'flashcards':
//         instruction = `Convert the following content into structured JSON flashcards format.
        
//         Expected JSON format:
//         {
//           "flashcards": [
//             { "question": "Question 1", "answer": "Answer 1" },
//             { "question": "Question 2", "answer": "Answer 2" }
//           ]
//         }

//         Content:
//         ${document.content.substring(0, 3000)}`;
//         break;
      
//       case 'matching':
//         instruction = `Convert the following content into structured JSON matching format.
        
//         Expected JSON format:
//         {
//           "matching": {
//             "terms": ["Term 1", "Term 2"],
//             "definitions": ["Definition 1", "Definition 2"]
//           }
//         }

//         Content:
//         ${document.content.substring(0, 3000)}`;
//         break;

//       default:
//         return new Response(JSON.stringify({ error: 'Invalid format' }), {
//           status: 400,
//           headers: { 'Content-Type': 'application/json' },
//         });
//     }

//     // Create properly typed messages array
//     const messages: CoreMessage[] = [
//       { 
//         role: 'system',
//         content: `You are a quiz generator. Generate ${format} from the following content and return valid JSON format.`
//       },
//       {
//         role: 'user',
//         content: instruction
//       }
//     ];

//     // Stream the raw text response
//     const result = await streamText({
//       model: groq('llama3-70b-8192'),
//       messages,
//       temperature: 0.3,
//       maxTokens: 2000
//     });

//     // Read streamed text and parse JSON
//     let responseText = '';
//     for await (const chunk of result.toReadableStream()) {
//       responseText += chunk;
//     }

//     try {
//       const jsonResponse = JSON.parse(responseText);
//       return new Response(JSON.stringify(jsonResponse), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     } catch (err) {
//       console.error('Error parsing AI response:', err);
//       return new Response(JSON.stringify({ error: 'Invalid JSON format from AI' }), {
//         status: 500,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//   } catch (e: any) {
//     console.error('Error:', e);
//     return new Response(JSON.stringify({ error: 'Failed to process request' }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }




// import { NextRequest } from 'next/server';
// import prisma from '@/app/db';
// import { createGroq } from '@ai-sdk/groq';
// import { generateText } from 'ai';

// // ✅ Fix: Define `groq`
// const groq = createGroq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// // Define response types
// interface Flashcard {
//   question: string;
//   answer: string;
// }

// interface Matching {
//   terms: string[];
//   definitions: string[];
// }

// type QuizResponse =
//   | { flashcards: Flashcard[] }
//   | { matching: Matching };

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { filename, format } = body;

//     // Validate input
//     if (!filename || !format) {
//       return new Response(JSON.stringify({ error: 'Missing filename or format' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // Fetch document content
//     const document = await prisma.document.findFirst({
//       where: { filename },
//       select: { content: true },
//     });

//     if (!document?.content) {
//       return new Response(JSON.stringify({ error: 'Document not found' }), {
//         status: 404,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // Create structured prompt
//     let systemPrompt: string;
//     let responseFormat: string;

//     switch (format.toLowerCase()) {
//       case 'flashcards':
//         systemPrompt = `Generate concise flashcards from the content. Each flashcard should have a clear question and answer.`;
//         responseFormat = `{
//           "flashcards": [
//             { "question": "Question 1", "answer": "Answer 1" },
//             { "question": "Question 2", "answer": "Answer 2" }
//           ]
//         }`;
//         break;

//       case 'matching':
//         systemPrompt = `Create a matching exercise with terms and their corresponding definitions.`;
//         responseFormat = `{
//           "matching": {
//             "terms": ["Term 1", "Term 2"],
//             "definitions": ["Definition 1", "Definition 2"]
//           }
//         }`;
//         break;

//       default:
//         return new Response(JSON.stringify({ error: 'Invalid format' }), {
//           status: 400,
//           headers: { 'Content-Type': 'application/json' },
//         });
//     }

//     // ✅ Fix: groq is now defined
//     const { text } = await generateText({
//       model: groq('llama3-70b-8192'),
//       system: `${systemPrompt} Return ONLY valid JSON in this exact format: ${responseFormat}`,
//       prompt: `Content: ${document.content.substring(0, 3000)}`,
//       temperature: 0.2,
//       maxTokens: 2000
//     });

//     try {
//       // Parse and validate response
//       const result: QuizResponse = JSON.parse(text);

//       return new Response(JSON.stringify(result), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     } catch (err) {
//       console.error('Invalid JSON:', text);
//       return new Response(JSON.stringify({
//         error: 'Failed to generate valid format',
//         aiResponse: text
//       }), {
//         status: 500,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//   } catch (e: any) {
//     console.error('Error:', e);
//     return new Response(JSON.stringify({ error: 'Failed to process request' }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }


import { NextRequest } from 'next/server';
import prisma from '@/app/db';
import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';

// Initialize Groq API
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Define response types
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

    // Fetch document content
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

    // Define prompts
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
      // Remove unwanted text before JSON parsing
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
