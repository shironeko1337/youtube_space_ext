# generate en messages.json
# auto translate en to other languagesimport json
from collections import defaultdict
import requests
import sys
import os
import json

# --------------------------- These variables are the input of translate API ----------------------------

messagesLanguage = 'en'

simpleMsg = [
    'delay',
    'contact author'
]

# [key,message]
indexedMsg = [
    ['functionExplain', 'This extension enables space to control youtube videos by waiting for a short period of time after pressing space and see if it works, change the waiting time to adjust this behavior!'],
]

# special case, translation results are already defined
specialCaseMsg = [
    [
        'ms',
        {
            'en': 'ms',
            'zh_TW': '毫秒'  # zh-TW is the language dir
        }
    ],
    [
        'Setting',
        {
            'en': 'Setting',
            'zh_TW': '设置'
        }
    ],
    [
        'extName',
        {
            'en':'Youtube space enabler',
            'zh_TW': 'Youtube 保持空格功能'
        }
    ]
]

# -------------------------------------------------------------------------------------------------------

osEnvAPIKey = 'GCP_APIKEY'
targetDir = 'src/i18n'
outputFile = 'messages.json'
languages = [{
    'code': 'zh-TW',
    'dir': 'zh_TW'
}]
cacheFile = '_i18nGen_cache.json'

def main():
    apiKey = sys.argv[1] if len(sys.argv) == 2 else os.environ[osEnvAPIKey]

    cached = defaultdict() # key = language__message, value = translation
    def getCachedKey(language,message):
        return f'{language}__{message}'
    if os.path.exists(cacheFile):
      with open(cacheFile, 'r') as f:
          cached = json.load(f)

    res = defaultdict(lambda: defaultdict())

    messages = [x for x in simpleMsg] + [v for k, v in indexedMsg]

    for language_config in languages:
        language = language_config['code']
        languageDir = language_config['dir']

        requestIndices,requestMessages = set(),[]

        for i,message in enumerate(messages):
          cacheKey = getCachedKey(language,message)
          if cacheKey not in cached:
              requestMessages += [message]
              requestIndices.add(i)

        if requestMessages:
          response = requests.post('https://translation.googleapis.com/language/translate/v2',
                                  params={
                                      'q': requestMessages,
                                      'target': language,
                                      'source': messagesLanguage,
                                      'key': apiKey
                                  })

          jsonRes = response.json()
          print(f'translation to {language} for {requestMessages}: {jsonRes}')

        j = 0
        for i, message in enumerate(messages):
            cachedKey = getCachedKey(language,message)
            if i in requestIndices:
                translation = jsonRes['data']['translations'][j]['translatedText']
                cached[getCachedKey(language,message)] = translation
                j += 1
            else:
                # skip cached
                translation = cached[cachedKey]
            print(message,translation)
            if i < len(simpleMsg):
                key = simpleMsg[i].replace(' ','_')
                desc = simpleMsg[i]

                upcase, lowercase = key[0].upper(
                ) + key[1:], key[0].lower() + key[1:]
                for _key in set([upcase, lowercase, key]):
                    res[languageDir][_key] = {
                        'message': translation,
                        'desc': desc,
                    }
                    res[messagesLanguage][_key] = {
                        'message': _key,
                        'desc': desc,
                    }
            else:
                i -= len(simpleMsg)
                key = indexedMsg[i][0].replace(' ','_')
                desc = indexedMsg[i][1]

                res[languageDir][key] = {
                    'message': translation,
                    'desc': desc,
                }
                res[messagesLanguage][key] = {
                    'message': desc,
                    'desc': desc,
                }

    for key, v in specialCaseMsg:
        for language, translate in v.items():
            res[language][key] = {
                'message': translate,
                'desc': key
            }

    for languageDir, messages in res.items():
        outputFilePath = f'{targetDir}/{languageDir}/{outputFile}'
        os.makedirs(os.path.dirname(outputFilePath), exist_ok=True)
        with open(outputFilePath, 'w') as f:
            json.dump(messages, f, indent=4)

    with open(cacheFile,'w') as f:
        json.dump(cached,f,indent=1)

if __name__ == '__main__':
    main()
