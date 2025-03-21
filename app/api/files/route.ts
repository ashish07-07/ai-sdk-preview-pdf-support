

// import { NextRequest, NextResponse } from 'next/server';
// import { promises as fs } from 'fs';
// import { v4 as uuidv4 } from 'uuid';
// import PDFParser from 'pdf2json';

// import path from 'path';


// import prisma from '@/app/db';


// export async function POST(req: NextRequest) {
//   let tempFilePath = '';
  
//   try {
//     const formData: FormData = await req.formData();
//     const uploadedFiles = formData.getAll('filepond');

//     if (!uploadedFiles || uploadedFiles.length === 0) {
//       return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
//     }

//     const uploadedFile = uploadedFiles[0];
    
//     if (!(uploadedFile instanceof File)) {
//       return NextResponse.json({ error: 'Invalid file format' }, { status: 400 });
//     }


//     const fileName = uuidv4();
//     const tempDir = path.join(process.cwd(), 'tmp');
//     tempFilePath = path.join(tempDir, `${fileName}.pdf`);
//     await fs.mkdir(tempDir, { recursive: true });
//     const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
//     await fs.writeFile(tempFilePath, fileBuffer);


//     const parsedText = await parsePDF(tempFilePath);

   
//     const document = await prisma.document.create({
//       data: {
//         content: parsedText,
//         filename: uploadedFile.name,
//         size: uploadedFile.size,
//       }
//     });

    

//     return NextResponse.json({ 
//       documentId: document.id,
//       filename: document.filename,
//       size: document.size,
//       createdAt: document.createdAt
//     });

//   } catch (error) {
//     console.error('Error processing file:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   } finally {
   
//     if (tempFilePath) {
//       try {
//         await fs.unlink(tempFilePath);
//       } catch (cleanupError) {
//         console.error('Error cleaning up temp file:', cleanupError);
//       }
//     }
//   }
// }



// async function parsePDF(filePath: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const pdfParser = new (PDFParser as any)(null, 1);
    
//     pdfParser.on('pdfParser_dataError', (errData: any) => {
//       console.error('PDF Parsing Error:', errData.parserError);
//       reject('Failed to parse PDF');
//     });

//     pdfParser.on('pdfParser_dataReady', () => {
//       const text = (pdfParser as any).getRawTextContent();
//       resolve(text);
//     });

//     pdfParser.loadPDF(filePath);
//   });
// }


// app/api/files/route.ts

////////////////////////////////////////////////////////////////
// app/api/files/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { v4 as uuidv4 } from 'uuid';
// import PDFParser from 'pdf2json';
// import path from 'path';
// import { promises as fs } from 'fs';
// import prisma from '@/app/db';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export async function POST(req: NextRequest) {
//   const headers = new Headers();
//   headers.set('Access-Control-Allow-Origin', '*');

//   try {
//     const formData = await req.formData();
//     const uploadedFile = formData.get('file');

//     if (!uploadedFile) {
//       return new NextResponse(
//         JSON.stringify({ success: false, error: 'No file uploaded' }),
//         { status: 400, headers }
//       );
//     }

//     if (!(uploadedFile instanceof File)) {
//       return new NextResponse(
//         JSON.stringify({ success: false, error: 'Invalid file format' }),
//         { status: 400, headers }
//       );
//     }

//     // Validate file type
//     if (!uploadedFile.type.includes('pdf')) {
//       return new NextResponse(
//         JSON.stringify({ success: false, error: 'Only PDF files are allowed' }),
//         { status: 400, headers }
//       );
//     }

//     // Process PDF directly from buffer
//     const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
//     const parsedText = await parsePDFFromBuffer(fileBuffer);

//     // Database operations
//     const document = await prisma.document.create({
//       data: {
//         content: parsedText,
//         filename: uploadedFile.name,
//         size: uploadedFile.size,
//       },
//     });

//     return new NextResponse(
//       JSON.stringify({
//         success: true,
//         documentId: document.id,
//         filename: document.filename,
//         contentLength: parsedText.length,
//       }),
//       { status: 200, headers }
//     );

//   } catch (error: any) {
//     console.error('API Error:', error);
//     return new NextResponse(
//       JSON.stringify({
//         success: false,
//         error: error.message || 'PDF processing failed',
//         ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
//       }),
//       { status: 500, headers }
//     );
//   }
// }

// async function parsePDFFromBuffer(buffer: Buffer): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const pdfParser = new (PDFParser as any)(null, 1);

//     pdfParser.on('pdfParser_dataError', (errData: any) => {
//       reject(new Error(`PDF parse error: ${errData.parserError}`));
//     });

//     pdfParser.on('pdfParser_dataReady', () => {
//       try {
//         const text = (pdfParser as any).getRawTextContent()?.trim() || '';
//         if (!text) reject(new Error('No text content found in PDF'));
//         resolve(text);
//       } catch (error) {
//         reject(new Error('Failed to extract text from PDF'));
//       }
//     });

//     pdfParser.parseBuffer(buffer);
//   });
// }
/////////////////////////////////////////////////////////////////////////


// app/api/files/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import PDFParser from 'pdf2json';
// import prisma from '@/app/db';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export async function POST(req: NextRequest) {
//   try {
//     // 1. Get file from form data
//     const formData = await req.formData();
//     const file = formData.get('file');

