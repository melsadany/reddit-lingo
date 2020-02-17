/**
 * Assessment data interfaces represent the structure of all data objects
 * that get passed around during the action of taking assessments and saving
 * the results. There are two ways to differentiate who is taking assessments.
 * Hash key fields pertain to single assessment sessions, and user id fields
 * represent full screener sessions. Google speech to text assess structures
 * are there in the event we want to implement some sort of functionality to
 * automatically send our wav files to some API to translate it them from audio to text.
 */

/**
 * Most basic structure for holding assessment data. For full assessment sessions.
 */
export interface AssessmentData {
  /**
   * Unique user id for individual taking this assessment.
   */
  user_id: string;
  /**
   * Array of assessment data collected so far for this user.
   */
  assessments: Array<AssessmentDataStructure>;
  /**
   * Array of google speech to text data collected so far for this user.
   * At this point in time (4/10/19) there is not a concrete plan on utilzing
   * this field.
   */
  google_speech_to_text_assess: Array<GoogleSpeechToTextDataStructure>;
}

/**
 * Lowest level structure to encampsulate assessment data as assessments get completed. The presence of this data
 * is used by the [[StateManagerService]] at startup time to determine assessment progress.
 */
export interface AssessmentDataStructure {
  /**
   * Name of the assessment we have data for.
   */
  assess_name: string;
  /**
   * The data object which holds the primitive assessment data. The exact structure of this object
   * is dependent on the assessment in question, but generally will take on the following form:
   * ```typescript
   * data: { selection_data: this.selectionData }
   * ```
   * or
   * ```typescript
   * data: { recorded_data: this.recordedData }
   * ```
   * Thus there are, in general, two main types of assessments: [[SelectionAssessment]] and [[AudioAssessment]]
   * selectionData and recordedData are both of type array, holding their respective type of assessment's data. The structure
   * their elements are of the form:
   * ```typescript
   * {
   *    prompt_number: this.promptNumber,
   *    recorded_data: currentRecordedBlobAsBase64
   * }
   * ```
   * for [[AudioAssessment]]
   * and
   * ```typescript
   * {
   *    prompt_number: this.promptNumber,
   *    selection_data: currentRecordedBlobAsBase64
   * }
   * ```
   * for [[SelectionAssessment]].
   */
  data: object;
  /**
   * Flag for keeping track of assessment completion. When true, all prompts have been completed for this assessment.
   */
  completed: boolean;
}

export interface GoogleSpeechToTextDataStructure {
  /**
   * Name of the assessment we have the google speech to text data for.
   */
  assess_name: string;
  /**
   * Should be used to contain speedh to text data when implemented.
   */
  data: object;
}

/**
 * Used for single assessment sessions. The hash key is present in the structure as only when a hash key is provided in the
 * intial url will an assessment user be using this structure.
 */
export interface HashKeyAssessmentData {
  /**
   * The hash key value for this single assessment user.
   */
  hash_key: string;
  /**
   * Array of assessment data collected so far for this user.
   */
  assessments: Array<AssessmentDataStructure>;
  /**
   * Array of google speech to text data collected so far for this user.
   * At this point in time (4/10/19) there is not a concrete plan on utilzing
   * this field.
   */
  google_speech_to_text_assess: Array<GoogleSpeechToTextDataStructure>;
}

export interface SingleAssessmentData {
  /**
   * The hash key value for this single assessment user.
   */
  hash_key: string;
  /**
   * Array of assessment data collected so far for this user.
   */
  assessments: Array<AssessmentDataStructure>;
  /**
   * Array of google speech to text data collected so far for this user.
   * At this point in time (4/10/19) there is not a concrete plan on utilzing
   * this field.
   */
  google_speech_to_text_assess: Array<GoogleSpeechToTextDataStructure>;
}

/**
 * Structure for holding assessments asset data for the assessments UI. This is used to programatically determine how many
 * assets are present in the corresponding assessment folder at run time to prevent hard coding how many prompts we want
 * an assessment to have.
 */
export interface AssetsObject {
  audioInstruction: string;
  /**
   * Object that contains keys that correpsond to prompt numbers and values which
   * correspond to a list of the file paths of the assets need for the prompt. This
   * structure is independent of the form of assessment.
   */
  promptStructure: Object;
  /**
   * Number representing the number of prompts for the assessment.
   */
  assetsLength: number;
}
