// Simple version relationship structure: versionId -> array of child version IDs
export type SimpleVersionRelationshipMap = {
  [projectId: string]: {
    [versionId: string]: string[];  // childVersionIds
  };
};

// Archive map structure: track which versions are archived
export type VersionArchiveMap = {
  [projectId: string]: {
    [versionId: string]: boolean; // true if archived
  };
};

// utils/simpleVersionRelationshipStorage.ts
const STORAGE_KEY = 'version_relationships';
const ARCHIVE_KEY = 'version_archives';

export class SimpleVersionRelationshipStorage {
  /**
   * Get the relationship map from localStorage
   */
  static getRelationshipMap(): SimpleVersionRelationshipMap {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to parse version relationships:', error);
      return {};
    }
  }

  /**
   * Save the relationship map to localStorage
   */
  static saveRelationshipMap(map: SimpleVersionRelationshipMap): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map, null, 2));
    } catch (error) {
      console.error('Failed to save version relationships:', error);
    }
  }

  /**
   * Get the archive map from localStorage
   */
  static getArchiveMap(): VersionArchiveMap {
    try {
      const stored = localStorage.getItem(ARCHIVE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to parse version archives:', error);
      return {};
    }
  }

  /**
   * Save the archive map to localStorage
   */
  static saveArchiveMap(map: VersionArchiveMap): void {
    try {
      localStorage.setItem(ARCHIVE_KEY, JSON.stringify(map, null, 2));
    } catch (error) {
      console.error('Failed to save version archives:', error);
    }
  }

  /**
   * Archive a version (mark as archived without deleting)
   */
  static archiveVersion(projectId: string, versionId: string): void {
    const archiveMap = this.getArchiveMap();
    
    if (!archiveMap[projectId]) {
      archiveMap[projectId] = {};
    }
    
    archiveMap[projectId][versionId] = true;
    this.saveArchiveMap(archiveMap);
    console.log(`Archived version ${versionId} in project ${projectId}`);
  }

  /**
   * Unarchive a version
   */
  static unarchiveVersion(projectId: string, versionId: string): void {
    const archiveMap = this.getArchiveMap();
    
    if (archiveMap[projectId] && archiveMap[projectId][versionId]) {
      delete archiveMap[projectId][versionId];
      this.saveArchiveMap(archiveMap);
      console.log(`Unarchived version ${versionId} in project ${projectId}`);
    }
  }

  /**
   * Check if a version is archived
   */
  static isVersionArchived(projectId: string, versionId: string): boolean {
    const archiveMap = this.getArchiveMap();
    return archiveMap[projectId]?.[versionId] === true;
  }

  /**
   * Get all archived version IDs for a project
   */
  static getArchivedVersions(projectId: string): string[] {
    const archiveMap = this.getArchiveMap();
    if (!archiveMap[projectId]) return [];
    
    return Object.keys(archiveMap[projectId]).filter(
      versionId => archiveMap[projectId][versionId] === true
    );
  }

  /**
   * Toggle archive status of a version
   */
  static toggleVersionArchive(projectId: string, versionId: string): boolean {
    const isCurrentlyArchived = this.isVersionArchived(projectId, versionId);
    
    if (isCurrentlyArchived) {
      this.unarchiveVersion(projectId, versionId);
      return false;
    } else {
      this.archiveVersion(projectId, versionId);
      return true;
    }
  }

  /**
   * Get relationships for a specific project, with fallback to mock data
   */
  static getProjectRelationships(projectId: string): Record<string, string[]> {
    const map = this.getRelationshipMap();
    
    // If no relationships exist for this project, return mock data
    if (!map[projectId] || Object.keys(map[projectId]).length === 0) {
      return this.getMockRelationships();
    }
    
    return map[projectId];
  }

  /**
   * Get mock relationships for testing (v1-v10 with some branching)
   */
  static getMockRelationships(): Record<string, string[]> {
    return {
      "v1": ["v2", "v3"],    // v1 branches to v2 and v3
      "v2": ["v4"],          // v2 continues to v4
      "v3": ["v5"],          // v3 continues to v5
      "v4": ["v6"],          // v4 continues to v6
      "v5": ["v7", "v8"],    // v5 branches to v7 and v8
      "v6": [],              // v6 is end of branch
      "v7": ["v9"],          // v7 continues to v9
      "v8": ["v10"],         // v8 continues to v10
      "v9": [],              // v9 is end of branch
      "v10": []              // v10 is end of branch
    };
  }

  /**
   * Compute parent version ID for a given version by looking through all relationships
   */
  static getParentVersionId(projectId: string, versionId: string): string | null {
    const relationships = this.getProjectRelationships(projectId);
    
    // Find which version has this versionId as a child
    for (const [parentId, childIds] of Object.entries(relationships)) {
      if (childIds.includes(versionId)) {
        return parentId;
      }
    }
    
    return null; // No parent found (root version)
  }

  /**
   * Get child version IDs for a specific version
   */
  static getChildVersionIds(projectId: string, versionId: string): string[] {
    const relationships = this.getProjectRelationships(projectId);
    return relationships[versionId] || [];
  }

  /**
   * Initialize default sequential relationships for a project
   */
  static initializeSequentialRelationships(projectId: string, versionIds: string[]): void {
    const map = this.getRelationshipMap();
    
    if (!map[projectId]) {
      map[projectId] = {};
    }
    
    const sorted = [...versionIds].sort();
    
    // Create simple sequential chain: each version points to the next one
    sorted.forEach((versionId, index) => {
      const nextVersion = index < sorted.length - 1 ? sorted[index + 1] : null;
      map[projectId][versionId] = nextVersion ? [nextVersion] : [];
    });
    
    this.saveRelationshipMap(map);
  }

  /**
   * Delete a version and update all relationships
   * Handles re-parenting of orphaned children
   */
  static deleteVersion(projectId: string, versionId: string): void {
    const map = this.getRelationshipMap();
    
    if (!map[projectId]) {
      console.warn(`No relationships found for project ${projectId}`);
      return;
    }

    const relationships = map[projectId];
    
    // Find the parent of the version being deleted
    const parentId = this.getParentVersionId(projectId, versionId);
    
    // Get children of the version being deleted
    const childrenIds = relationships[versionId] || [];
    
    // Re-parent orphaned children to the deleted version's parent
    if (parentId && childrenIds.length > 0) {
      // Add orphaned children to the parent's children list
      if (!relationships[parentId]) {
        relationships[parentId] = [];
      }
      
      // Add children that aren't already in the parent's list
      childrenIds.forEach(childId => {
        if (!relationships[parentId].includes(childId)) {
          relationships[parentId].push(childId);
        }
      });
      
      console.log(`Re-parented ${childrenIds.length} children from ${versionId} to ${parentId}`);
    } else if (!parentId && childrenIds.length > 0) {
      // If deleted version was a root, children become new roots (no parent)
      console.log(`Version ${versionId} was a root. Its ${childrenIds.length} children are now roots.`);
    }
    
    // Remove the version from its parent's children list
    if (parentId && relationships[parentId]) {
      relationships[parentId] = relationships[parentId].filter(id => id !== versionId);
    }
    
    // Remove the version's own entry
    delete relationships[versionId];
    
    // Clean up any other references to this version (in case of data inconsistency)
    Object.keys(relationships).forEach(key => {
      if (relationships[key] && Array.isArray(relationships[key])) {
        relationships[key] = relationships[key].filter(id => id !== versionId);
      }
    });
    
    // Save updated map
    this.saveRelationshipMap(map);
    console.log(`Deleted version ${versionId} from project ${projectId} relationships`);
  }

  /**
   * Delete an entire project and all its relationships
   */
  static deleteProject(projectId: string): void {
    const map = this.getRelationshipMap();
    
    if (!map[projectId]) {
      console.warn(`No relationships found for project ${projectId}`);
      return;
    }
    
    // Remove the entire project entry
    delete map[projectId];
    
    // Save updated map
    this.saveRelationshipMap(map);
    console.log(`Deleted all relationships for project ${projectId}`);
  }

  /**
   * Batch delete multiple versions from a project
   */
  static deleteVersions(projectId: string, versionIds: string[]): void {
    if (!versionIds || versionIds.length === 0) {
      return;
    }
    
    console.log(`Batch deleting ${versionIds.length} versions from project ${projectId}`);
    
    // Delete each version individually to maintain relationship integrity
    versionIds.forEach(versionId => {
      this.deleteVersion(projectId, versionId);
    });
  }

  /**
   * Clean up orphaned relationships (versions that reference non-existent versions)
   */
  static cleanupOrphanedRelationships(projectId: string, validVersionIds: string[]): void {
    const map = this.getRelationshipMap();
    
    if (!map[projectId]) {
      return;
    }
    
    const relationships = map[projectId];
    const validSet = new Set(validVersionIds);
    let cleanupCount = 0;
    
    // Remove entries for non-existent versions
    Object.keys(relationships).forEach(versionId => {
      if (!validSet.has(versionId)) {
        delete relationships[versionId];
        cleanupCount++;
      }
    });
    
    // Clean up children lists to only include valid versions
    Object.keys(relationships).forEach(versionId => {
      const originalLength = relationships[versionId].length;
      relationships[versionId] = relationships[versionId].filter(childId => validSet.has(childId));
      
      if (originalLength !== relationships[versionId].length) {
        cleanupCount += originalLength - relationships[versionId].length;
      }
    });
    
    if (cleanupCount > 0) {
      this.saveRelationshipMap(map);
      console.log(`Cleaned up ${cleanupCount} orphaned relationships in project ${projectId}`);
    }
  }
}