export interface AssessmentData {
  user_id: string;
  assessments: Array<AssessmentDataStructure>;
  google_speech_to_text_assess: Array<GoogleSpeechToTextDataStructure>;
}

export interface AssessmentDataStructure {
  assess_name: string;
  data: object;
  completed: boolean;
}

export interface GoogleSpeechToTextDataStructure {
  assess_name: string;
  data: object;
}

export interface SingleAssessmentData {
  hash_key: string;
  assessments: Array<AssessmentDataStructure>;
  google_speech_to_text_assess: Array<GoogleSpeechToTextDataStructure>;
}

export interface AssetsObject {
  promptStructure: Object;
  assetsLength: number;
}