//     // 2. Validate file
//     if (!(file instanceof File)) {
//       return NextResponse.json(
//         { success: false, error: 'Invalid file format' },
//         { status: 400 }
//       );
//     }

//     // 3. Process PDF
//     const buffer = Buffer.from(await file.arrayBuffer());
//     const text = await parsePDF(buffer);

//     // 4. Store in database
//     const document = await prisma.document.create({
//       data: {
//         content: text,
//         filename: file.name,
//         size: file.size,
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       id: document.id,
//       textLength: text.length,
//     });

//   } catch (error: any) {
//     console.error('API Error:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: error.message,
//         stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//       },
//       { status: 500 }
//     );
//   }
// }

// // Memory-based PDF parsing
// async function parsePDF(buffer: Buffer): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const parser:any= new (PDFParser as any)(null, 1);

//     parser.on('pdfParser_dataError', (err: any) => 
//       reject(new Error(`PDF Error: ${err.parserError}`)),
    
//     parser.on('pdfParser_dataReady', () => {
//       try {
//         const text = parser.getRawTextContent()?.trim();
//         resolve(text || '');
//       } catch (error) {
//         reject(new Error('Text extraction failed'));
//       }
//     }));

//     parser.parseBuffer(buffer);
//   });
// }





// import { NextRequest, NextResponse } from 'next/server';
// import { promises as fs } from 'fs';
// import { v4 as uuidv4 } from 'uuid';
// // import PDFParser from 'pdf2json';
//  import PDFParser from 'pdf2json';

// import path from 'path';


// import prisma from '@/app/db';


// export async function POST(req: NextRequest) {
//   let tempFilePath = '';
  
//   try {
//     const formData: FormData = await req.formData();
//     const uploadedFiles = formData.getAll('filepond');

//     if (!uploadedFiles || uploadedFiles.length === 0) {
//       return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
//     }

//     const uploadedFile = uploadedFiles[0];
    
//     if (!(uploadedFile instanceof File)) {
//       return NextResponse.json({ error: 'Invalid file format' }, { status: 400 });
//     }


//     const fileName = uuidv4();
//     const tempDir = path.join(process.cwd(), 'tmp');
//     tempFilePath = path.join(tempDir, `${fileName}.pdf`);
//     await fs.mkdir(tempDir, { recursive: true });
//     const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
//     await fs.writeFile(tempFilePath, fileBuffer);


//     const parsedText = await parsePDF(tempFilePath);

   
//     const document = await prisma.document.create({
//       data: {
//         content: parsedText,
//         filename: uploadedFile.name,
//         size: uploadedFile.size,
//       }
//     });

    

//     return NextResponse.json({ 
//       documentId: document.id,
//       filename: document.filename,
//       size: document.size,
//       createdAt: document.createdAt
//     });

//   } catch (error) {
//     console.error('Error processing file:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   } finally {
   
//     if (tempFilePath) {
//       try {
//         await fs.unlink(tempFilePath);
//       } catch (cleanupError) {
//         console.error('Error cleaning up temp file:', cleanupError);
//       }
//     }
//   }
// }
// async function parsePDF(filePath: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const pdfParser = new (PDFParser as any)(null, 1);
      
//     pdfParser.on('pdfParser_dataError', (errData: any) => {
//     console.error('PDF Parsing Error:', errData.parserError);
//        reject('Failed to parse PDF');
//      });
  
//    pdfParser.on('pdfParser_dataReady', () => {
//      const text = (pdfParser as any).getRawTextContent();
//       resolve(text);
//     });
  
//     pdfParser.loadPDF(filePath);
//   });
//  }





import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from "uuid";
import { promises as fs } from 'fs';
import path from 'path';
import PDFParser from 'pdf2json';
import prisma from '@/app/db';

export async function POST(req: NextRequest) {
  let tempFilePath = '';
  
  try {
    const formData = await req.formData();
    const uploadedFiles = formData.getAll('filepond');

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const uploadedFile = uploadedFiles[0];
    
    if (!(uploadedFile instanceof File)) {
      return NextResponse.json({ error: 'Invalid file format' }, { status: 400 });
    }

    const fileName = uuidv4();
    const tempDir = '/tmp';
    tempFilePath = path.join(tempDir, `${fileName}.pdf`);
    
    // Convert File to Buffer and write to temp
    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
    await fs.writeFile(tempFilePath, fileBuffer);

    // Parse PDF
    const parsedText = await parsePDF(tempFilePath);

    // Save to database
    const document = await prisma.document.create({
      data: {
        content: parsedText,
        filename: uploadedFile.name,
        size: uploadedFile.size,
      }
    });

    return NextResponse.json({ 
      documentId: document.id,
      filename: document.filename,
      size: document.size,
      createdAt: document.createdAt
    });

  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  } finally {
    // Cleanup temp file
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }
  }
}

// PDF parsing function
async function parsePDF(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);
    
    pdfParser.on('pdfParser_dataError', (errData: any) => {
      console.error('PDF Parsing Error:', errData.parserError);
      reject('Failed to parse PDF');
    });

    pdfParser.on('pdfParser_dataReady', () => {
      const text = (pdfParser as any).getRawTextContent();
      resolve(text);
    });

    pdfParser.loadPDF(filePath);
  });
}