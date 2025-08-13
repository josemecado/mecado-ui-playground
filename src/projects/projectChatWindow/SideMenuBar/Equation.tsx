// ✅ Keep only enums and types — NO imports needed

// Unit enum for equation variables
export enum UnitType {
  Force = "Force",
  Distance = "Distance",
  Distance_squared = "Distance_squared",
  Time = "Time",
  Velocity = "Velocity",
  Acceleration = "Acceleration",
  Mass = "Mass",
  Energy = "Energy",
  Power = "Power",
  Angle = "Angle",
  None = "None",
  Moment = "Moment",
  Moment_of_inertia = "Moment_of_inertia",
  Area_moment_of_inertia = "Area_moment_of_inertia",
  Stress = "Stress",
}

// Reference type for distinguishing between textbook and website references
export enum ReferenceType {
  Textbook = "Textbook",
  Website = "Website",
}

// Base reference interface
export interface BaseReference {
  type: ReferenceType;
  title: string;
  link?: string; // URL to the PDF file or website
}

// Textbook reference
export interface TextbookReference extends BaseReference {
  type: ReferenceType.Textbook;
  page?: number;
  pdfUrl?: string; // For backward compatibility
}

// Website reference
export interface WebsiteReference extends BaseReference {
  type: ReferenceType.Website;
  url?: string; // For backward compatibility
}

// Union type for references
export type Reference = TextbookReference | WebsiteReference;

// ✅ Equation data structure for SideMenu use
export interface Equation {
  latex: string;
  id: string;
  variables?: Record<string, UnitType>;
  varMap?: Record<string, string>;
  description: string;
  reference?: Reference;
  realValues?: Map<string, number>;
  matlab_script?: string;
}
