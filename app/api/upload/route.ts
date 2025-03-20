// import { google } from "@ai-sdk/google";
// import { streamObject } from "ai";
// import pdf from 'pdf-parse';

// export const maxDuration = 60;

// export async function POST(req: Request) {
//   try {
//     const { files }= await req.json();
    
//     if (!files?.length) {
//       return new Response('No files uploaded', { status: 400 });
//     }

//     const firstFile= files[0];
    
//     // Validate PDF file
//     if (!firstFile.data || typeof firstFile.data !== 'string') {
//       return new Response('Invalid file data', { status: 400 });
//     }

//     // Create buffer from base64 data
//     const pdfBuffer:any= Buffer.from(firstFile.data, 'base64');
    
//     // Parse PDF with error handling
//     const { text: pdfText }= await pdf(pdfBuffer).catch(error=> {
//       console.error('PDF parsing failed:', error);
//       throw new Error('Failed to parse PDF file');
//     });

//     console.log('Extracted PDF text:', pdfText); // Inspect extracted text

//     // Continue with your AI processing...
//     // For now, just return the parsed text
//     return new Response(JSON.stringify({ text: pdfText }), {
//       headers: { 'Content-Type': 'application/json' }
//     });

//   } catch (error) {
//     console.error('Processing failed:', error);
//     return new Response('Internal server error', { status: 500 });
//   }
// }

// import { google } from "@ai-sdk/google";
// import { streamObject } from "ai";
// // import pdf from "pdf-parse";
// import pdf from 'pdf-parse';

// export const maxDuration = 60;

// export async function POST(req: Request) {
//   try {
//     const { files } = await req.json();

//     if (!files?.length) {
//       return new Response("No files uploaded", { status: 400 });
//     }

//     const firstFile = files[0];

//     // Validate PDF file
//     if (!firstFile.data || typeof firstFile.data !== "string") {
//       return new Response("Invalid file data", { status: 400 });
//     }

//     // Create buffer from base64 data
//     const pdfBuffer: Buffer = Buffer.from(firstFile.data, "base64");

//     // Parse PDF with error handling
//     const { text: pdfText } = await pdf(pdfBuffer).catch((error: unknown) => {
//       console.error("PDF parsing failed:", error);
//       throw new Error("Failed to parse PDF file");
//     });

//     console.log("Extracted PDF text:", pdfText); // Inspect extracted text

//     return new Response(JSON.stringify({ text: pdfText }), {
//       headers: { "Content-Type": "application/json" },
//     });

//   } catch (error) {
//     console.error("Processing failed:", error);
//     return new Response("Internal server error", { status: 500 });
//   }
// }
// export const config = {
//     api: {
//       bodyParser: {
//         sizeLimit: "10mb", // Allow up to 10MB files
//       },
//     },
//   };
  
// import { google } from "@ai-sdk/google";
// import { streamObject } from "ai";
// import pdf from 'pdf-parse';

// export const maxDuration = 60;

// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData(); // Get form data
//     const file = formData.get("file") as File;

//     if (!file) {
//       return new Response("No file uploaded", { status: 400 });
//     }

//     const fileBuffer = Buffer.from(await file.arrayBuffer()); // Convert file to buffer

//     // Parse PDF
//     const { text: pdfText } = await pdf(fileBuffer).catch((error) => {
//       console.error("PDF parsing failed:", error);
//       throw new Error("Failed to parse PDF file");
//     });

//     console.log("Extracted PDF text:", pdfText); // Inspect extracted text

//     // Return extracted text
//     return new Response(JSON.stringify({ text: pdfText }), {
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Processing failed:", error);
//     return new Response("Internal server error", { status: 500 });
//   }
// }

// app/api/uploadpdf/route.ts
// import { google } from "@ai-sdk/google";
// import { streamObject } from "ai";
// import pdf from 'pdf-parse';
// import { NextResponse } from 'next/server';

// export const maxDuration = 60;

// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file") as File;

//     if (!file) {
//       return NextResponse.json(
//         { error: "No file uploaded" },
//         { status: 400 }
//       );
//     }

//     const fileBuffer = Buffer.from(await file.arrayBuffer());

//     const { text: pdfText } = await pdf(fileBuffer).catch((error) => {
//       console.error("PDF parsing failed:", error);
//       throw new Error("Failed to parse PDF file");
//     });

//     return NextResponse.json(
//       { text: pdfText },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error("Processing failed:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from 'next/server'; // To handle the request and response
import { promises as fs } from 'fs'; // To save the file temporarily
import { v4 as uuidv4 } from 'uuid'; // To generate a unique filename
import PDFParser from 'pdf2json'; // To parse the pdf

export async function POST(req: NextRequest) {
  const formData: FormData = await req.formData();
  const uploadedFiles = formData.getAll('filepond');
  let fileName = '';
  let parsedText = '';

  if (uploadedFiles && uploadedFiles.length > 0) {
    const uploadedFile = uploadedFiles[1];
    console.log('Uploaded file:', uploadedFile);

    // Check if uploadedFile is of type File
    if (uploadedFile instanceof File) {
      // Generate a unique filename
      fileName = uuidv4();

      // Convert the uploaded file into a temporary file
      const tempFilePath = `/tmp/${fileName}.pdf`;

      // Convert ArrayBuffer to Buffer
      const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

      // Save the buffer as a file
      await fs.writeFile(tempFilePath, fileBuffer);

      // Parse the pdf using pdf2json. See pdf2json docs for more info.

      // The reason I am bypassing type checks is because
      // the default type definitions for pdf2json in the npm install
      // do not allow for any constructor arguments.
      // You can either modify the type definitions or bypass the type checks.
      // I chose to bypass the type checks.
      const pdfParser = new (PDFParser as any)(null, 1);

      // See pdf2json docs for more info on how the below works.
      pdfParser.on('pdfParser_dataError', (errData: any) =>
        console.log(errData.parserError)
      );
      pdfParser.on('pdfParser_dataReady', () => {
        console.log((pdfParser as any).getRawTextContent());
        parsedText = (pdfParser as any).getRawTextContent();
      });

      pdfParser.loadPDF(tempFilePath);
    } else {
      console.log('Uploaded file is not in the expected format.');
    }
  } else {
    console.log('No files found.');
  }

  const response = new NextResponse(parsedText);
  response.headers.set('FileName', fileName);
  return response;
}
