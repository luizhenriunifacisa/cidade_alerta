/**
 * Extrai coordenadas GPS dos metadados EXIF de uma imagem.
 * Fotos tiradas com celular geralmente contêm dados de geolocalização embutidos.
 *
 * Lê o EXIF diretamente do ArrayBuffer do arquivo sem dependências externas.
 */

/**
 * Converte graus/minutos/segundos (DMS) EXIF para decimal.
 * @param {number[]} dms - Array [graus, minutos, segundos] como valores racionais
 * @param {string} ref - Referência: 'N', 'S', 'E', 'W'
 * @returns {number}
 */
function dmsParaDecimal(graus, minutos, segundos, ref) {
  let decimal = graus + minutos / 60 + segundos / 3600;
  if (ref === 'S' || ref === 'W') {
    decimal = -decimal;
  }
  return decimal;
}

/**
 * Lê um valor racional EXIF (numerador/denominador) de um DataView.
 */
function lerRacional(dataView, offset, littleEndian) {
  const numerador = dataView.getUint32(offset, littleEndian);
  const denominador = dataView.getUint32(offset + 4, littleEndian);
  return denominador === 0 ? 0 : numerador / denominador;
}

/**
 * Extrai coordenadas GPS de um arquivo de imagem.
 * @param {File} arquivo - Arquivo de imagem (JPEG)
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export async function extrairGpsDoExif(arquivo) {
  try {
    const buffer = await arquivo.arrayBuffer();
    const dataView = new DataView(buffer);

    // Verificar se é JPEG (FFD8)
    if (dataView.getUint16(0) !== 0xffd8) {
      return null;
    }

    let offset = 2;
    const length = dataView.byteLength;

    while (offset < length) {
      if (offset + 4 > length) break;

      const marker = dataView.getUint16(offset);
      offset += 2;

      // APP1 marker (EXIF)
      if (marker === 0xffe1) {
        const segmentLength = dataView.getUint16(offset);
        offset += 2;

        // Verificar "Exif\0\0"
        const exifHeader =
          dataView.getUint32(offset) === 0x45786966 &&
          dataView.getUint16(offset + 4) === 0x0000;

        if (!exifHeader) return null;

        const tiffOffset = offset + 6;
        const byteOrder = dataView.getUint16(tiffOffset);
        const littleEndian = byteOrder === 0x4949; // 'II' = little-endian

        // Verificar magic number 42
        if (dataView.getUint16(tiffOffset + 2, littleEndian) !== 0x002a) {
          return null;
        }

        const firstIFDOffset =
          dataView.getUint32(tiffOffset + 4, littleEndian) + tiffOffset;

        // Procurar o IFD de GPS
        const gpsIFDOffset = encontrarTagNoIFD(
          dataView,
          firstIFDOffset,
          tiffOffset,
          0x8825, // GPSInfoIFDPointer
          littleEndian
        );

        if (!gpsIFDOffset) return null;

        const gpsOffset = gpsIFDOffset + tiffOffset;

        // Ler as tags GPS
        return lerTagsGPS(dataView, gpsOffset, tiffOffset, littleEndian);
      } else if ((marker & 0xff00) === 0xff00) {
        // Outro segmento, pular
        if (offset + 2 > length) break;
        const segLen = dataView.getUint16(offset);
        offset += segLen;
      } else {
        break;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Procura uma tag específica num IFD e retorna seu valor como offset.
 */
function encontrarTagNoIFD(dataView, ifdOffset, tiffOffset, tagId, littleEndian) {
  try {
    const numEntries = dataView.getUint16(ifdOffset, littleEndian);

    for (let i = 0; i < numEntries; i++) {
      const entryOffset = ifdOffset + 2 + i * 12;
      const tag = dataView.getUint16(entryOffset, littleEndian);

      if (tag === tagId) {
        return dataView.getUint32(entryOffset + 8, littleEndian);
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Lê as tags GPS do IFD de GPS.
 */
function lerTagsGPS(dataView, gpsIFDOffset, tiffOffset, littleEndian) {
  try {
    const numEntries = dataView.getUint16(gpsIFDOffset, littleEndian);

    let latRef = null;
    let latValues = null;
    let lonRef = null;
    let lonValues = null;

    for (let i = 0; i < numEntries; i++) {
      const entryOffset = gpsIFDOffset + 2 + i * 12;
      const tag = dataView.getUint16(entryOffset, littleEndian);
      const type = dataView.getUint16(entryOffset + 2, littleEndian);
      const valueOffset = dataView.getUint32(entryOffset + 8, littleEndian);

      switch (tag) {
        case 0x0001: // GPSLatitudeRef ('N' ou 'S')
          latRef = String.fromCharCode(dataView.getUint8(entryOffset + 8));
          break;

        case 0x0002: // GPSLatitude (3 racionais)
          {
            const off = valueOffset + tiffOffset;
            latValues = [
              lerRacional(dataView, off, littleEndian),
              lerRacional(dataView, off + 8, littleEndian),
              lerRacional(dataView, off + 16, littleEndian),
            ];
          }
          break;

        case 0x0003: // GPSLongitudeRef ('E' ou 'W')
          lonRef = String.fromCharCode(dataView.getUint8(entryOffset + 8));
          break;

        case 0x0004: // GPSLongitude (3 racionais)
          {
            const off = valueOffset + tiffOffset;
            lonValues = [
              lerRacional(dataView, off, littleEndian),
              lerRacional(dataView, off + 8, littleEndian),
              lerRacional(dataView, off + 16, littleEndian),
            ];
          }
          break;
      }
    }

    if (latRef && latValues && lonRef && lonValues) {
      const latitude = dmsParaDecimal(latValues[0], latValues[1], latValues[2], latRef);
      const longitude = dmsParaDecimal(lonValues[0], lonValues[1], lonValues[2], lonRef);

      // Validar se são coordenadas válidas
      if (
        Math.abs(latitude) <= 90 &&
        Math.abs(longitude) <= 180 &&
        (latitude !== 0 || longitude !== 0)
      ) {
        return { latitude, longitude };
      }
    }

    return null;
  } catch {
    return null;
  }
}
