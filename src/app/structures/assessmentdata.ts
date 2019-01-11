export interface AssessmentData {
  user_id: string;
  assessments: Array<AssessmentDataStructure>;
  google_speech_to_text_assess: Array<GoogleSpeechToTextDataSTructure>;
}

interface AssessmentDataStructure {
  assess_name: string;
  data: object;
  completed: boolean;
}

interface GoogleSpeechToTextDataSTructure {
  assess_name: string;
  data: object;
}
