

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
