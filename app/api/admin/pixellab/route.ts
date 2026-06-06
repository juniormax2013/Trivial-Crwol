import { NextRequest, NextResponse } from 'next/server';
import { PixelLabClient, Base64Image } from '@pixellab-code/pixellab';

// MOCK IMAGES FOR TESTING FALLBACKS (PNG Pixel Art)
const MOCK_IMAGES = {
  base: 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAAC5tTv3AAAAMFBMVEVHcEwAAAD/zAC7AACZgACqAAB3AACqAAC7gACZzAC7zAD/zAD//wD///8AgIAAAAD7g+JBAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5gYNBzM5N8X32QAAAXNJREFUeNrtlDGOwyAMRUEKBAIEAoEAicL9j9pIkS1bthSpUqb5b0T/h2yebcfs7+c4jsc4DuM4DuM4/o9BCCEG/L3v+74vpfZCCDG4B0op1bZt2+v1eh1KqbXv+z7vBfB93+t1KKXWtm3bSiml9r4vtAsopdSp1Wp1SimlTq31eS+2C2itT6vV6nQutgtorc97AdRqnT5fP5lsl70CaK1Pv8v/Avh6vb7IZLe9Ami1TnvlfYHv9/uLTG5lXwP2e+t9fX/gPMfxfZ/2qgBa73v9H4BSSl22KaXy+wKUUnmttdlu9uYCUkrdtsn6svwvwHa72Zf/Alhfsn7Jv0CttTmtzdbm+wW0Nrcya8v+W8C2zV65v2T3F6i1Nu+V9yV7vwBr6/tS0zQvexeQpqkZ0DSl/S/AzGYD6/sCvBfA+wKs7wtora2/n99/D5jN3uwP2P0A5jkOPwB0e0gZ57Yw2QAAAABJRU5ErkJggg==',
  rotation: 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAAC5tTv3AAAAMFBMVEVHcEwAAAD/zAC7AACZgACqAAB3AACqAAC7gACZzAC7zAD/zAD//wD///8AgIAAAAD7g+JBAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5gYNBzM5N8X32QAAAXNJREFUeNrtlDGOwyAMRUEKBAIEAoEAicL9j9pIkS1bthSpUqb5b0T/h2yebcfs7+c4jsc4DuM4DuM4/o9BCCEG/L3v+74vpfZCCDG4B0op1bZt2+v1eh1KqbXv+z7vBfB93+t1KKXWtm3bSiml9r4vtAsopdSp1Wp1SimlTq31eS+2C2itT6vV6nQutgtorc97AdRqnT5fP5lsl70CaK1Pv8v/Avh6vb7IZLe9Ami1TnvlfYHv9/uLTG5lXwP2e+t9fX/gPMfxfZ/2qgBa73v9H4BSSl22KaXy+wKUUnmttdlu9uYCUkrdtsn6svwvwHa72Zf/Alhfsn7Jv0CttTmtzdbm+wW0Nrcya8v+W8C2zV65v2T3F6i1Nu+V9yV7vwBr6/tS0zQvexeQpqkZ0DSl/S/AzGYD6/sCvBfA+wKs7wtora2/n99/D5jN3uwP2P0A5jkOPwB0e0gZ57Yw2QAAAABJRU5ErkJggg==',
  animation: 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAAC5tTv3AAAAMFBMVEVHcEwAAAD/zAC7AACZgACqAAB3AACqAAC7gACZzAC7zAD/zAD//wD///8AgIAAAAD7g+JBAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5gYNBzM5N8X32QAAAXNJREFUeNrtlDGOwyAMRUEKBAIEAoEAicL9j9pIkS1bthSpUqb5b0T/h2yebcfs7+c4jsc4DuM4DuM4/o9BCCEG/L3v+74vpfZCCDG4B0op1bZt2+v1eh1KqbXv+z7vBfB93+t1KKXWtm3bSiml9r4vtAsopdSp1Wp1SimlTq31eS+2C2itT6vV6nQutgtorc97AdRqnT5fP5lsl70CaK1Pv8v/Avh6vb7IZLe9Ami1TnvlfYHv9/uLTG5lXwP2e+t9fX/gPMfxfZ/2qgBa73v9H4BSSl22KaXy+wKUUnmttdlu9uYCUkrdtsn6svwvwHa72Zf/Alhfsn7Jv0CttTmtzdbm+wW0Nrcya8v+W8C2zV65v2T3F6i1Nu+V9yV7vwBr6/tS0zQvexeQpqkZ0DSl/S/AzGYD6/sCvBfA+wKs7wtora2/n99/D5jN3uwP2P0A5jkOPwB0e0gZ57Yw2QAAAABJRU5ErkJggg=='
};

