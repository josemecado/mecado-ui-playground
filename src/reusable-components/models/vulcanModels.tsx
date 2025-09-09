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
    Website = "Website"
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

// Equation data structure for handcalc messages
export interface Equation {
    latex: string;
    id: string; // unique identifier (_id) in mongo
    variables?: Record<string, UnitType>;
    varMap?: Record<string, string>; // map latex vars to mathjs vars
    description: string; // Description for each equation
    reference?: Reference; // Reference to either a textbook or website
    realValues?: Map<string, number>; // map latex vars to hardcoded values
    matlab_script?: string; // MATLAB script representation of the equation
    matlab_script_non_symbolic?: string;
}

export interface EquationRelativesResponse {
    prerequisites: Equation[];
    followUps: Equation[];
}