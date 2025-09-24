// hooks/useVersionFiles.ts
import { useState, useEffect } from "react";

interface FileItem {
  name: string;
  path: string;
}

interface VersionLabel {
  label: string;
  num: number;
}

interface UseVersionFilesReturn {
  uploadedFilesByVersion: Map<number, FileItem[]>;
  generatedFilesByVersion: Map<number, FileItem[]>;
  isLoading: boolean;
  error: string | null;
}

export const useVersionFiles = (
  projectId: string,
  sortedVersions: VersionLabel[],
  uploadedFilesRefreshKey?: number,
  generatedDocsRefreshKey?: number
): UseVersionFilesReturn => {
  const [uploadedFilesByVersion, setUploadedFilesByVersion] = useState<Map<number, FileItem[]>>(
    new Map()
  );
  const [generatedFilesByVersion, setGeneratedFilesByVersion] = useState<Map<number, FileItem[]>>(
    new Map()
  );
  const [loadingFiles, setLoadingFiles] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadFilesForVersion = async (versionNum: number) => {
      if (!projectId || loadingFiles.has(versionNum)) return;

      setLoadingFiles((prev) => new Set(prev).add(versionNum));
      setError(null);

      try {
        const [uploaded, generated] = await Promise.all([
          window.projectAPI.files.listUploadedFiles(projectId, versionNum).catch((error) => {
            console.warn(`Failed to load uploaded files for version ${versionNum}:`, error);
            return [];
          }),
          window.projectAPI.files.listGeneratedDocumentation(projectId, versionNum).catch((error) => {
            console.warn(`Failed to load generated files for version ${versionNum}:`, error);
            return [];
          }),
        ]);

        if (!mounted) return;

        setUploadedFilesByVersion((prev) => new Map(prev).set(versionNum, uploaded || []));
        setGeneratedFilesByVersion((prev) => new Map(prev).set(versionNum, generated || []));
      } catch (error) {
        console.error(`Error loading files for version ${versionNum}:`, error);
        if (!mounted) return;

        setError(`Failed to load files for version ${versionNum}`);
        // Set empty arrays as fallback
        setUploadedFilesByVersion((prev) => new Map(prev).set(versionNum, []));
        setGeneratedFilesByVersion((prev) => new Map(prev).set(versionNum, []));
      } finally {
        setLoadingFiles((prev) => {
          const next = new Set(prev);
          next.delete(versionNum);
          return next;
        });
      }
    };

    // Load files for all versions
    sortedVersions.forEach((v) => loadFilesForVersion(v.num));

    return () => {
      mounted = false;
    };
  }, [projectId, sortedVersions, uploadedFilesRefreshKey, generatedDocsRefreshKey]);

  return {
    uploadedFilesByVersion,
    generatedFilesByVersion,
    isLoading: loadingFiles.size > 0,
    error,
  };
};