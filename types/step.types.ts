export interface Step {
  number: number;
  description: string;
}

export interface StepItemResponse {
  id: number;
  step: number;
  text: string;
}

export interface StepPayload {
  step: number;
  text: string;
}