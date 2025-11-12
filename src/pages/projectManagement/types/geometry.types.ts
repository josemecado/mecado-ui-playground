// Shared types for geometry data
export interface GeometryData {
  bodiesFile: ArrayBuffer;
  facesFile: ArrayBuffer;
  edgesFile: ArrayBuffer;
  fileName?: string;
}