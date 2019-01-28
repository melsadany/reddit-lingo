import json
import os
import base64
### Example of parsing audio files after the data json has been received from the database.
### Currently, this script expects the data json to be in the same directory you invoke it from.
### Should build a better tool that accepts arguments regarding the json location and what data you
### currently want.

aboslute_path = os.path.dirname(os.path.abspath(__file__))
with open(aboslute_path + '/response_main_test.json') as file:
    read_data = json.loads(file.read())
    for assessment_data in read_data['assessments']:
        if 'recorded_data' in assessment_data['data']:
            recorded_data = assessment_data['data']['recorded_data']
            if type(recorded_data) == list:
                for recording_session in recorded_data:
                    prompt_number = str(recording_session['prompt_number'])
                    with open(aboslute_path + '/testWavFile_' + assessment_data["assess_name"] + '_' + prompt_number + '.wav', 'w') as wavFile:
                        wavFile.write(base64.b64decode(recording_session['recorded_data']))
            else:
                with open(aboslute_path + '/testWavFile_' + assessment_data["assess_name"] + '.wav', 'w') as wavFile:
                    wavFile.write(base64.b64decode(recorded_data))


## base64 source_base64_text_file -d > dest_audio_file
