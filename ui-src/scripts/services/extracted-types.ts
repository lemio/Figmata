// This file imports the auto-generated type definitions
import { EXTRACTED_TYPES, ExtractedTypes } from './extracted-types-generated';

export { ExtractedTypes };

export const getExtractedTypes = (): ExtractedTypes => {
  try {
    return EXTRACTED_TYPES;
  } catch (error) {
    console.warn('Failed to load extracted types, using fallback:', error);
    // Fallback if types are not available
    return {
      figma: '// Figma types not available',
      d3: '// D3 types not available'
    };
  }
};
