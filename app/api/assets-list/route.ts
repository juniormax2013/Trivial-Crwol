import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get('folder');

  if (!folder) {
    return NextResponse.json({ error: 'Falta el parámetro de carpeta' }, { status: 400 });
  }

  // Sanitizar ruta para prevenir directory traversal
  const cleanFolder = folder.replace(/^\/+/, '').replace(/\.\.\//g, '');
  const dirPath = path.join(process.cwd(), 'public', cleanFolder);

  try {
    if (!fs.existsSync(dirPath)) {
      return NextResponse.json({ error: 'La carpeta especificada no existe dentro del directorio public/' }, { status: 404 });
    }

    const files = fs.readdirSync(dirPath);
    const glbFiles = files.filter(file => file.endsWith('.glb'));

    return NextResponse.json({ files: glbFiles });
  } catch (error: any) {
    console.error('Error al escanear directorio:', error);
    return NextResponse.json({ error: 'Error al escanear el directorio en el servidor.' }, { status: 500 });
  }
}
