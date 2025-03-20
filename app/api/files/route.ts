
// import { NextRequest, NextResponse } from 'next/server';
// import { promises as fs } from 'fs';
// import { v4 as uuidv4 } from 'uuid';
// import PDFParser from 'pdf2json';
// import path from 'path';

// export async function POST(req: NextRequest) {
//   try {
//     const formData: FormData = await req.formData();
//     const uploadedFiles = formData.getAll('filepond');

//     if (!uploadedFiles || uploadedFiles.length === 0) {
//       console.log('No files found.');
//       return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
//     }

//     const uploadedFile = uploadedFiles[0];
//     console.log('Uploaded file:', uploadedFile);

//     if (!(uploadedFile instanceof File)) {
//       console.log('Uploaded file is not in the expected format.');
//       return NextResponse.json({ error: 'Invalid file format' }, { status: 400 });
//     }

    
//     const fileName = uuidv4();
//     const tempDir = path.join(process.cwd(), 'tmp'); 
//     const tempFilePath = path.join(tempDir, `${fileName}.pdf`);

    
//     await fs.mkdir(tempDir, { recursive: true });

    
//     const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
//     await fs.writeFile(tempFilePath, fileBuffer);

//     const parsedText = await parsePDF(tempFilePath);

//     return NextResponse.json({ fileName, parsedText });

    

//   } catch (error) {
//     console.error('Error processing file:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import PDFParser from 'pdf2json';

import path from 'path';
// import { PrismaClient } from '@prisma/client';

import prisma from '@/app/db';
// const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  let tempFilePath = '';
  
  try {
    const formData: FormData = await req.formData();
    const uploadedFiles = formData.getAll('filepond');

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const uploadedFile = uploadedFiles[0];
    
    if (!(uploadedFile instanceof File)) {
      return NextResponse.json({ error: 'Invalid file format' }, { status: 400 });
    }

    // File handling
    const fileName = uuidv4();
    const tempDir = path.join(process.cwd(), 'tmp');
    tempFilePath = path.join(tempDir, `${fileName}.pdf`);
    await fs.mkdir(tempDir, { recursive: true });
    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
    await fs.writeFile(tempFilePath, fileBuffer);

    // PDF parsing
    const parsedText = await parsePDF(tempFilePath);

    // Database storage
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    // Cleanup temporary file
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }
  }
}

// parsePDF function remains the same

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

