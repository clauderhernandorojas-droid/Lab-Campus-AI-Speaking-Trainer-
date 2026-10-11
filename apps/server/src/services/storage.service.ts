import { supabaseAdmin } from '../config/supabase.js';

export class StorageService {
  private bucketName = 'audio-submissions';

  /**
   * Sube el buffer del archivo de audio al bucket de Supabase Storage.
   * Retorna la URL pública accesible.
   */
  async uploadAudio(
    audioBuffer: Buffer,
    studentId: string,
    extension = 'webm',
    mimeType = 'audio/webm'
  ): Promise<string> {
    const timestamp = Date.now();
    const filePath = `${studentId}/${timestamp}.${extension}`;

    if (!supabaseAdmin) {
      console.warn('⚠️ StorageService: Supabase no disponible, retornando URL simulada.');
      return `https://storage.supabase.local/audio-submissions/${filePath}`;
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from(this.bucketName)
      .upload(filePath, audioBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error al subir audio a Supabase Storage:', uploadError);
      throw new Error(`Storage upload error: ${uploadError.message}`);
    }

    // Obtener URL pública
    const { data } = supabaseAdmin.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}

export const storageService = new StorageService();
