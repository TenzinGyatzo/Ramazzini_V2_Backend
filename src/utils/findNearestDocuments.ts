import { NotFoundException } from '@nestjs/common';

export function findNearestDocument(
  documents: any[],
  referenceDate: string,
  dateKey: string,
): any {
  if (!documents || documents.length === 0) {
    throw new NotFoundException(
      `No se encontraron documentos para el tipo especificado`,
    );
  }

  // Convertir la fecha de referencia a un formato Date
  const refDate = new Date(referenceDate);

  // Buscar el documento más cercano
  return documents.reduce((nearest, current) => {
    const diffNearest = Math.abs(
      refDate.getTime() - new Date(nearest[dateKey]).getTime(),
    );
    const diffCurrent = Math.abs(
      refDate.getTime() - new Date(current[dateKey]).getTime(),
    );

    return diffCurrent < diffNearest ? current : nearest;
  });
}
