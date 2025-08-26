// A class implementing GeometrySelectable

// --- Generic selection contract (tiny + reusable) --------------------
export type ElementType = "face" | "edge" | "body";

export interface Selections {
  faces: number[];
  edges: number[];
  bodies: number[];
}
export type PartialSelections = Partial<Selections>;

export interface GeometrySelectable<TId = string> {
  getSelections(): Selections;
  addSelections?(delta: PartialSelections): Selections | void;
  removeSelections?(delta: PartialSelections): Selections | void;
  getId?(): TId;
  getName?(): string;
}
export function isGeometrySelectable(x: unknown): x is GeometrySelectable {
  return !!x && typeof (x as any).getSelections === "function";
}

// --- HandCalcInstance: now a CLASS that implements GeometrySelectable --
export class HandCalcInstance implements GeometrySelectable<string> {
  constructor(
    public id: string,
    public name: string,
    public variables: HandCalcInstanceVariable[],
    public latex: string,
    public parentHandCalcId: string,
    public isEditing: boolean,
    public isMarkedForDeletion: boolean,
    public selectedFaces: number[] = [],
    public selectedEdges: number[] = [],
    public selectedBodies: number[] = [],
    public connections: HandCalcInstanceVariableConnection[] = []
  ) {}

  /** Convenient factory for turning a plain DTO into an instance with methods. */
  static from(obj: {
    id: string;
    name: string;
    variables: HandCalcInstanceVariable[];
    latex: string;
    parentHandCalcId: string;
    isEditing: boolean;
    isMarkedForDeletion: boolean;
    selectedFaces?: number[];
    selectedEdges?: number[];
    selectedBodies?: number[];
    connections?: HandCalcInstanceVariableConnection[];
  }) {
    return new HandCalcInstance(
      obj.id,
      obj.name,
      obj.variables,
      obj.latex,
      obj.parentHandCalcId,
      obj.isEditing,
      obj.isMarkedForDeletion,
      obj.selectedFaces ?? [],
      obj.selectedEdges ?? [],
      obj.selectedBodies ?? [],
      obj.connections ?? []
    );
  }

  // ---- GeometrySelectable implementation ---------------------------
  getSelections(): Selections {
    return {
      faces: this.selectedFaces,
      edges: this.selectedEdges,
      bodies: this.selectedBodies,
    };
  }

  addSelections(delta: PartialSelections): Selections {
    if (delta.faces)  this.selectedFaces  = mergeUnique(this.selectedFaces,  delta.faces);
    if (delta.edges)  this.selectedEdges  = mergeUnique(this.selectedEdges,  delta.edges);
    if (delta.bodies) this.selectedBodies = mergeUnique(this.selectedBodies, delta.bodies);
    return this.getSelections();
  }

  removeSelections(delta: PartialSelections): Selections {
    if (delta.faces)  this.selectedFaces  = subtract(this.selectedFaces,  delta.faces);
    if (delta.edges)  this.selectedEdges  = subtract(this.selectedEdges,  delta.edges);
    if (delta.bodies) this.selectedBodies = subtract(this.selectedBodies, delta.bodies);
    return this.getSelections();
  }

  // Optional identity helpers (nice for logs/debug):
  getId()   { return this.id; }
  getName() { return this.name; }
}