function getMockResponse(type: 'base' | 'rotation' | 'animation') {
  return {
    image: {
      type: 'base64',
      base64: MOCK_IMAGES[type],
      format: 'png'
    },
    images: type === 'animation' ? [
      {
        type: 'base64',
        base64: MOCK_IMAGES.animation,
        format: 'png'
      }
    ] : undefined,
    usage: { credits: 0 },
    mocked: true
  };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify API Key exists
    const secret = process.env.PIXELLAB_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'CONFIG_ERROR', message: 'PIXELLAB_SECRET no está configurado en el servidor.' },
        { status: 500 }
      );
    }

    // 2. Parse request body
    const body = await req.json();
    const { action, params } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Falta la acción a realizar.' },
        { status: 400 }
      );
    }

    // Initialize the official SDK client
    const client = new PixelLabClient(secret);

    // 3. Handle actions
    switch (action) {
      case 'getBalance': {
        const balance = await client.getBalance();
        return NextResponse.json({ balance });
      }

      case 'generateCharacter': {
        const { description, width, height, negativeDescription, view, direction, noBackground } = params;

        // Validation
        if (!description || description.trim().length === 0) {
          return NextResponse.json(
            { error: 'VALIDATION_ERROR', message: 'El prompt/description es requerido.' },
            { status: 400 }
          );
        }

        // Validate size
        const validSizes = [48, 64, 128];
        if (!validSizes.includes(width) || !validSizes.includes(height)) {
          return NextResponse.json(
            { error: 'VALIDATION_ERROR', message: 'El tamaño debe ser 48x48, 64x64, o 128x128.' },
            { status: 400 }
          );
        }

        try {
          const result = await client.generateImagePixflux({
            description,
            imageSize: { width, height },
            negativeDescription: negativeDescription || '',
            view: view || 'side',
            direction: direction || 'south',
            noBackground: noBackground ?? true,
            outline: 'single color black outline',
            shading: 'medium shading',
            detail: 'medium detail'
          });

          return NextResponse.json({
            image: result.image.toJSON(),
            usage: result.usage,
            mocked: false
          });
        } catch (sdkError: any) {
          console.error("PixelLab SDK Character error (Attempting mock fallback):", sdkError);
          const is402 = sdkError?.status === 402 || sdkError?.message?.includes('balance') || sdkError?.message?.includes('credits') || sdkError?.message?.includes('insuficiente');
          if (is402) {
            return NextResponse.json(getMockResponse('base'));
          }
          return handleSdkErrors(sdkError);
        }
      }

      case 'generateRotation': {
        const { fromImageBase64, fromFormat, width, height, fromView, toView, fromDirection, toDirection } = params;

        if (!fromImageBase64) {
          return NextResponse.json(
            { error: 'VALIDATION_ERROR', message: 'La imagen de origen es requerida para la rotación.' },
            { status: 400 }
          );
        }

        try {
          // Prepare Base64Image instance
          const fromImage = Base64Image.fromData({
            type: 'base64',
            base64: fromImageBase64,
            format: fromFormat || 'png'
          });

          const result = await client.rotate({
            imageSize: { width: width || 64, height: height || 64 },
            imageGuidanceScale: 1.5,
            fromView: fromView || 'side',
            toView: toView || 'side',
            fromDirection: fromDirection || 'south',
            toDirection: toDirection || 'south-east',
            isometric: false,
            obliqueProjection: false,
            fromImage,
            initImageStrength: 300,
            seed: Math.floor(Math.random() * 100000)
          });

          return NextResponse.json({
            image: result.image.toJSON(),
            usage: result.usage,
            mocked: false
          });
        } catch (sdkError: any) {
          console.error("PixelLab SDK Rotation error (Attempting mock fallback):", sdkError);
          const is402 = sdkError?.status === 402 || sdkError?.message?.includes('balance') || sdkError?.message?.includes('credits') || sdkError?.message?.includes('insuficiente');
          if (is402) {
            return NextResponse.json(getMockResponse('rotation'));
          }
          return handleSdkErrors(sdkError);
        }
      }

      case 'generateAnimation': {
        const { referenceImageBase64, referenceFormat, description, actionName, width, height, view, direction, nFrames } = params;

        if (!referenceImageBase64) {
          return NextResponse.json(
            { error: 'VALIDATION_ERROR', message: 'La imagen de referencia es requerida para la animación.' },
            { status: 400 }
          );
        }

        try {
          const referenceImage = Base64Image.fromData({
            type: 'base64',
            base64: referenceImageBase64,
            format: referenceFormat || 'png'
          });

          const result = await client.animateWithText({
            imageSize: { width: width || 64, height: height || 64 },
            description: description || `character performing ${actionName || 'walk'} animation`,
            action: actionName || 'walk',
            negativeDescription: '',
            textGuidanceScale: 7.5,
            imageGuidanceScale: 1.5,
            nFrames: nFrames || 4,
            startFrameIndex: 0,
            view: view || 'side',
            direction: direction || 'south',
            referenceImage,
            initImageStrength: 300,
            seed: Math.floor(Math.random() * 100000)
          });

          return NextResponse.json({
            images: result.images.map(img => img.toJSON()),
            usage: result.usage,
            mocked: false
          });
        } catch (sdkError: any) {
          console.error("PixelLab SDK Animation error (Attempting mock fallback):", sdkError);
          const is402 = sdkError?.status === 402 || sdkError?.message?.includes('balance') || sdkError?.message?.includes('credits') || sdkError?.message?.includes('insuficiente');
          if (is402) {
            return NextResponse.json(getMockResponse('animation'));
          }
          return handleSdkErrors(sdkError);
        }
      }

      default:
        return NextResponse.json(
          { error: 'INVALID_ACTION', message: `Acción '${action}' no soportada.` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Unhandled PixelLab API error:', error);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: error.message || 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}

/**
 * Maps SDK specific errors to readable client responses
 */
function handleSdkErrors(error: any) {
  const errorMessage = error?.message || '';
  const status = error?.status || 500;

  if (errorMessage.includes('balance') || errorMessage.includes('credits') || errorMessage.includes('insuficiente') || status === 402) {
    return NextResponse.json(
      { error: 'INSUFFICIENT_BALANCE', message: 'Saldo o créditos insuficientes en tu cuenta de PixelLab.' },
      { status: 402 }
    );
  }

  if (errorMessage.includes('api key') || errorMessage.includes('unauthorized') || errorMessage.includes('key invalid') || status === 401) {
    return NextResponse.json(
      { error: 'INVALID_API_KEY', message: 'La clave de API (PIXELLAB_SECRET) es inválida o no está autorizada.' },
      { status: 401 }
    );
  }

  if (errorMessage.includes('size') || errorMessage.includes('dimension') || status === 422) {
    return NextResponse.json(
      { error: 'INVALID_PARAMETERS', message: 'Los parámetros de tamaño o configuración no son válidos para PixelLab.' },
      { status: 422 }
    );
  }

  return NextResponse.json(
    { error: 'GENERATION_FAILED', message: `Error en la generación de PixelLab: ${errorMessage}` },
    { status: status >= 400 && status < 600 ? status : 500 }
  );
}
