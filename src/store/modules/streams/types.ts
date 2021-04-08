import { Section } from "../sections/types";

export interface StreamResponse {
  id: string;
  section: Section;
  streamUrl: string;
  viewUrl: string;
}